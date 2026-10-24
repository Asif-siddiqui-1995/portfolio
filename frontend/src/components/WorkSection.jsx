import {useState} from "react";
import {ArrowLeft, ArrowRight, ArrowUpRight, Layers3} from "lucide-react";
import {projects} from "./work/Constants";
import WorkCard from "./work/Workcard";
import PortfolioPortal from "./work/PortfolioPortal";
import "./WorkSection.css";

function getPosition(index, activeIndex) {
    const offset = (index - activeIndex + projects.length) % projects.length;

    if (offset === 0) return "active";
    if (offset === 1) return "next";
    if (offset === projects.length - 1) return "previous";
    return "hidden";
}

export default function WorkSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [openedProject, setOpenedProject] = useState(null);

    const activeProject = projects[activeIndex];

    const previousProject = () =>
        setActiveIndex((current) =>
            current === 0 ? projects.length - 1 : current - 1,
        );

    const nextProject = () =>
        setActiveIndex((current) => (current + 1) % projects.length);

    return (
        <section className="work-section" id="work">
            <div className="work-container">
                <div className="work-heading">
                    <div className="work-heading-title">
                        <span className="work-eyebrow">
                            <Layers3 size={15} />
                            SELECTED PROJECTS
                        </span>

                        <h2>
                            IDEAS INTO
                            <span> IMPACT.</span>
                        </h2>
                    </div>

                    <p className="work-heading-description">
                        Four creative worlds. One portfolio. Explore the work
                        behind every idea.
                    </p>
                </div>

                <div className="work-slider">
                    <div className="work-slider-top">
                        <span>
                            SELECTED WORK <span className="work-dot">●</span>{" "}
                            {activeProject.category}
                        </span>

                        <span className="work-counter">
                            <strong>{activeProject.number}</strong>
                            <span>
                                {" "}
                                / {String(projects.length).padStart(2, "0")}
                            </span>
                        </span>
                    </div>

                    <div className="work-stage">
                        {projects.map((project, index) => (
                            <WorkCard
                                key={project.number}
                                project={project}
                                position={getPosition(index, activeIndex)}
                                onOpen={setOpenedProject}
                            />
                        ))}
                    </div>

                    <div className="work-details" key={activeProject.number}>
                        <div className="work-project-info">
                            <span className="work-project-year">
                                CATEGORY {activeProject.number} — SELECTED WORK
                            </span>

                            <h3>{activeProject.title}</h3>
                            <p>{activeProject.description}</p>
                        </div>

                        <div className="work-controls">
                            <button
                                type="button"
                                className="work-arrow"
                                onClick={previousProject}
                                aria-label="Previous category"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <button
                                type="button"
                                className="work-arrow work-arrow-next"
                                onClick={nextProject}
                                aria-label="Next category"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="work-progress">
                        {projects.map((project, index) => (
                            <button
                                type="button"
                                key={project.number}
                                className={
                                    index === activeIndex
                                        ? "work-progress-item active"
                                        : "work-progress-item"
                                }
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Show ${project.title}`}
                            >
                                <span />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="work-footer">
                    <span>GOOD WORK. GOOD IDEAS. NO LIMITS.</span>

                    <a href="#contact">
                        HAVE A PROJECT IN MIND?
                        <ArrowUpRight size={16} />
                    </a>
                </div>
            </div>

            {openedProject && (
                <PortfolioPortal
                    project={openedProject}
                    onClose={() => setOpenedProject(null)}
                />
            )}
        </section>
    );
}
