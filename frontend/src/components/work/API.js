import {API_BASE} from "./Constants";

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
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch(`${API_BASE}/api/portfolio/${uploadKey}`, {
        method: "POST",
        body: formData,
    });

    const result = await readResponse(response);

    if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
    }

    return result;
}

export async function deletePortfolioFile(uploadKey, filename) {
    const response = await fetch(
        `${API_BASE}/api/portfolio/${uploadKey}/${encodeURIComponent(filename)}`,
        {method: "DELETE"},
    );

    const result = await readResponse(response);

    if (!response.ok) {
        throw new Error(result.error || "Could not delete the file.");
    }

    return result;
}
