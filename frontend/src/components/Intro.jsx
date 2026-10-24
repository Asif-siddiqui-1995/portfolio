import {lazy, Suspense, useEffect, useRef, useState} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import "./Intro.css";

gsap.registerPlugin(useGSAP);

// Lazy so the pen-stroke title can start without waiting on the canvas code.
// Hero lazy-loads the same module, so both share one chunk.
const GhostFibers = lazy(() => import("./GhostFibers"));

const NAME = "Mohd Asif Siddiqui";
const NAME_PARTS = NAME.split(" ");

// 1 = original pace. 1.5 plays the whole intro ~50% faster (about 6s, not 9s).
const SPEED = 1;

const FIBER_PROPS = {
    glowColor: "#ff6a1a",
    lineColor: "#ffd9a8",
    secondaryColor: "#e11d48",
    speed: 0.5,
    depthOfField: 0.85,
    glow: 0.8,
    vignette: 0.3,
};

// True once the browser is idle (after the title has started drawing).
// Stays false on low-core devices, so they skip the decorative canvas.
function useDeferredFibers() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if ((navigator.hardwareConcurrency || 8) <= 4) return;

        const start = () => setShow(true);

        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(start, {timeout: 1000});
            return () => window.cancelIdleCallback(id);
        }

        const id = setTimeout(start, 200);
        return () => clearTimeout(id);
    }, []);

    return show;
}

export default function Intro({onComplete}) {
    const container = useRef(null);
    const onCompleteRef = useRef(onComplete);
    const [finished, setFinished] = useState(false);
    const showFibers = useDeferredFibers();

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useGSAP(
        () => {
            const root = container.current;
            if (!root) return;

            // Unmounting (not just display:none) also stops the fibers'
            // render loop, so it doesn't compete with the Hero's canvas.
            const finish = () => {
                onCompleteRef.current?.();
                setFinished(true);
            };

            // Skip the animation for people who ask for reduced motion.
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                finish();
                return;
            }

            const title = root.querySelector(".intro-title-text");
            const nameWords = root.querySelectorAll(".intro-name .write");
            const role = root.querySelector(".intro-role");

            const tl = gsap.timeline({onComplete: finish});
            tl.timeScale(SPEED);

            gsap.set(title, {
                strokeDasharray: 3000,
                strokeDashoffset: 3000,
                fillOpacity: 0,
            });

            // --p = how far the "pen" has travelled (0% -> 106%)
            gsap.set(nameWords, {"--p": "0%"});
            gsap.set(role, {opacity: 0, y: 14});

            // Writes words one after another, time scaled by word length
            const write = (words, firstOffset) => {
                words.forEach((el, i) => {
                    const chars = el.textContent.trim().length;
                    tl.to(
                        el,
                        {
                            "--p": "106%",
                            duration: Math.max(0.3, chars * 0.14),
                            ease: "power1.inOut",
                        },
                        i === 0 ? firstOffset : ">0.12",
                    );
                });
            };

            tl.to(
                title,
                {strokeDashoffset: 0, duration: 2.6, ease: "none"},
                0.7,
            ).to(
                title,
                {fillOpacity: 1, duration: 0.6, ease: "power2.out"},
                "-=0.2",
            );

            write(nameWords, "-=0.1"); // name is "written"

            // role line: simple fade up
            tl.to(
                role,
                {opacity: 1, y: 0, duration: 0.6, ease: "power2.out"},
                ">0.2",
            );

            tl.to({}, {duration: 1.2}) // hold
                .to(root, {opacity: 0, duration: 1, ease: "power2.inOut"}); // fade away
        },
        {scope: container},
    );

    if (finished) return null;

    return (
        <div className="intro-screen" ref={container}>
            {showFibers && (
                <Suspense fallback={null}>
                    <GhostFibers {...FIBER_PROPS} />
                </Suspense>
            )}

            <div className="intro-content">
                <h1 className="intro-title">
                    <svg
                        className="intro-title-svg"
                        viewBox="0 0 1000 180"
                        role="img"
                        aria-label="PORTFOLIO"
                    >
                        <text
                            className="intro-title-text"
                            x="500"
                            y="150"
                            textAnchor="middle"
                            textLength="920"
                            lengthAdjust="spacingAndGlyphs"
                        >
                            PORTFOLIO
                        </text>
                    </svg>
                </h1>

                <div className="intro-details">
                    <p className="intro-name" aria-label={NAME}>
                        {NAME_PARTS.map((word, i) => (
                            <span key={word} aria-hidden="true">
                                <span className="write">{word}</span>
                                {i < NAME_PARTS.length - 1 ? " " : null}
                            </span>
                        ))}
                    </p>

                    <p className="intro-role">
                        Sr. Graphic Designer <span>|</span> Software Developer
                    </p>
                </div>
            </div>
        </div>
    );
}
