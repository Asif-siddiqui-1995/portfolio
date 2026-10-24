import {useEffect, useRef} from "react";
import {ArrowUpRight, Mail, Phone, Download} from "lucide-react";
import "./Contact.css";
import resume from "../assets/resume.pdf";

const contactItems = [
    {
        number: "01",
        type: "EMAIL",
        title: "Let's talk ideas.",
        detail: "mohammadasifshahid@gmail.com",
        href: "mailto:mohammadasifshahid@gmail.com",
        icon: <Mail size={23} />,
        action: "SEND AN EMAIL",
        className: "email-card",
    },
    {
        number: "02",
        type: "PHONE",
        title: "Have a quick chat.",
        detail: "+91 8957777705 ",
        href: "tel:+918957777705",
        icon: <Phone size={23} />,
        action: "CALL ME",
        className: "phone-card",
    },

    {
        number: "03",
        type: "LINKEDIN",
        title: "Let's connect professionally.",
        detail: "Mohd Asif S Siddiqui",
        href: "https://www.linkedin.com/in/asif-siddiqui-5000a7105/",
        icon: <span className="contact-letter-icon">in</span>,
        action: "CONNECT",
        className: "linkedin-card",
    },
];

export default function Contact() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    section.classList.add("contact-visible");
                    observer.unobserve(section);
                }
            },
            {threshold: 0.12},
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="contact-section" id="contact" ref={sectionRef}>
            <div className="contact-grid" />
            <div className="contact-orb contact-orb-one" />
            <div className="contact-orb contact-orb-two" />

            <div className="contact-container">
                <div className="contact-header contact-reveal">
                    <div>
                        <p className="contact-eyebrow">
                            <span className="status-dot" />
                            HAVE A PROJECT IN MIND?
                        </p>

                        <h2 className="contact-heading">
                            LET'S <span>CONNECT.</span>
                        </h2>
                    </div>

                    <p className="contact-intro">
                        Have an idea, a project, or an opportunity? I'd love to
                        hear from you.
                    </p>
                </div>

                <div className="contact-cards">
                    {contactItems.map((item, index) => (
                        <a
                            key={item.number}
                            href={item.href}
                            target={
                                item.type === "INSTAGRAM" ||
                                item.type === "LINKEDIN"
                                    ? "_blank"
                                    : undefined
                            }
                            rel={
                                item.type === "INSTAGRAM" ||
                                item.type === "LINKEDIN"
                                    ? "noreferrer"
                                    : undefined
                            }
                            className={`contact-card ${item.className} contact-reveal`}
                            style={{"--card-index": index}}
                        >
                            <div className="contact-card-top">
                                <span className="contact-card-number">
                                    / {item.number}
                                </span>

                                <span className="contact-card-icon">
                                    {item.icon}
                                </span>
                            </div>

                            <div className="contact-card-content">
                                <span className="contact-card-type">
                                    {item.type}
                                </span>

                                <h3>{item.title}</h3>

                                <p>{item.detail}</p>
                            </div>

                            <div className="contact-card-bottom">
                                <span>{item.action}</span>
                                <ArrowUpRight size={19} />
                            </div>

                            <span className="contact-card-glow" />
                        </a>
                    ))}

                    <a
                        href={resume}
                        target="_blank"
                        rel="noreferrer"
                        download="Mohd-Asif-S-Siddiqui-Resume.pdf"
                        className="contact-card resume-card contact-reveal"
                        style={{"--card-index": 4}}
                    >
                        <div className="contact-card-top">
                            <span className="contact-card-number">/ 05</span>

                            <span className="contact-card-icon">
                                <Download size={23} />
                            </span>
                        </div>

                        <div className="contact-card-content">
                            <span className="contact-card-type">MY RESUME</span>

                            <h3>Take a closer look.</h3>

                            <p>
                                Explore my experience, skills, and creative
                                work.
                            </p>
                        </div>

                        <div className="contact-card-bottom">
                            <span>DOWNLOAD RESUME</span>
                            <Download size={19} />
                        </div>

                        <span className="contact-card-glow" />
                    </a>
                </div>

                <footer className="contact-footer contact-reveal">
                    <span>MOHD ASIF S SIDDIQUI</span>
                    <span>DESIGNED WITH INTENTION © 2026</span>

                    <a href="#home">
                        BACK TO TOP <ArrowUpRight size={15} />
                    </a>
                </footer>
            </div>
        </section>
    );
}
