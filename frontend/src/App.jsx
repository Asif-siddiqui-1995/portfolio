import {useState} from "react";

import BackgroundEffects from "./components/BackgroundEffects";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SoftwareSection from "./components/SoftwareSection";
import TechnologySection from "./components/TechnologySection";
import WorkSection from "./components/WorkSection";
// import Footer from "./components/Footer";
import Intro from "./components/Intro";
import Contact from "./components/Contact";

import "./index.css";

export default function App() {
    const [showIntro, setShowIntro] = useState(true);

    return (
        <main className="portfolio">
            <BackgroundEffects />

            <Navbar />

            <div id="home">
                <Hero ready={!showIntro} />
            </div>

            <SoftwareSection />
            <TechnologySection />
            <WorkSection />
            <Contact />

            {/* <Footer /> */}

            {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
        </main>
    );
}
