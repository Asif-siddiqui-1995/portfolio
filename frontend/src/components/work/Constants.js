export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Per-type upload rules: which files are allowed and what the UI says.
export const FILE_TYPES = {
    pdf: {
        accept: ".pdf,application/pdf",
        hint: "Upload multiple PDF files",
        isAccepted: (file) =>
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf"),
    },
    image: {
        accept: "image/*",
        hint: "Upload multiple images",
        isAccepted: (file) => file.type.startsWith("image/"),
    },
    video: {
        accept: "video/*",
        hint: "Upload multiple videos",
        isAccepted: (file) => file.type.startsWith("video/"),
    },
};

export const projects = [
    {
        number: "01",
        title: "Brand Identity",
        uploadKey: "brand-identity",
        titleLines: ["Brand", "Identity"],
        category: "PDF PORTFOLIO",
        description: "Brand systems, logos, and visual identities.",
        color: "#ff6a1a",
        type: "pdf",
    },
    {
        number: "02",
        title: "Print Work",
        uploadKey: "print-work",
        titleLines: ["Print", "Works"],
        category: "PRINT DESIGN",
        description: "Print-ready artwork, brochures, and campaigns.",
        color: "#a78bfa",
        type: "image",
    },
    {
        number: "03",
        title: "Hollywood Creative",
        uploadKey: "hollywood",
        titleLines: ["Hollywood", "Creative"],
        category: "CINEMATIC ARTWORK",
        description: "Movie posters, key art, and promotional creatives.",
        color: "#f59e0b",
        type: "image",
    },
    {
        number: "04",
        title: "Software / Web Design",
        uploadKey: "software",
        titleLines: ["Software", "Web Design"],
        category: "DIGITAL EXPERIENCES",
        description:
            "A showcase of software, websites, and interactive products.",
        color: "#38bdf8",
        type: "video",
    },
];
