const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uploadRoot = path.join(__dirname, "uploads", "portfolio");

// Metadata is stored outside the public uploads directory.
const metadataRoot = path.join(__dirname, "uploads", "portfolio-metadata");

const categories = {
    "brand-identity": "pdf",
    "print-work": "image",
    hollywood: "image",
    software: "video",
};

fs.mkdirSync(uploadRoot, {recursive: true});
fs.mkdirSync(metadataRoot, {recursive: true});

function getCategory(req, res, next) {
    if (!Object.hasOwn(categories, req.params.category)) {
        return res.status(400).json({
            error: "Invalid portfolio category",
        });
    }

    next();
}

function categoryFolder(category) {
    return path.join(uploadRoot, category);
}

function metadataFile(category) {
    return path.join(metadataRoot, `${category}.json`);
}

function readMetadata(category) {
    const file = metadataFile(category);

    if (!fs.existsSync(file)) {
        return {};
    }

    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));

        return data && typeof data === "object" && !Array.isArray(data)
            ? data
            : {};
    } catch (error) {
        console.error("Could not read portfolio metadata:", error.message);
        throw new Error(`Metadata for ${category} is invalid. Check ${file}`);
    }
}

function writeMetadata(category, metadata) {
    const file = metadataFile(category);
    const tempFile = `${file}.${crypto.randomUUID()}.tmp`;

    fs.writeFileSync(tempFile, JSON.stringify(metadata, null, 2), "utf8");
    fs.renameSync(tempFile, file);
}

function toPublicFile(category, filename, metadata) {
    const details = metadata[filename] || {};
    const storedExtension = path.extname(filename);
    const originalName = details.originalName || filename;

    return {
        filename,
        originalName,
        title:
            details.title ||
            path.basename(originalName, path.extname(originalName)),
        mimeType: details.mimeType || null,
        size: details.size || null,
        uploadedAt: details.uploadedAt || null,
        src: `/portfolio-uploads/${category}/` + encodeURIComponent(filename),
        uploaded: true,
    };
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const folder = categoryFolder(req.params.category);
        fs.mkdirSync(folder, {recursive: true});
        callback(null, folder);
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        callback(null, `${crypto.randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: {
        files: 50,
        fileSize: 100 * 1024 * 1024,
    },

    fileFilter: (req, file, callback) => {
        const type = categories[req.params.category];

        const valid =
            type === "pdf"
                ? file.mimetype === "application/pdf"
                : type === "image"
                  ? file.mimetype.startsWith("image/")
                  : file.mimetype.startsWith("video/");

        if (!valid) {
            return callback(
                new Error(`Unsupported file type: ${file.originalname}`),
            );
        }

        callback(null, true);
    },
});

// Serve only actual uploaded files.
app.use("/portfolio-uploads", express.static(uploadRoot));

// GET: list every saved file in the requested category.
app.get("/api/portfolio/:category", getCategory, (req, res, next) => {
    try {
        const {category} = req.params;
        const folder = categoryFolder(category);

        fs.mkdirSync(folder, {recursive: true});

        const metadata = readMetadata(category);

        const files = fs
            .readdirSync(folder, {withFileTypes: true})
            .filter((entry) => entry.isFile())
            .map((entry) => toPublicFile(category, entry.name, metadata));

        // Stable ordering for consistent UI display.
        files.sort((a, b) =>
            a.title.localeCompare(b.title, undefined, {
                sensitivity: "base",
            }),
        );

        res.set("Cache-Control", "no-store");
        res.json(files);
    } catch (error) {
        next(error);
    }
});

// POST: add new files without removing existing files.
app.post(
    "/api/portfolio/:category",
    getCategory,
    (req, res, next) => {
        upload.array("files", 50)(req, res, (error) => {
            if (error) return next(error);
            next();
        });
    },
    (req, res, next) => {
        try {
            const {category} = req.params;
            const metadata = readMetadata(category);

            for (const file of req.files || []) {
                metadata[file.filename] = {
                    originalName: file.originalname,
                    title: path.basename(
                        file.originalname,
                        path.extname(file.originalname),
                    ),
                    mimeType: file.mimetype,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                };
            }

            writeMetadata(category, metadata);

            const files = (req.files || []).map((file) =>
                toPublicFile(category, file.filename, metadata),
            );

            res.status(201).json({files});
        } catch (error) {
            next(error);
        }
    },
);

// DELETE: remove one file and its metadata.
app.delete(
    "/api/portfolio/:category/:filename",
    getCategory,
    (req, res, next) => {
        try {
            const {category, filename} = req.params;

            if (
                filename !== path.basename(filename) ||
                !/^[\w-]+\.[a-zA-Z0-9]+$/.test(filename)
            ) {
                return res.status(400).json({
                    error: "Invalid filename",
                });
            }

            const filePath = path.join(categoryFolder(category), filename);

            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                return res.status(404).json({
                    error: "File not found",
                });
            }

            fs.unlinkSync(filePath);

            const metadata = readMetadata(category);
            delete metadata[filename];
            writeMetadata(category, metadata);

            res.json({message: "File deleted", filename});
        } catch (error) {
            next(error);
        }
    },
);

// Handle upload, metadata and server errors.
app.use((error, req, res, next) => {
    console.error(error.stack || error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(400).json({
        error: error.message || "Portfolio request failed",
    });
});

app.listen(PORT, () => {
    console.log(`Portfolio backend running at http://localhost:${PORT}`);
});
