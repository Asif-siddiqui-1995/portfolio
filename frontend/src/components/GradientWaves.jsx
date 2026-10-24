import {useEffect, useRef} from "react";

export default function GradientWaves({
    waveColor = "#e4e4e7",
    amplitude = 0.8,
    swell = 40,
    lightAngle = 60,
    speed = 1.2,
    blur = 14,
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        let width = 0;
        let height = 0;
        let frame;
        let time = 0;

        // clientWidth/clientHeight ignore CSS transforms (rotation during the
        // paper tear), unlike getBoundingClientRect.
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            width = canvas.clientWidth;
            height = canvas.clientHeight;

            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const dunes = [
            {y: 0.55, amp: 0.055, freq: 1.15, phase: 0, color: "#392219"},
            {y: 0.65, amp: 0.075, freq: 1.55, phase: 1.5, color: "#704026"},
            {y: 0.76, amp: 0.095, freq: 1.8, phase: 3, color: "#A96936"},
            {y: 0.87, amp: 0.12, freq: 1.4, phase: 4.5, color: waveColor},
            {y: 1.02, amp: 0.11, freq: 1.7, phase: 6, color: "#382016"},
        ];

        const duneY = (dune, x, baseY) => {
            const nx = x / Math.max(width, 1);

            const primary =
                Math.sin(nx * Math.PI * dune.freq + dune.phase + time * 0.22) *
                height *
                dune.amp *
                amplitude;

            const secondary =
                Math.sin(nx * Math.PI * 3.2 - time * 0.15 + dune.phase) *
                height *
                dune.amp *
                swell *
                0.35;

            return baseY + primary + secondary;
        };

        const draw = () => {
            if (width > 0 && height > 0) {
                ctx.clearRect(0, 0, width, height);

                // Deep, cinematic desert atmosphere
                const sky = ctx.createLinearGradient(0, 0, 0, height);
                sky.addColorStop(0, "#100D0A");
                sky.addColorStop(0.38, "#38251A");
                sky.addColorStop(0.7, "#8A512B");
                sky.addColorStop(1, "#D09A56");

                ctx.fillStyle = sky;
                ctx.fillRect(0, 0, width, height);

                // Hazy desert sunlight
                const lightX =
                    width *
                    (0.5 + Math.cos((lightAngle * Math.PI) / 180) * 0.25);
                const lightY = height * 0.36;

                const glow = ctx.createRadialGradient(
                    lightX,
                    lightY,
                    0,
                    lightX,
                    lightY,
                    Math.max(width, height) * 0.55,
                );

                glow.addColorStop(0, "rgba(255, 211, 139, 0.42)");
                glow.addColorStop(0.35, "rgba(220, 145, 73, 0.15)");
                glow.addColorStop(1, "rgba(20, 12, 8, 0)");

                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, width, height);

                // Layered dunes
                dunes.forEach((dune, index) => {
                    const baseY = height * dune.y;

                    ctx.beginPath();
                    ctx.moveTo(0, height);

                    for (let x = 0; x <= width + 4; x += 3) {
                        ctx.lineTo(x, duneY(dune, x, baseY));
                    }

                    ctx.lineTo(width, height);
                    ctx.closePath();

                    const sand = ctx.createLinearGradient(
                        0,
                        baseY - height * 0.12,
                        0,
                        height,
                    );

                    sand.addColorStop(0, dune.color);
                    sand.addColorStop(
                        0.45,
                        index === 3 ? "#B9783D" : dune.color,
                    );
                    sand.addColorStop(1, "#17100D");

                    ctx.fillStyle = sand;
                    ctx.fill();

                    // Thin warm highlight along each dune ridge
                    ctx.beginPath();

                    for (let x = 0; x <= width + 4; x += 3) {
                        const y = duneY(dune, x, baseY);
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }

                    ctx.strokeStyle =
                        index === 3
                            ? "rgba(255, 207, 135, 0.48)"
                            : "rgba(255, 194, 119, 0.17)";

                    ctx.lineWidth = index === 3 ? 1.5 : 0.8;
                    ctx.stroke();
                });

                // Fine atmospheric desert dust
                ctx.fillStyle = "rgba(255, 220, 165, 0.35)";
                for (let i = 0; i < 32; i++) {
                    const x =
                        ((i * 137.5 + time * (4 + (i % 4))) % (width + 20)) -
                        10;
                    const y = height * (0.28 + ((i * 37) % 50) / 100);

                    ctx.beginPath();
                    ctx.arc(x, y, i % 4 === 0 ? 1.2 : 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Cinematic vignette
                const vignette = ctx.createRadialGradient(
                    width * 0.5,
                    height * 0.5,
                    height * 0.15,
                    width * 0.5,
                    height * 0.5,
                    Math.max(width, height) * 0.75,
                );

                vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
                vignette.addColorStop(1, "rgba(8, 5, 4, 0.62)");

                ctx.fillStyle = vignette;
                ctx.fillRect(0, 0, width, height);
            }

            time += 0.012 * speed;
            frame = requestAnimationFrame(draw);
        };

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);

        resize();
        draw();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [waveColor, amplitude, swell, lightAngle, speed]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                pointerEvents: "none",
                filter: `blur(${blur}px)`,
                transform: "scale(1.15)", // hides the faded edges the blur creates
            }}
        />
    );
}
