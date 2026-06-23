import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt, FaHome, FaCalendarAlt, FaTicketAlt, FaUniversity, FaBars } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar 
      expand="lg" 
      className={`navbar-ssuet sticky-top py-3 ${scrolled ? 'scrolled' : ''}`}
      style={{
        transition: 'all 0.3s ease',
        padding: scrolled ? '0.5rem 0' : '1rem 0',
        background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'white',
        boxShadow: scrolled ? '0 5px 25px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold" style={{ 
          fontSize: '1.3rem',
          transition: 'transform 0.3s ease',
        }}>
          <FaUniversity className="me-2" style={{ color: '#4B0082' }} />
          <span style={{ color: '#4B0082' }}>Sir Syed University</span>
          <span style={{ color: '#006633' }}> | S.E.M.S</span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav">
          <FaBars style={{ color: '#4B0082' }} />
        </BootstrapNavbar.Toggle>
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/events" className="nav-link-custom">
              <FaCalendarAlt className="me-1" /> Events
            </Nav.Link>
            <Nav.Link href="#about" className="nav-link-custom">
              About University
            </Nav.Link>
            <Nav.Link href="#contact" className="nav-link-custom">
              Contact
            </Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Nav.Link as={Link} to="/admin-dashboard" className="nav-link-custom me-2">
                    <FaTachometerAlt className="me-1" /> Dashboard
                  </Nav.Link>
                ) : (
                  <Nav.Link as={Link} to="/user-dashboard" className="nav-link-custom me-2">
                    <FaTicketAlt className="me-1" /> My Tickets
                  </Nav.Link>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2 rounded-pill px-3"
                  style={{
                    transition: 'all 0.3s ease',
                    borderWidth: '2px',
                  }}
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2 rounded-pill px-3"
                  style={{
                    borderColor: '#4B0082',
                    color: '#4B0082',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#4B0082';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#4B0082';
                  }}
                >
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  size="sm" 
                  className="rounded-pill px-3"
                  style={{
                    background: 'linear-gradient(135deg, #4B0082, #6B3FA0)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 15px rgba(75, 0, 130, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FaUserPlus className="me-1" /> Register
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>

      <style>{`
        .nav-link-custom {
          position: relative;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #4B0082, #6B3FA0);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link-custom:hover::after {
          width: 80%;
        }
        
        .nav-link-custom:hover {
          color: #4B0082 !important;
          transform: translateY(-2px);
        }
        
        .navbar-toggler:focus {
          box-shadow: none;
          outline: none;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .navbar-collapse.show {
          animation: slideDown 0.3s ease;
        }
      `}</style>
    </BootstrapNavbar>
  );
};

export default Navbar;