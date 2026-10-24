import {API_BASE} from "./Constants";

// Ask for the admin token once per browser tab and remember it.
function getAdminToken() {
    let token = sessionStorage.getItem("adminToken");

    if (!token) {
        token = window.prompt("Enter admin token to continue:") || "";
        if (token) sessionStorage.setItem("adminToken", token);
    }

    return token;
}

// Normalize every file returned by the backend into one consistent format.
function normalizePortfolioFile(file, uploadKey) {
    const filename = file.filename || file.storedName || file.name || "";

    let src = file.src || file.url || file.path || "";

    if (src && !/^https?:\/\//i.test(src)) {
        src = `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
    }

    if (!src && filename) {
        src =
            `${API_BASE}/portfolio-uploads/${uploadKey}/` +
            encodeURIComponent(filename);
    }

    const originalName = file.originalName || file.originalname || filename;

    return {
        ...file,
        filename,
        originalName,
        title: file.title || originalName.replace(/\.[^/.]+$/, "") || filename,
        src,
        uploaded: true,
    };
}

async function readResponse(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {error: text};
    }
}

// Throws a clear error, and forgets a wrong token so the user is asked again.
function assertOk(response, data, fallbackMessage) {
    if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        throw new Error("Wrong or missing admin token.");
    }

    if (!response.ok) {
        throw new Error(data.error || fallbackMessage);
    }
}

export async function fetchPortfolioFiles(uploadKey) {
    const response = await fetch(`${API_BASE}/api/portfolio/${uploadKey}`, {
        cache: "no-store",
    });

    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(
            data.error || `Could not load files (${response.status})`,
        );
    }

    const files = Array.isArray(data)
        ? data
        : Array.isArray(data.files)
          ? data.files
          : null;

    if (!files) {
        throw new Error("The portfolio API did not return a valid file list.");
    }

    return files.map((file) => normalizePortfolioFile(file, uploadKey));
}

export async function uploadPortfolioFiles(uploadKey, files) {
    const token = getAdminToken();
    if (!token) throw new Error("Admin token is required to upload.");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`${API_BASE}/api/portfolio/${uploadKey}`, {
        method: "POST",
        headers: {"x-admin-token": token}, // don't set Content-Type for FormData
        body: formData,
    });

    const result = await readResponse(response);
    assertOk(response, result, "Upload failed.");

    return result;
}

export async function deletePortfolioFile(uploadKey, filename) {
    const token = getAdminToken();
    if (!token) throw new Error("Admin token is required to delete.");

    const response = await fetch(
        `${API_BASE}/api/portfolio/${uploadKey}/${encodeURIComponent(filename)}`,
        {
            method: "DELETE",
            headers: {"x-admin-token": token},
        },
    );

    const result = await readResponse(response);
    assertOk(response, result, "Could not delete the file.");

    return result;
}
