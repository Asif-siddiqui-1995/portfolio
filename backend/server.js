require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Comma-separated list of allowed frontend origins, e.g.
// FRONTEND_URL=https://your-app.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow tools like curl/Postman (no origin), and everything if
            // FRONTEND_URL is not set (useful for local development).
            if (
                !origin ||
                allowedOrigins.length === 0 ||
                allowedOrigins.includes(origin.replace(/\/$/, ""))
            ) {
                return callback(null, true);
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
    }),
);
app.use(express.json());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const ROOT_FOLDER = "portfolio";

const categories = {
    "brand-identity": "pdf",
    "print-work": "image",
    hollywood: "image",
    software: "video",
};

// Cloudinary resource types: PDFs are stored as "raw" so they download/render as-is.
const resourceTypes = {
    pdf: "raw",
    image: "image",
    video: "video",
};

function getCategory(req, res, next) {
    if (!Object.hasOwn(categories, req.params.category)) {
        return res.status(400).json({
            error: "Invalid portfolio category",
        });
    }

    next();
}

function categoryFolder(category) {
    return `${ROOT_FOLDER}/${category}`;
}

function resourceTypeFor(category) {
    return resourceTypes[categories[category]];
}

// Convert a Cloudinary resource into the same shape the frontend uses.
function toPublicFile(resource) {
    const filename = resource.public_id.split("/").pop();
    const custom = (resource.context && resource.context.custom) || {};
    const originalName = custom.originalName || filename;

    return {
        filename,
        originalName,
        title:
            custom.title ||
            path.basename(originalName, path.extname(originalName)),
        mimeType: custom.mimeType || null,
        size: resource.bytes || null,
        uploadedAt: resource.created_at || null,
        src: resource.secure_url, // absolute, permanent URL
        uploaded: true,
    };
}

// Temporary local storage only while the file is being forwarded to Cloudinary.
const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, os.tmpdir()),
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

function removeTempFiles(files = []) {
    for (const file of files) {
        fs.unlink(file.path, () => {});
    }
}

// GET: list every saved file in the requested category.
app.get("/api/portfolio/:category", getCategory, async (req, res, next) => {
    try {
        const {category} = req.params;
        const resources = [];
        let nextCursor;

        do {
            const result = await cloudinary.api.resources({
                type: "upload",
                resource_type: resourceTypeFor(category),
                prefix: `${categoryFolder(category)}/`,
                context: true,
                max_results: 500,
                next_cursor: nextCursor,
            });

            resources.push(...result.resources);
            nextCursor = result.next_cursor;
        } while (nextCursor);

        const files = resources.map(toPublicFile);

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
    async (req, res, next) => {
        const tempFiles = req.files || [];

        try {
            const {category} = req.params;
            const resourceType = resourceTypeFor(category);
            const uploaded = [];

            for (const file of tempFiles) {
                const extension = path.extname(file.originalname).toLowerCase();
                const id = crypto.randomUUID();

                // Raw files keep their extension in the public_id; images/videos don't.
                const publicId =
                    resourceType === "raw" ? `${id}${extension}` : id;

                const meta = {
                    originalName: file.originalname,
                    title: path.basename(
                        file.originalname,
                        path.extname(file.originalname),
                    ),
                    mimeType: file.mimetype,
                };

                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: resourceType,
                    folder: categoryFolder(category),
                    public_id: publicId,
                    use_filename: false,
                    unique_filename: false,
                    overwrite: false,
                    context: meta,
                });

                if (!result || !result.public_id) {
                    throw new Error(
                        `Cloudinary upload failed for ${file.originalname}`,
                    );
                }

                uploaded.push(
                    toPublicFile({...result, context: {custom: meta}}),
                );
            }

            res.status(201).json({files: uploaded});
        } catch (error) {
            next(error);
        } finally {
            removeTempFiles(tempFiles);
        }
    },
);

// DELETE: remove one file (its metadata lives on the Cloudinary asset).
app.delete(
    "/api/portfolio/:category/:filename",
    getCategory,
    async (req, res, next) => {
        try {
            const {category, filename} = req.params;

            if (
                filename !== path.basename(filename) ||
                !/^[\w-]+(?:\.[a-zA-Z0-9]+)?$/.test(filename)
            ) {
                return res.status(400).json({
                    error: "Invalid filename",
                });
            }

            const publicId = `${categoryFolder(category)}/${filename}`;

            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceTypeFor(category),
                invalidate: true,
            });

            if (result.result === "not found") {
                return res.status(404).json({
                    error: "File not found",
                });
            }

            res.json({message: "File deleted", filename});
        } catch (error) {
            next(error);
        }
    },
);

// Handle upload and server errors.
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
    console.log(`Portfolio backend running on port ${PORT}`);
});
