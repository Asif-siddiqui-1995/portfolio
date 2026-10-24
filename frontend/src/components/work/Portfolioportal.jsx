import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import usePortfolioFiles from "./Useportfoliofiles";
import PortfolioItem from "./Portfolioitem";
import UploadBar from "./Uploadbar";
import ImageLightbox from "./Imagelightbox";

export default function PortfolioPortal({project, onClose}) {
    const {files, loading, uploading, error, upload, remove} =
        usePortfolioFiles(project);

    // Store only the filename so the lightbox always shows fresh data.
    const [selectedFilename, setSelectedFilename] = useState(null);
    const selectedImage =
        files.find((file) => file.filename === selectedFilename) || null;

    // Lock background scrolling and support the Escape key.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key !== "Escape") return;

            if (selectedImage) {
                setSelectedFilename(null);
            } else {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, selectedImage]);

    return createPortal(
        <div
            className="portfolio-portal"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="portfolio-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="portfolio-modal-title"
                style={{"--modal-accent": project.color}}
            >
                <header className="portfolio-modal-header">
                    <div className="portfolio-modal-heading">
                        <span className="portfolio-modal-eyebrow">
                            <span className="portfolio-live-dot" />
                            SELECTED WORK / {project.number}
                        </span>

                        <h2 id="portfolio-modal-title">{project.title}</h2>
                        <p>{project.description}</p>
                    </div>

                    <button
                        className="portfolio-close"
                        onClick={onClose}
                        aria-label="Close portfolio"
                    >
                        <X size={22} />
                    </button>
                </header>

                {error && (
                    <div role="alert" className="portfolio-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="portfolio-loading">Loading portfolio…</p>
                ) : (
                    <div
                        className={`portfolio-gallery portfolio-gallery-${project.type}`}
                    >
                        {files.map((file, index) => (
                            <PortfolioItem
                                key={
                                    file.filename ||
                                    file.src ||
                                    `${project.uploadKey}-${index}`
                                }
                                file={file}
                                type={project.type}
                                onDelete={remove}
                                onSelectImage={(f) =>
                                    setSelectedFilename(f.filename)
                                }
                            />
                        ))}

                        {files.length === 0 && (
                            <p className="portfolio-empty">
                                No files in this portfolio yet. Add your first
                                file below.
                            </p>
                        )}
                    </div>
                )}

                <UploadBar
                    type={project.type}
                    uploading={uploading}
                    loading={loading}
                    onFiles={upload}
                />

                <footer className="portfolio-modal-footer">
                    <span>{project.category}</span>
                    <span>{String(files.length).padStart(2, "0")} ITEMS</span>
                </footer>
            </div>

            {selectedImage && (
                <ImageLightbox
                    image={selectedImage}
                    onClose={() => setSelectedFilename(null)}
                />
            )}
        </div>,
        document.body,
    );
}
