import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-ssuet">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-4 mb-md-0 text-center text-md-start">
            <h5 className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}>
              Sir Syed University
            </h5>
            <p className="small text-white-50 mb-2">
              S.E.M.S - Event Management System
            </p>
            <p className="small text-white-50">
              Sir Syed University of Engineering & Technology
            </p>
            <div className="mt-3">
              <a 
                href="https://facebook.com/ssuet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaFacebookF />
              </a>
              <a 
                href="https://twitter.com/ssuet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaTwitter />
              </a>
              <a 
                href="https://instagram.com/ssuet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon me-2"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://linkedin.com/school/ssuet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0 text-center">
            <h5 className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}>
              Quick Links
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#about" className="footer-link">About University</a>
              </li>
              <li className="mb-2">
                <a href="#services" className="footer-link">Recent Events</a>
              </li>
              <li className="mb-2">
                <a href="/events" className="footer-link">Event Calendar</a>
              </li>
              <li className="mb-2">
                <a href="#contact" className="footer-link">Contact Us</a>
              </li>
            </ul>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <h5 className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}>
              Contact Info
            </h5>
            <div className="mb-2">
              <FaMapMarkerAlt className="me-2" style={{ color: '#006633' }} />
              <span className="small text-white-50">
                ST-16, Main University Road,<br />
                Gulshan-e-Iqbal, Karachi, Pakistan
              </span>
            </div>
            <div className="mb-2">
              <FaPhone className="me-2" style={{ color: '#006633' }} />
              <span className="small text-white-50">+92-21-12345678</span>
            </div>
            <div>
              <FaEnvelope className="me-2" style={{ color: '#006633' }} />
              <span className="small text-white-50">events@ssuet.edu.pk</span>
            </div>
          </Col>
        </Row>
        
        <hr className="my-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Row>
          <Col className="text-center py-3">
            <p className="mb-0 small text-white-50">
              &copy; {currentYear} Sir Syed University of Engineering & Technology - Event Management System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>

      <style>{`
        .footer-ssuet {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }
        
        .footer-ssuet::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(75, 0, 130, 0.1) 1%, transparent 1%);
          background-size: 50px 50px;
          animation: shimmer 20s linear infinite;
          pointer-events: none;
        }
        
        @keyframes shimmer {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }
        
        .footer-link:hover {
          color: #006633;
          padding-left: 5px;
        }
        
        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        
        .social-icon:hover {
          background: #006633;
          transform: translateY(-3px);
          color: white;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .footer-ssuet .col-md-4 {
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }
        
        .footer-ssuet .col-md-4:nth-child(1) { animation-delay: 0.1s; }
        .footer-ssuet .col-md-4:nth-child(2) { animation-delay: 0.2s; }
        .footer-ssuet .col-md-4:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </footer>
  );
};

export default Footer;