import React, { useState, useEffect, useRef, useCallback } from "react";
import { SKILLS_DATA } from "./skillsData";
import { PROJECTS_DATA } from "./projectsData";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("portfolio-theme") || "dark";
  });

  const [activeSection, setActiveSection] = useState("about");
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Sync theme with HTML root attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = useCallback((msg, duration = 2500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setIsToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, duration);
  }, []);

  const handleCopyEmail = useCallback(
    (e) => {
      e.preventDefault();
      const email = "mmdsameerali99@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("Email copied to clipboard!");
      });
    },
    [showToast]
  );

  // Particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let particles = [];
    const maxDistance = 110;
    const mouse = { x: null, y: null, radius: 130 };

    const getParticleCount = () => {
      const w = window.innerWidth;
      if (w <= 480) return 22;
      if (w <= 768) return 30;
      if (w <= 1200) return 45;
      return 60;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 1.2 + 1.4;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.8;
            this.y -= (dy / dist) * force * 1.8;
          }
        }
      }
      draw(isDarkTheme) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDarkTheme
          ? "rgba(52, 211, 153, 0.85)"
          : "rgba(4, 120, 87, 0.95)";
        ctx.shadowColor = isDarkTheme
          ? "rgba(16, 185, 129, 0.6)"
          : "rgba(4, 120, 87, 0.4)";
        ctx.shadowBlur = isDarkTheme ? 6 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = getParticleCount();
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const handleResize = () => {
      initCanvas();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(isDark);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.45);
            ctx.strokeStyle = isDark
              ? `rgba(52, 211, 153, ${alpha})`
              : `rgba(4, 120, 87, ${alpha})`;
            ctx.lineWidth = isDark ? 1.1 : 1.3;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    initCanvas();
    render();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  // Desktop spotlight following mouse
  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const handleGlobalMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  // Navbar scroll tracking & spy
  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 30);

      const sections = ["about", "skills", "projects", "certifications", "education", "contact"];
      let current = "about";

      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 140) {
          current = id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bento card 3D tilt hover
  const handleCardMouseMove = (e) => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "";
  };

  // Form submit handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;

    const mailtoUrl = `mailto:mmdsameerali99@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`
    )}`;

    window.location.href = mailtoUrl;
    showToast("Opening your email client to send...", 3000);

    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <canvas id="particlesCanvas" ref={canvasRef} />
      <div className="cursor-spotlight" ref={spotlightRef} id="cursorSpotlight" />

      <div
        className={`toast ${isToastVisible ? "show" : ""}`}
        id="toast"
        role="alert"
        aria-live="polite"
      >
        {toastMessage}
      </div>

      <nav id="navbar" className={isNavScrolled ? "scrolled" : ""}>
        <div className="logo">
          <span className="logo-sym">&lt;</span>Sameer
          <span className="logo-dot">.dev</span>
          <span className="logo-sym">/&gt;</span>
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? "open" : ""}`} id="navLinks">
          {["about", "skills", "projects", "certifications", "education", "contact"].map(
            (sec) => (
              <li key={sec}>
                <a
                  href={`#${sec}`}
                  className={`nav-link ${activeSection === sec ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {sec === "certifications"
                    ? "Credentials"
                    : sec.charAt(0).toUpperCase() + sec.slice(1)}
                </a>
              </li>
            )
          )}
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle"
            id="themeToggle"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
          >
            <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"} />
          </button>

          <button
            className="btn btn-outline btn-sm copy-email-btn"
            onClick={handleCopyEmail}
          >
            <i className="fa-regular fa-copy" /> Copy Email
          </button>

          <button
            className="mobile-toggle"
            id="mobileToggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation"
          >
            <i className={isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
          </button>
        </div>
      </nav>

      <main className="container">
        {/* HERO SECTION */}
        <section className="hero-bento" id="about">
          <div
            className="bento-card hero-main spotlight"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="status-badge">
              <span className="status-pulse" /> Open for Full-Time Roles
            </div>
            <h1>
              Hi, I'm <span className="gradient-text">Md Sameer Ali</span>
            </h1>
            <h2 className="hero-role">
              Full Stack Developer — JavaScript / Node.js / React
            </h2>
            <p className="hero-bio">
              Engineering scalable web systems with clean architectures. Specialized in building
              responsive front-ends with React, resilient REST APIs via Node.js/Express, and
              normalized relational databases with PostgreSQL.
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                <i className="fa-solid fa-code-fork" /> View Projects
              </a>
              <a href="mailto:mmdsameerali99@gmail.com" className="btn btn-secondary">
                <i className="fa-regular fa-envelope" /> Get In Touch
              </a>
              <a
                href="https://github.com/mmdsameerali"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github" />
              </a>
              <a
                href="https://www.linkedin.com/in/mmdsameerali"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin" />
              </a>
            </div>
          </div>

          <div
            className="bento-card hero-visual spotlight"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="avatar-frame">
              <img src="/image/img.jpg" alt="Md Sameer Ali" className="profile-pic" />
            </div>
            <div className="stat-pill">
              <i className="fa-solid fa-terminal" />
              <div>
                <span>PERN Architecture</span>
                <strong>Production Ready</strong>
              </div>
            </div>
          </div>

          <div
            className="bento-card stat-card spotlight"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="stat-number">
              8.71<span className="stat-denom">/10</span>
            </div>
            <div className="stat-label">B.E. Information Technology CGPA</div>
            <div className="stat-meta">Lords Institute of Engg & Tech (2021-2025)</div>
          </div>

          <div
            className="bento-card cert-teaser-card spotlight"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="cert-icon-wrapper">
              <i className="fa-solid fa-award" />
            </div>
            <div>
              <span className="mini-label">Udemy Certified</span>
              <h3>Full-Stack Web Development</h3>
              <p>Instructor: Dr. Angela Yu • Comprehensive Certification</p>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="section">
          <div className="section-title-wrap">
            <span className="section-subtitle">Skills</span>
            <h2 className="section-title">Technical Skills & Tools</h2>
          </div>

          <div className="skills-grid">
            {SKILLS_DATA.map((group, idx) => (
              <div
                key={idx}
                className={`bento-card spotlight ${group.isFullWidth ? "full-width-card" : ""}`}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="card-icon">
                  <i className={group.icon} />
                </div>
                <h3>{group.category}</h3>
                <div className="tag-cloud">
                  {group.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="section">
          <div className="section-title-wrap">
            <span className="section-subtitle">Portfolio</span>
            <h2 className="section-title">Featured Projects</h2>
          </div>

          <div className="filter-controls">
            {["all", "fullstack", "frontend"].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${projectFilter === cat ? "active" : ""}`}
                onClick={() => setProjectFilter(cat)}
              >
                {cat === "all"
                  ? "All Projects"
                  : cat === "fullstack"
                  ? "Full Stack"
                  : "Frontend / React"}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {PROJECTS_DATA.filter(
              (p) => projectFilter === "all" || p.category === projectFilter
            ).map((project) => (
              <div
                key={project.id}
                className="bento-card project-card spotlight"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="project-top">
                  <span className="project-tag">{project.tag}</span>
                  <div className="project-links">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-link"
                      aria-label="View Code"
                    >
                      <i className="fa-brands fa-github" />
                    </a>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-link"
                      aria-label="Live Demo"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </a>
                  </div>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.desc}</p>
                <div className="tech-pills">
                  {project.tech.map((t, tIdx) => (
                    <span key={tIdx}>{t}</span>
                  ))}
                </div>
                <ul className="project-bullets">
                  {project.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certifications" className="section">
          <div className="section-title-wrap">
            <span className="section-subtitle">Credentials</span>
            <h2 className="section-title">Certifications</h2>
          </div>

          <div
            className="cert-showcase bento-card spotlight"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="cert-left">
              <div>
                <span className="cert-provider">Udemy • Issued by Dr. Angela Yu</span>
                <h3 className="cert-name">The Complete Full-Stack Web Development Bootcamp</h3>
                <p className="cert-details">
                  Comprehensive credential demonstrating end-to-end mastery: Responsive UI/UX,
                  React.js ecosystem, Asynchronous Node/Express backend logic, PostgreSQL relational
                  schema modeling, RESTful services, and Authentication.
                </p>
                <div className="cert-meta-tags">
                  <span>
                    <i className="fa-regular fa-calendar" /> Completed 2026
                  </span>
                  <span>
                    <i className="fa-solid fa-circle-check" /> Certificate Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION SECTION */}
        <section id="education" className="section">
          <div className="section-title-wrap">
            <span className="section-subtitle">Academics</span>
            <h2 className="section-title">Education</h2>
          </div>

          <div className="timeline-bento">
            <div
              className="bento-card timeline-card spotlight"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="timeline-meta">
                <span className="year-pill">
                  <i className="fa-regular fa-calendar" /> 2021 — 2025
                </span>
                <span className="score-tag">CGPA: 8.71 / 10</span>
              </div>
              <h3>Bachelor of Engineering (B.E) in IT</h3>
              <h4 className="inst-title">
                <i className="fa-solid fa-graduation-cap" /> Lords Institute of Engineering and
                Technology, Hyderabad
              </h4>
              <p className="inst-desc">
                Graduated in Information Technology with strong foundational knowledge in Web
                Technologies, Database Management Systems (DBMS), Operating Systems, and Python
                programming.
              </p>
            </div>

            <div
              className="bento-card timeline-card spotlight"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="timeline-meta">
                <span className="year-pill">
                  <i className="fa-regular fa-calendar" /> 2019 — 2021
                </span>
                <span className="score-tag">Score: 85%</span>
              </div>
              <h3>Intermediate (MPC)</h3>
              <h4 className="inst-title">
                <i className="fa-solid fa-building-columns" /> Ushodaya Junior College, Bodhan
              </h4>
              <p className="inst-desc">
                Completed higher secondary education with Mathematics, Physics, and Chemistry,
                building a solid base in quantitative problem-solving and basic analytical skills.
              </p>
            </div>

            <div
              className="bento-card timeline-card spotlight"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="timeline-meta">
                <span className="year-pill">
                  <i className="fa-regular fa-calendar" /> 2019
                </span>
                <span className="score-tag">Score: 93%</span>
              </div>
              <h3>Secondary School Certificate (SSC)</h3>
              <h4 className="inst-title">
                <i className="fa-solid fa-school" /> Vijetha High School, Narayankhed
              </h4>
              <p className="inst-desc">
                Completed school education with high academic performance, gaining strong
                fundamentals across General Mathematics, Science, and practical reasoning.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="section">
          <div className="section-title-wrap">
            <span className="section-subtitle">Connections</span>
            <h2 className="section-title">Let's Discuss Opportunities</h2>
          </div>

          <div className="contact-layout">
            <div className="contact-cards-col">
              <div
                className="bento-card contact-card spotlight copy-email-btn"
                onClick={handleCopyEmail}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="contact-icon-box">
                  <i className="fa-regular fa-envelope" />
                </div>
                <div className="contact-info">
                  <span className="contact-type">Direct Email (Click to copy)</span>
                  <strong className="contact-val">mmdsameerali99@gmail.com</strong>
                </div>
                <i className="fa-regular fa-clone action-icon" />
              </div>

              <a
                href="tel:+919603125571"
                className="bento-card contact-card spotlight"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="contact-icon-box">
                  <i className="fa-solid fa-phone" />
                </div>
                <div className="contact-info">
                  <span className="contact-type">Phone</span>
                  <strong className="contact-val">+91 9603125571</strong>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square action-icon" />
              </a>

              <div
                className="bento-card contact-card spotlight"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="contact-icon-box">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div className="contact-info">
                  <span className="contact-type">Base Location</span>
                  <strong className="contact-val">Hyderabad, Telangana, India</strong>
                </div>
                <i className="fa-solid fa-earth-asia action-icon" />
              </div>
            </div>

            <div
              className="bento-card contact-form-card spotlight"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <h3 className="form-title">Send a Message</h3>
              <p className="form-subtitle">Have a project, query, or job opportunity? Drop a note below.</p>

              <form id="contactForm" className="contact-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="senderName">Your Name</label>
                  <input
                    type="text"
                    id="senderName"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senderEmail">Your Email</label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senderSubject">Subject</label>
                  <input
                    type="text"
                    id="senderSubject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Project Inquiry / Job Opportunity"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senderMessage">Message</label>
                  <textarea
                    id="senderMessage"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your message here..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary form-submit-btn" id="submitBtn">
                  <span>Send Message</span>
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <p>&copy; 2026 Md Sameer Ali. Engineered with React, Modern CSS, & JavaScript.</p>
          <div className="footer-links">
            <a href="#about">Top</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}