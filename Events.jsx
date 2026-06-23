import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaFilter, FaInfoCircle, 
  FaExternalLinkAlt, FaGraduationCap, FaChalkboardTeacher, FaMusic, FaLaptopCode, 
  FaTrophy, FaUsers, FaDollarSign, FaTags, FaClock, FaChair, FaRegClock, FaCheckCircle 
} from 'react-icons/fa';

const Events = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const categories = [
    'All',
    'Major Festivals & Trips',
    'Tech & Academia',
    'Seminars & Workshops',
    'Internship Programs',
    'Sports & Competitions',
    'Society-Led Events'
  ];

  const infoOnlyCategories = ['Seminars & Workshops', 'Internship Programs'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      if (response.data.success) {
        setAllEvents(response.data.events);
        setFilteredEvents(response.data.events);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredEvents(allEvents);
    } else {
      const filtered = allEvents.filter(event => event.category === activeCategory);
      setFilteredEvents(filtered);
    }
  }, [activeCategory, allEvents]);

  const handleViewInfo = (event) => {
    setSelectedEvent(event);
    setShowInfoModal(true);
  };

  const getCategoryBadgeStyle = (category) => {
    switch(category) {
      case 'Major Festivals & Trips':
        return { backgroundColor: '#4B0082' };
      case 'Tech & Academia':
        return { backgroundColor: '#006633' };
      case 'Seminars & Workshops':
        return { backgroundColor: '#FF8C00' };
      case 'Internship Programs':
        return { backgroundColor: '#00CED1' };
      case 'Sports & Competitions':
        return { backgroundColor: '#FF6B35' };
      case 'Society-Led Events':
        return { backgroundColor: '#6B3FA0' };
      default:
        return { backgroundColor: '#6B3FA0' };
    }
  };

  const getCategoryGradient = (category) => {
    switch(category) {
      case 'Major Festivals & Trips':
        return 'linear-gradient(135deg, #4B0082, #6B3FA0)';
      case 'Tech & Academia':
        return 'linear-gradient(135deg, #006633, #008844)';
      case 'Seminars & Workshops':
        return 'linear-gradient(135deg, #FF8C00, #FFA500)';
      case 'Internship Programs':
        return 'linear-gradient(135deg, #00CED1, #20B2AA)';
      case 'Sports & Competitions':
        return 'linear-gradient(135deg, #FF6B35, #FF8C42)';
      case 'Society-Led Events':
        return 'linear-gradient(135deg, #6B3FA0, #8B5FB0)';
      default:
        return 'linear-gradient(135deg, #6B3FA0, #8B5FB0)';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Seminars & Workshops':
        return <FaChalkboardTeacher className="me-1" />;
      case 'Internship Programs':
        return <FaGraduationCap className="me-1" />;
      case 'Major Festivals & Trips':
        return <FaMusic className="me-1" />;
      case 'Tech & Academia':
        return <FaLaptopCode className="me-1" />;
      case 'Sports & Competitions':
        return <FaTrophy className="me-1" />;
      case 'Society-Led Events':
        return <FaUsers className="me-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-muted">Loading events...</p>
      </Container>
    );
  }

  return (
    <div className="py-5" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Container>
        <div className="section-header">
          <h2>SSUET Events & Opportunities</h2>
          <p>Discover festivals, conferences, seminars, workshops, and internship opportunities at Sir Syed University</p>
        </div>

        {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

        <div className="mb-4 p-3 bg-white rounded-3 shadow-sm filter-section">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <FaFilter className="me-2" style={{ color: '#4B0082' }} />
              <span className="fw-semibold" style={{ color: '#4B0082' }}>Filter Events by Category:</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-pill px-3 py-1 ${activeCategory === cat ? 'btn-primary-ssuet' : 'filter-btn-inactive'}`}
                  style={activeCategory === cat ? {} : { 
                    backgroundColor: 'white', 
                    borderColor: '#4B0082', 
                    color: '#4B0082' 
                  }}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-3 p-2 bg-info bg-opacity-10 rounded-3 text-center info-note">
          <small className="text-info">
            <FaInfoCircle className="me-1" /> 
            <strong>Note:</strong> Seminars, Workshops, and Internship Programs are information-only. No ticket purchase required. Click "View Details" for more information and registration links.
          </small>
        </div>

        <div className="mb-3">
          <p className="text-muted small">Showing {filteredEvents.length} of {allEvents.length} events</p>
        </div>

        <Card className="modern-table shadow-lg border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="table-ssuet mb-0">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Capacity</th>
                    <th>Price</th>
                    <th>Speaker/Organizer</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="text-muted">
                          <p className="mb-2">No events found in this category.</p>
                          <Button 
                            size="sm" 
                            onClick={() => setActiveCategory('All')}
                            className="btn-primary-ssuet rounded-pill px-3"
                          >
                            View All Events
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => {
                      const isInfoOnly = infoOnlyCategories.includes(event.category);
                      
                      return (
                        <tr key={event.id}>
                          <td className="fw-semibold">{event.eventname}</td>
                          <td>
                            <Badge 
                              className="px-2 py-1 rounded-pill"
                              style={getCategoryBadgeStyle(event.category)}
                            >
                              {getCategoryIcon(event.category)}
                              {event.category}
                            </Badge>
                          </td>
                          <td>{event.available_tickets}</td>
                          <td>
                            {event.is_free ? (
                              <Badge className="badge-success-ssuet">Free</Badge>
                            ) : (
                              <Badge className="badge-success-ssuet">
                                PKR {event.price}/-
                              </Badge>
                            )}
                          </td>
                          <td>
                            <FaUser className="me-2 text-muted" />
                            {event.artistname}
                          </td>
                          <td>
                            <FaMapMarkerAlt className="me-2 text-muted" />
                            {event.venue}
                          </td>
                          <td>
                            <Badge className={event.eventstatus === 'active' ? 'badge-success-ssuet' : 'badge-danger-ssuet'}>
                              {event.eventstatus}
                            </Badge>
                          </td>
                          <td>
                            <FaCalendarAlt className="me-2 text-muted" />
                            {formatDate(event.date)}
                          </td>
                          <td>
                            {event.available_tickets > 0 && event.eventstatus === 'active' ? (
                              isInfoOnly ? (
                                <Button 
                                  onClick={() => handleViewInfo(event)}
                                  className="btn-info-ssuet" 
                                  size="sm"
                                >
                                  <FaInfoCircle className="me-1" /> View Details
                                </Button>
                              ) : (
                                isAuthenticated ? (
                                  <Button 
                                    as={Link} 
                                    to={`/booking?event=${event.id}`} 
                                    className="btn-green-ssuet" 
                                    size="sm"
                                  >
                                    <FaTicketAlt className="me-1" /> Book Now
                                  </Button>
                                ) : (
                                  <Button 
                                    as={Link} 
                                    to="/login" 
                                    variant="secondary" 
                                    size="sm"
                                  >
                                    Login to Book
                                  </Button>
                                )
                              )
                            ) : (
                              <Badge className="badge-danger-ssuet">Not Available</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Enhanced Event Details Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} size="lg" centered className="event-details-modal">
        {selectedEvent && (
          <>
            <Modal.Body className="p-0">
              <div className="event-details-modern">
                {/* Hero Section */}
                <div className="event-hero">
                  <div className="event-hero-overlay" style={{ background: getCategoryGradient(selectedEvent.category) }}></div>
                  <div className="event-hero-content">
                    <div className="event-category-badge" style={{ background: getCategoryBadgeStyle(selectedEvent.category).backgroundColor }}>
                      {getCategoryIcon(selectedEvent.category)} {selectedEvent.category}
                    </div>
                    <h1>{selectedEvent.eventname}</h1>
                    <div className="event-meta">
                      <span><FaCalendarAlt /> {formatDate(selectedEvent.date)}</span>
                      <span><FaMapMarkerAlt /> {selectedEvent.venue}</span>
                      <span><FaUser /> {selectedEvent.artistname}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="event-content">
                  {/* Description */}
                  <div className="event-description">
                    <h3>About This Event</h3>
                    <p>{selectedEvent.description || 'No description available. Please contact the event organizer for more details.'}</p>
                  </div>
                  
                  {/* Info Grid */}
                  <div className="event-info-grid">
                    <div className="info-card">
                      <div className="info-icon"><FaCalendarAlt /></div>
                      <div className="info-text">
                        <label>Date & Time</label>
                        <p>{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-icon"><FaMapMarkerAlt /></div>
                      <div className="info-text">
                        <label>Venue</label>
                        <p>{selectedEvent.venue}</p>
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-icon"><FaUser /></div>
                      <div className="info-text">
                        <label>Speaker/Organizer</label>
                        <p>{selectedEvent.artistname}</p>
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-icon"><FaChair /></div>
                      <div className="info-text">
                        <label>Capacity</label>
                        <p>{selectedEvent.available_tickets} seats available</p>
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-icon"><FaDollarSign /></div>
                      <div className="info-text">
                        <label>Price</label>
                        <p>{selectedEvent.is_free ? 'FREE Entry' : `PKR ${selectedEvent.price}/-`}</p>
                        {selectedEvent.early_bird_available && (
                          <span className="early-bird-tag">Early Bird: {selectedEvent.early_bird_discount}% OFF</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-icon"><FaTags /></div>
                      <div className="info-text">
                        <label>Category</label>
                        <p>{selectedEvent.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Special Information Based on Category */}
                  {selectedEvent.category === 'Internship Programs' && (
                    <div className="special-info internship-info">
                      <div className="special-icon">📢</div>
                      <div className="special-content">
                        <h4>Internship Opportunity</h4>
                        <ul>
                          <li>This is an internship opportunity, not a paid event</li>
                          <li>Students can apply by filling the registration form</li>
                          <li>Selection will be based on merit/interview</li>
                          <li>Certificate will be provided upon completion</li>
                          <li>Duration: 3-6 months (depending on program)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.category === 'Seminars & Workshops' && (
                    <div className="special-info workshop-info">
                      <div className="special-icon">🎓</div>
                      <div className="special-content">
                        <h4>Seminar/Workshop Information</h4>
                        <ul>
                          <li>Registration is free but mandatory</li>
                          <li>Limited seats available - register early</li>
                          <li>Certificate of participation will be provided</li>
                          <li>Bring your university ID card for entry</li>
                          <li>Laptop recommended for hands-on workshops</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.category === 'Tech & Academia' && (
                    <div className="special-info tech-info">
                      <div className="special-icon">💻</div>
                      <div className="special-content">
                        <h4>Technical Event Information</h4>
                        <ul>
                          <li>Prior registration required</li>
                          <li>Team participation allowed (max 3 members)</li>
                          <li>Winners will receive certificates and prizes</li>
                          <li>Bring your laptop for practical sessions</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.category === 'Major Festivals & Trips' && (
                    <div className="special-info festival-info">
                      <div className="special-icon">🎉</div>
                      <div className="special-content">
                        <h4>Festival/Trip Information</h4>
                        <ul>
                          <li>Transportation included in ticket price</li>
                          <li>Food and refreshments will be provided</li>
                          <li>Meeting point: SSUET Main Gate</li>
                          <li>Carry your university ID for identification</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.category === 'Sports & Competitions' && (
                    <div className="special-info sports-info">
                      <div className="special-icon">🏆</div>
                      <div className="special-content">
                        <h4>Sports Event Information</h4>
                        <ul>
                          <li>Sports equipment will be provided</li>
                          <li>Winners receive medals and certificates</li>
                          <li>Register your team in advance</li>
                          <li>Bring your sports kit/appropriate attire</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.category === 'Society-Led Events' && (
                    <div className="special-info society-info">
                      <div className="special-icon">🤝</div>
                      <div className="special-content">
                        <h4>Society Event Information</h4>
                        <ul>
                          <li>Organized by student societies</li>
                          <li>Open to all SSUET students</li>
                          <li>Participation certificates available</li>
                          <li>Connect with like-minded peers</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="event-actions">
                    {selectedEvent.registration_link && (
                      <Button 
                        as="a" 
                        href={selectedEvent.registration_link}
                        target="_blank"
                        className="btn-register"
                      >
                        <FaExternalLinkAlt className="me-2" /> Register Now
                      </Button>
                    )}
                    <Button className="btn-close-modal" onClick={() => setShowInfoModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>

      <style>{`
        .btn-info-ssuet {
          background: #17a2b8;
          border: none;
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        .btn-info-ssuet:hover {
          background: #138496;
          transform: translateY(-1px);
        }
        .bg-info-opacity-10 {
          background-color: rgba(23, 162, 184, 0.1);
        }
        
        /* Enhanced Modal Styles */
        .event-details-modal .modal-content {
          background: transparent;
          border: none;
          border-radius: 24px;
          overflow: hidden;
        }
        
        .event-details-modern {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
          animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .event-hero {
          position: relative;
          height: 280px;
          background-size: cover;
          background-position: center;
          background-image: url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
        }
        
        .event-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.9;
        }
        
        .event-hero-content {
          position: relative;
          z-index: 1;
          padding: 40px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 100%;
        }
        
        .event-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
          margin-bottom: 15px;
        }
        
        .event-hero-content h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 15px;
        }
        
        .event-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        .event-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .event-content {
          padding: 30px;
        }
        
        .event-description h3 {
          font-size: 1.3rem;
          color: #4B0082;
          margin-bottom: 15px;
        }
        
        .event-description p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        
        .event-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .info-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        
        .info-icon {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #4B0082, #6B3FA0);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }
        
        .info-text {
          flex: 1;
        }
        
        .info-text label {
          font-size: 0.7rem;
          color: #999;
          display: block;
          margin-bottom: 4px;
        }
        
        .info-text p {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .early-bird-tag {
          display: inline-block;
          background: #FF8C00;
          color: white;
          font-size: 0.6rem;
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 5px;
        }
        
        .special-info {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 25px;
        }
        
        .internship-info {
          background: linear-gradient(135deg, #e3f2fd, #bbdef5);
          border-left: 4px solid #2196f3;
        }
        
        .workshop-info {
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border-left: 4px solid #FF8C00;
        }
        
        .tech-info {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border-left: 4px solid #006633;
        }
        
        .festival-info {
          background: linear-gradient(135deg, #fce4ec, #f8bbd0);
          border-left: 4px solid #e91e63;
        }
        
        .sports-info {
          background: linear-gradient(135deg, #fff8e1, #ffecb3);
          border-left: 4px solid #ff35e7;
        }
        
        .society-info {
          background: linear-gradient(135deg, #f3e5f5, #e1bee7);
          border-left: 4px solid #6B3FA0;
        }
        
        .special-icon {
          font-size: 2rem;
        }
        
        .special-content h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .special-content ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .special-content li {
          font-size: 0.8rem;
          margin-bottom: 5px;
          color: #555;
        }
        
        .event-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .btn-register {
          background: linear-gradient(135deg, #4B0082, #6B3FA0);
          border: none;
          padding: 12px 28px;
          border-radius: 50px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .btn-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(75, 0, 130, 0.3);
          color: white;
        }
        
        .btn-close-modal {
          background: #6c757d;
          border: none;
          padding: 12px 28px;
          border-radius: 50px;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-close-modal:hover {
          background: #5a6268;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .event-hero {
            height: 220px;
          }
          .event-hero-content h1 {
            font-size: 1.3rem;
          }
          .event-content {
            padding: 20px;
          }
          .event-info-grid {
            grid-template-columns: 1fr;
          }
          .event-meta {
            font-size: 0.7rem;
            gap: 10px;
          }
          .special-info {
            flex-direction: column;
          }
          .event-actions {
            flex-direction: column;
          }
          .btn-register, .btn-close-modal {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Events;