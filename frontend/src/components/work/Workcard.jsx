import {ArrowUpRight} from "lucide-react";
import ProjectTitle from "./Projecttitle";

export default function WorkCard({project, position, onOpen}) {
    const tabIndex = position === "active" ? 0 : -1;

    return (
        <article
            className={`work-card work-card-${position}`}
            style={{"--project-accent": project.color}}
            aria-hidden={position !== "active"}
        >
            <div className="work-category-card">
                <div className="work-card-orbit orbit-one" />
                <div className="work-card-orbit orbit-two" />

                <span className="work-image-number">{project.number} / 04</span>

                <span className="work-category-kicker">{project.category}</span>

                <ProjectTitle project={project} />

                <p>{project.description}</p>

                <button
                    type="button"
                    className="work-image-open"
                    onClick={() => onOpen(project)}
                    aria-label={`Explore ${project.title}`}
                    tabIndex={tabIndex}
                >
                    <ArrowUpRight size={23} />
                </button>

                <button
                    type="button"
                    className="work-explore-button"
                    onClick={() => onOpen(project)}
                    tabIndex={tabIndex}
                >
                    EXPLORE PORTFOLIO
                    <ArrowUpRight size={15} />
                </button>

                <span className="work-category-index">{project.number}</span>
            </div>
        </article>
    );
}
