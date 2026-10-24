import {useEffect, useState} from "react";
import {ArrowUpRight, Menu, X} from "lucide-react";
import "./navbar.css";

const navItems = [
    {label: "Home", href: "#home"},
    {label: "Tools", href: "#services"},
    {label: "Tech", href: "#technology"},
    {label: "Work", href: "#work"},
    {label: "Contact", href: "#contact"},
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeHref, setActiveHref] = useState(
        window.location.hash || "#home",
    );

    const closeMenu = () => setMenuOpen(false);

    const handleNavClick = (href) => {
        setActiveHref(href);
        closeMenu();
    };

    // Highlight the section currently in view while scrolling
    useEffect(() => {
        const sections = navItems
            .map((item) => document.querySelector(item.href))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveHref(`#${entry.target.id}`);
                    }
                });
            },
            {
                // Triggers when a section crosses the middle band of the viewport
                rootMargin: "-40% 0px -55% 0px",
                threshold: 0,
            },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    // Keep in sync with browser back/forward and manual hash changes
    useEffect(() => {
        const onHashChange = () =>
            setActiveHref(window.location.hash || "#home");
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return (
        <header className="navbar">
            <a
                href="#home"
                className="brand"
                onClick={() => handleNavClick("#home")}
            >
                <span className="brand-symbol">
                    A<span>.</span>
                </span>

                <span className="brand-name">
                    Mohd Asif S Siddiqui
                    <small>DESIGNER & Developer</small>
                </span>
            </a>

            <button
                className="mobile-menu"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="primary-navigation"
            >
                {menuOpen ? <X /> : <Menu />}
            </button>

            <nav
                id="primary-navigation"
                className={menuOpen ? "nav-links open" : "nav-links"}
            >
                {navItems.map((item) => {
                    const isActive = activeHref === item.href;
                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            className={isActive ? "nav-active" : ""}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => handleNavClick(item.href)}
                        >
                            {item.label}
                        </a>
                    );
                })}

                <a
                    href="mailto:hello@example.com"
                    className="nav-contact"
                    onClick={closeMenu}
                >
                    LET'S TALK <ArrowUpRight size={15} />
                </a>
            </nav>
        </header>
    );
}
