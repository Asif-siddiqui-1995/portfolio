import GhostFibers from "./GhostFibers";

export default function Home() {
    return (
        <section className="home">
            <GhostFibers
                glowColor="#ff6a1a"
                lineColor="#ffd9a8"
                secondaryColor="#e11d48"
                speed={0.4}
                depthOfField={0.85}
                glow={0.8}
                brightness={0.9}
                vignette={0.3}
            />

            {/* Everything inside .home-content sits above the fibers */}
            <div className="home-content">
                <p>PORTFOLIO</p>
                <h1>Mohd Asif S Siddiqui</h1>
                <p>Graphic Designer | Software Developer</p>
            </div>
        </section>
    );
}
