export default function ProjectTitle({project}) {
    if (project.titleLines) {
        return (
            <h3>
                {project.titleLines.map((line) => (
                    <span className="work-title-line" key={line}>
                        {line}
                    </span>
                ))}
            </h3>
        );
    }

    return <h3>{project.title}</h3>;
}
