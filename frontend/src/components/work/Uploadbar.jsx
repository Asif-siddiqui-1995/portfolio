import {useRef} from "react";
import {Plus} from "lucide-react";
import {FILE_TYPES} from "./Constants";

export default function UploadBar({type, uploading, loading, onFiles}) {
    const fileInputRef = useRef(null);
    const {accept, hint} = FILE_TYPES[type];
    const disabled = uploading || loading;

    const handleChange = (event) => {
        const selected = Array.from(event.target.files || []);

        // Allow selecting the same file again later.
        event.target.value = "";

        onFiles(selected);
    };

    return (
        <div className="portfolio-upload-bar">
            <div className="portfolio-upload-info">
                <span className="portfolio-upload-plus">
                    <Plus size={19} />
                </span>

                <div>
                    <strong>
                        {uploading ? "Uploading files…" : "Add more work"}
                    </strong>
                    <p>{hint}</p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                className="portfolio-file-input"
                type="file"
                multiple
                accept={accept}
                onChange={handleChange}
                aria-label="Select multiple portfolio files"
                disabled={disabled}
            />

            <button
                type="button"
                className="portfolio-add-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
            >
                <Plus size={17} />
                <span>{uploading ? "Uploading…" : "Add Files"}</span>
            </button>
        </div>
    );
}
