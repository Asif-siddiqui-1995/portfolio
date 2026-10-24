import {useCallback, useEffect, useState} from "react";
import {
    deletePortfolioFile,
    fetchPortfolioFiles,
    uploadPortfolioFiles,
} from "./Api";
import {FILE_TYPES} from "./Constants";

const errorMessage = (err) =>
    (err instanceof Error ? err.message : String(err)) || "Unknown error";

// The backend is the single source of truth for portfolio files.
export default function usePortfolioFiles(project) {
    const {uploadKey, type} = project;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const refresh = useCallback(
        async (shouldUpdate = () => true) => {
            const loaded = await fetchPortfolioFiles(uploadKey);

            if (shouldUpdate()) {
                setFiles(loaded);
            }

            return loaded;
        },
        [uploadKey],
    );

    // Load saved files when opening or switching portfolio categories.
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            setFiles([]);

            try {
                await refresh(() => !cancelled);
            } catch (err) {
                if (!cancelled) {
                    setError(`Could not load portfolio: ${err.message}`);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [refresh]);

    const upload = async (selectedFiles) => {
        if (!selectedFiles.length) {
            return;
        }

        const acceptedFiles = selectedFiles.filter(FILE_TYPES[type].isAccepted);

        if (!acceptedFiles.length) {
            setError("Select valid files for this portfolio category.");
            return;
        }

        // Keep the skipped-files warning so a successful upload doesn't erase it.
        const skippedNotice =
            acceptedFiles.length !== selectedFiles.length
                ? "Some files were skipped because their format is not supported."
                : "";

        setError(skippedNotice);
        setUploading(true);

        try {
            await uploadPortfolioFiles(uploadKey, acceptedFiles);

            // Fetch all saved files so previous uploads remain visible.
            try {
                await refresh();
            } catch (refreshError) {
                throw new Error(
                    `Upload succeeded, but refreshing the list failed: ${refreshError.message}`,
                    {cause: refreshError},
                );
            }

            setError(skippedNotice);
        } catch (err) {
            console.error("Portfolio upload error:", err, err?.cause);
            setError(`Upload failed: ${errorMessage(err)}`);
        } finally {
            setUploading(false);
        }
    };

    const remove = async (file) => {
        if (!file.filename) {
            setError("This file does not have a valid stored filename.");
            return;
        }

        if (!window.confirm(`Delete "${file.title}" permanently?`)) {
            return;
        }

        setError("");

        try {
            await deletePortfolioFile(uploadKey, file.filename);

            // Refresh from disk instead of manually editing React state.
            try {
                await refresh();
            } catch (refreshError) {
                throw new Error(
                    `File was deleted, but refreshing the list failed: ${refreshError.message}`,
                    {cause: refreshError},
                );
            }
        } catch (err) {
            console.error("Portfolio delete error:", err, err?.cause);
            setError(`Delete failed: ${errorMessage(err)}`);
        }
    };

    return {files, loading, uploading, error, upload, remove};
}
