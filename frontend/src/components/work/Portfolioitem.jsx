import {ArrowUpRight, FileText, Play, Trash2} from "lucide-react";

export default function PortfolioItem({file, type, onDelete, onSelectImage}) {
    return (
        <article className="portfolio-item">
            {file.uploaded && (
                <button
                    type="button"
                    className="portfolio-remove-file"
                    onClick={() => onDelete(file)}
                    aria-label={`Delete ${file.title}`}
                    title="Delete uploaded file"
                >
                    <Trash2 size={15} />
                </button>
            )}

            {type === "pdf" && (
                <>
                    <div className="portfolio-pdf-preview">
                        <FileText size={36} />
                        <span>{file.title}</span>

                        <a
                            href={file.src}
                            target="_blank"
                            rel="noreferrer"
                            className="portfolio-view-link"
                        >
                            Open PDF
                            <ArrowUpRight size={15} />
                        </a>
                    </div>

                    <iframe
                        className="portfolio-pdf-frame"
                        src={file.src}
                        title={file.title}
                        loading="lazy"
                    />
                </>
            )}

            {type === "image" && (
                <button
                    type="button"
                    className="portfolio-image-button"
                    onClick={() => onSelectImage(file)}
                    aria-label={`View ${file.title}`}
                >
                    <img
                        src={file.src}
                        alt={file.title}
                        loading="lazy"
                        onError={() =>
                            console.error("Image failed to load:", file.src)
                        }
                    />

                    <span className="portfolio-image-caption">
                        {file.title}
                        <ArrowUpRight size={17} />
                    </span>
                </button>
            )}

            {type === "video" && (
                <div className="portfolio-video-wrap">
                    <video
                        src={file.src}
                        controls
                        playsInline
                        preload="metadata"
                    />

                    <span className="portfolio-video-title">
                        <Play size={14} />
                        {file.title}
                    </span>
                </div>
            )}
        </article>
    );
}
