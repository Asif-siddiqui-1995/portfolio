import GhostFibers from "./GhostFibers";

export default function BackgroundEffects() {
    return (
        <>
            <div className="ghost-background" aria-hidden="true">
                <GhostFibers
                    glowColor="#ff6a1a"
                    lineColor="#ffd9a8"
                    secondaryColor="#e11d48"
                    layers={3}
                    twist={0.9}
                    threads={72}
                    fiberStyle="dashes"
                    depthOfField={0.85}
                    hoverEffect="focus"
                    intro={true}
                    mouseInteraction={true}
                    rotation={8}
                    speed={0.7}
                    flow={0.9}
                    particles={0.9}
                    sparkle={1}
                />
            </div>

            <div className="ambient-glow" aria-hidden="true" />
            <div className="noise-overlay" aria-hidden="true" />
        </>
    );
}
