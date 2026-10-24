import {X} from "lucide-react";

export default function ImageLightbox({image, onClose}) {
    return (
        <div
            className="portfolio-image-lightbox"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <button
                type="button"
                className="portfolio-close lightbox-close"
                onClick={onClose}
                aria-label="Close image preview"
            >
                <X size={22} />
            </button>

            <img src={image.src} alt={image.title} />

            <span>{image.title}</span>
        </div>
    );
}
