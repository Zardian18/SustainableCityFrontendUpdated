import React, { useRef } from "react";
import bannerImg from "../assets/banner.png";
import "./LandingPage.css";
import emailjs from "emailjs-com";

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: "smooth" });
};


export default function LandingPage() {
    const form = useRef();
    const sendEmail = (e) => {
        e.preventDefault();
    
        emailjs.sendForm(
          "service_ca4y9tn",    
         // 🔁 Replace with your actual service ID
           "template_jflx736",   // 🔁 Replace with your template ID
          form.current,
          "m5SyUrwOg1vckCBLW"     // 🔁 Replace with your public key
        ).then(
          (result) => {
            alert("Message sent successfully!");
            e.target.reset();
          },
          (error) => {
            alert("Failed to send message. Try again.");
            console.error(error.text);
          }
        );
      };
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header">
        <h1 className="logo" onClick={() => scrollToSection("home")}>
        Éirflow
        </h1>
        <nav className="nav">
          {/* <button onClick={() => scrollToSection("about")}>About</button>
          <button onClick={() => scrollToSection("contact")}>Contact</button>
          <nav className="nav"> */}
  {/* <button onClick={() => scrollToSection("about")}>About</button>
  <button onClick={() => scrollToSection("contact")}>Contact</button>
  <button onClick={() => window.location.href = "/auth?mode=signin"}>Sign In</button>
  <button onClick={() => window.location.href = "/auth?mode=signup"}>Sign Up</button>
</nav> */}
<nav className="nav">
  <button onClick={() => scrollToSection("about")}>About</button>
  <button onClick={() => scrollToSection("contact")}>Contact</button>
  <button onClick={() => window.location.href = "/auth?mode=signin"}>Sign In</button>
  <button onClick={() => window.location.href = "/auth?mode=signup"}>Sign Up</button>
</nav>


        </nav>
      </header>

      {/* Hero Section - FULL WIDTH BANNER */}
      <section id="home" className="hero-banner">
        <img src={bannerImg} alt="Smart City" className="hero-bg" />
        <div className="hero-content">
          <h2>Welcome to <span>Éirflow</span></h2>
          <p>Revolutionizing Urban Mobility with Smart, Sustainable City Insights.</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h3>About ÉIRFLOW</h3>
        <p>
        ÉIRFLOW is a powerful urban planning and monitoring platform that helps cities manage
          traffic flow, reduce congestion, and improve sustainability. With real-time insights on
          bikes, buses, and pedestrian routes, we empower smarter decisions for healthier urban
          environments.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h3>Contact Us</h3>
        <form ref={form} onSubmit={sendEmail} className="contact-form">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} EIRFLOW. All rights reserved.</p>
      </footer>
    </div>
  );
}
