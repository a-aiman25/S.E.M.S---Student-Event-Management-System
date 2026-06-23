import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaRegClock, FaTicketAlt, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [counters, setCounters] = useState({ events: 0, students: 0, societies: 0 });
  const statsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const events = [
    {
      id: 1,
      title: "SMEC 2026",
      society: "Department of Computer Science & IT",
      image: "http://localhost:5000/static/4.jpeg",
      date: "January 16, 2026",
      category: "Tech Event"
    },
    {
      id: 2,
      title: "Beach Party 2025",
      society: "Department of Software Engineering",
      image: "http://localhost:5000/static/5.jpg",
      date: "July 20, 2025",
      category: "Social"
    },
    {
      id: 3,
      title: "Annual Concert",
      society: "Department of Software Engineering",
      image: "http://localhost:5000/static/6.jpeg",
      date: "May 25, 2025",
      category: "Entertainment"
    },
    {
      id: 4,
      title: "Cultural Night",
      society: "SSUET AIT",
      image: "http://localhost:5000/static/2.jpeg",
      date: "November 1, 2024",
      category: "Cultural"
    },
    {
      id: 5,
      title: "SSUET-AIT MUN 2024",
      society: "SSUET AIT",
      image: "http://localhost:5000/static/3.jpeg",
      date: "November 1-3, 2024",
      category: "Conference"
    },
    {
      id: 6,
      title: "Dream World Picnic",
      society: "Sir Syed Times",
      image: "http://localhost:5000/static/7.jpeg",
      date: "April 11, 2026",
      category: "Trip"
    },
    {
      id: 7,
      title: "TICE FALL'25",
      society: "SSUET Innovators",
      image: "http://localhost:5000/static/8.jpeg",
      date: "January 26, 2025",
      category: "Workshop"
    },
    {
      id: 8,
      title: "Industry Seminar",
      society: "LACF",
      image: "http://localhost:5000/static/9.jpeg",
      date: "April 11, 2026",
      category: "Seminar"
    },
  ];

  // Counter animation for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
          // Animate counters
          const animateCounter = (target, start, end, duration) => {
            const step = (end - start) / (duration / 16);
            let current = start;
            const timer = setInterval(() => {
              current += step;
              if (current >= end) {
                clearInterval(timer);
                setCounters(prev => ({ ...prev, [target]: end }));
              } else {
                setCounters(prev => ({ ...prev, [target]: Math.floor(current) }));
              }
            }, 16);
          };
          
          animateCounter("events", 0, 128, 2000);
          animateCounter("students", 0, 15000, 2500);
          animateCounter("societies", 0, 18, 1500);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleContactSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post("/api/contact", formData);
      if (response.data.success) {
        toast.success("Message sent successfully!");
        setShowContactModal(false);
        setFormData({ name: "", email: "", message: "" });
        navigate("/contact-success");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      Conference: "#4B0082",
      Social: "#006633",
      Entertainment: "#FF8C00",
      Cultural: "#6B3FA0",
      Trip: "#00CED1",
      Workshop: "#17a2b8",
      Seminar: "#dc3545"
    };
    return colors[category] || "#6c757d";
  };

  return (
    <>
      <style>{`
        /* Animation Keyframes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Animation Classes */
        .animate-on-scroll {
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-on-scroll.visible {
          opacity: 1;
        }

        .fade-up {
          transform: translateY(40px);
        }
        .fade-up.visible {
          transform: translateY(0);
        }

        .fade-left {
          transform: translateX(-40px);
        }
        .fade-left.visible {
          transform: translateX(0);
        }

        .fade-right {
          transform: translateX(40px);
        }
        .fade-right.visible {
          transform: translateX(0);
        }

        .scale-up {
          transform: scale(0.9);
        }
        .scale-up.visible {
          transform: scale(1);
        }

        /* Hero Section Enhancements */
        .hero-section {
          position: relative;
          overflow: hidden;
          height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(75, 0, 130, 0.7);
          z-index: 0;
        }

        .hero-text {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 800px;
          padding: 0 20px;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          letter-spacing: 2px;
          animation: pulse 2s infinite;
        }

        /* Event Card Enhancements */
        .event-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
          border-radius: 16px !important;
        }

        .event-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
          z-index: 1;
          pointer-events: none;
        }

        .event-card:hover::before {
          left: 100%;
        }

        .event-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .event-card .card-img-top {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .event-card:hover .card-img-top {
          transform: scale(1.1);
        }

        /* Category Badge */
        .category-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 2;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(5px);
        }

        /* Stat Card Animation */
        .stat-card {
          transition: all 0.3s ease;
          cursor: default;
          background: white;
          padding: 20px;
          border-radius: 20px;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #4B0082, #6B3FA0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: all 0.3s ease;
        }

        /* Button Animations */
        .btn-primary-ssuet, .btn-outline-ssuet, .btn-green-ssuet {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50px !important;
        }

        .btn-primary-ssuet:hover, .btn-outline-ssuet:hover, .btn-green-ssuet:hover {
          transform: translateY(-2px);
        }

        /* Section Header Animation */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #4B0082;
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }

        .section-header h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #4B0082, #6B3FA0);
          border-radius: 3px;
        }

        .section-header p {
          color: #666;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Contact Form Animation */
        .contact-card {
          transition: all 0.4s ease;
          border-radius: 20px !important;
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .form-control-modern {
          transition: all 0.3s ease;
          border-radius: 12px !important;
          border: 1px solid #e0e0e0;
          padding: 12px 18px;
        }

        .form-control-modern:focus {
          transform: translateX(5px);
          border-color: #4B0082;
          box-shadow: 0 0 0 3px rgba(75, 0, 130, 0.1);
        }

        /* Loading Animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sending-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        /* Floating Animation for Icons */
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .section-header h2 {
            font-size: 1.8rem;
          }
          .stat-number {
            font-size: 1.8rem;
          }
          .hero-text h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div
        className="hero-section"
        style={{ backgroundImage: "url('http://localhost:5000/static/1.jpg')" }}
      >
        <div className="hero-text">
          <div className="hero-badge">EST. 1993</div>
          <h1 className="display-4 fw-bold mb-3">
            Sir Syed University of Engineering & Technology
          </h1>
          <h2 className="display-5 mb-4">S.E.M.S</h2>
          <p className="lead mb-3">Event Management System</p>
          <p className="lead mb-4">Creating Memorable Experiences for SSUET Students</p>
          <div>
            <Button className="btn-primary-ssuet me-3" size="lg" href="#services">
              Learn More <FaArrowRight className="ms-2" />
            </Button>
            <Button className="btn-outline-ssuet" size="lg" href="/events">
              Explore Events <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <section id="services" className="py-5">
        <Container>
          <div className="section-header animate-on-scroll fade-up">
            <h2>Recent Events at Sir Syed University</h2>
          </div>
          <Row className="g-4">
            {events.map((event, index) => (
              <Col key={event.id} md={6} lg={3}>
                <Card className="event-card h-100 shadow-sm">
                  <div className="position-relative overflow-hidden" style={{ height: "220px" }}>
                    <Card.Img
                      variant="top"
                      src={event.image}
                      alt={event.title}
                      style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    />
                    <div className="category-badge" style={{ background: getCategoryColor(event.category) }}>
                      {event.category}
                    </div>
                  </div>
                  <Card.Body className="text-center p-4">
                    <Card.Title className="fw-bold fs-5 mb-2">
                      {event.title}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-2">
                      Organized by: {event.society}
                    </Card.Text>
                    <div className="mb-2">
                      <small className="text-muted">
                        📅 {event.date}
                      </small>
                    </div>
                    <Button
                      className="btn-green-ssuet mt-2 w-100"
                      size="sm"
                      onClick={() => navigate("/events")}
                    >
                      View Details <FaChevronRight className="ms-1" size={12} />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* About Section with Animated Stats */}
      <section id="about" className="py-5" style={{ background: "#f8f9fa" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <div className="section-header animate-on-scroll fade-up">
                <h2>About Sir Syed University</h2>
                <p>Excellence in Engineering Education Since 1993</p>
              </div>
              <p className="lead text-muted mb-5 animate-on-scroll fade-up">
                Sir Syed University of Engineering & Technology (SSUET) stands as a beacon of quality education 
                in Pakistan, dedicated to producing skilled engineers and technologists. The SSUET Event Management 
                System (S.E.M.S) is designed to streamline event discovery, registration, and participation for 
                students, faculty, and staff. From technical conferences to cultural festivals, we help create 
                lasting memories and foster a vibrant campus community.
              </p>
              
              {/* Animated Statistics */}
              <div ref={statsRef} className="d-flex justify-content-center gap-4 flex-wrap">
                <div className="stat-card" style={{ minWidth: "150px" }}>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 floating-icon" 
                       style={{ width: "80px", height: "80px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                    <FaCalendarAlt size={35} style={{ color: "#4B0082" }} />
                  </div>
                  <h3 className="stat-number">{counters.events}+</h3>
                  <p className="text-muted small">Events Organized</p>
                </div>
                <div className="stat-card" style={{ minWidth: "150px" }}>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 floating-icon" 
                       style={{ width: "80px", height: "80px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                    <FaUsers size={35} style={{ color: "#4B0082" }} />
                  </div>
                  <h3 className="stat-number">{counters.students.toLocaleString()}+</h3>
                  <p className="text-muted small">Students Impacted</p>
                </div>
                <div className="stat-card" style={{ minWidth: "150px" }}>
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 floating-icon" 
                       style={{ width: "80px", height: "80px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
                    <FaMapMarkerAlt size={35} style={{ color: "#4B0082" }} />
                  </div>
                  <h3 className="stat-number">{counters.societies}+</h3>
                  <p className="text-muted small">Student Societies</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="section-header animate-on-scroll fade-up">
                <h2>Get in Touch</h2>
                <p>Have questions about events or need assistance? We're here to help!</p>
              </div>
              <Card className="shadow-lg border-0 rounded-4 contact-card">
                <Card.Body className="p-5">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowContactModal(true);
                    }}
                  >
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        className="form-control-modern"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        className="form-control-modern"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Your message or inquiry..."
                        className="form-control-modern"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                    <Button
                      className="btn-primary-ssuet w-100 py-3 fw-semibold"
                      type="submit"
                    >
                      Send Message <FaArrowRight className="ms-2" />
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Confirmation Modal */}
      <Modal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to send this message?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowContactModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="btn-primary-ssuet"
            onClick={handleContactSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="sending-spinner">⌛</span> Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;