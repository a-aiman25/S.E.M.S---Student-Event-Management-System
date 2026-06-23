import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaWallet, FaMobileAlt, FaCreditCard, FaUniversity, FaLock, FaShieldAlt, FaTags } from 'react-icons/fa';
import TicketModal from '../components/TicketModal';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [numTickets, setNumTickets] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [useEarlyBird, setUseEarlyBird] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [bookingResponseData, setBookingResponseData] = useState(null);

  useEffect(() => {
    fetchEvents();
    if (user) {
      setFormData({
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        cnic: '',
        address: ''
      });
    }
  }, [user]);

  useEffect(() => {
    const eventId = searchParams.get('event');
    if (eventId && events.length > 0) {
      setSelectedEvent(eventId);
      const event = events.find(e => e.id.toString() === eventId);
      if (event) {
        setEventDetails(event);
      }
    }
  }, [events, searchParams]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/available');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    const event = events.find(ev => ev.id.toString() === eventId);
    if (event) {
      setEventDetails(event);
    }
    setNumTickets(1);
    setUseEarlyBird(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^03[0-9]{9}$/.test(formData.phone.replace(/-/g, ''))) {
      errors.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)';
    }
    if (!selectedEvent) {
      errors.event = 'Please select an event';
    }
    if (!paymentMethod) {
      errors.payment = 'Please select a payment method';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateOriginalTotal = () => {
    if (!eventDetails) return 0;
    return eventDetails.price * numTickets;
  };

  const calculateEarlyBirdTotal = () => {
    if (!eventDetails) return 0;
    const discount = eventDetails.early_bird_discount || 10;
    const discountedPrice = eventDetails.price * (1 - discount / 100);
    return discountedPrice * numTickets;
  };

  const calculateSavings = () => {
    return calculateOriginalTotal() - calculateEarlyBirdTotal();
  };

  const getFinalTotal = () => {
    if (useEarlyBird && eventDetails?.early_bird_available) {
      return calculateEarlyBirdTotal();
    }
    return calculateOriginalTotal();
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setPaymentProcessing(true);
    setShowPaymentModal(true);

    setTimeout(async () => {
      try {
        const bookingResponse = await axios.post('/api/booking', {
          event_id: selectedEvent,
          num_tickets: numTickets,
          payment_method: paymentMethod,
          use_early_bird: useEarlyBird && eventDetails?.early_bird_available,
          customer_info: formData
        });

        if (bookingResponse.data.success) {
          setBookingResponseData(bookingResponse.data);
          setPaymentStatus('success');
          
          // Store booking info for ticket
          const bookingInfo = {
            id: bookingResponse.data.booking_id || Date.now(),
            num_tickets: numTickets,
            total_price: getFinalTotal(),
            booking_date: new Date().toISOString().split('T')[0]
          };
          
          const eventInfo = {
            event_name: eventDetails.name,
            event_date: eventDetails.date,
            event_venue: eventDetails.venue,
            price: eventDetails.price,
            early_bird_discount: eventDetails.early_bird_discount
          };
          
          setCurrentBooking(bookingInfo);
          setCurrentEvent(eventInfo);
          
          if (bookingResponse.data.discount_applied) {
            toast.success(`Booking successful! You saved ${bookingResponse.data.discount_percentage}% with Early Bird!`);
          } else {
            toast.success('Booking successful!');
          }
          
          setTimeout(() => {
            setShowPaymentModal(false);
            setShowTicketModal(true);
          }, 1500);
        }
      } catch (error) {
        setPaymentStatus('failed');
        setPaymentProcessing(false);
        toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    processPayment();
  };

  const paymentMethods = [
    { value: 'easypaisa', label: 'Easypaisa', icon: <FaMobileAlt /> },
    { value: 'jazzcash', label: 'JazzCash', icon: <FaMobileAlt /> },
    { value: 'nayapay', label: 'Nayapay', icon: <FaWallet /> },
    { value: 'sadapay', label: 'Sadapay', icon: <FaWallet /> },
    { value: 'credit_card', label: 'Credit Card', icon: <FaCreditCard /> },
    { value: 'debit_card', label: 'Debit Card', icon: <FaCreditCard /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <FaUniversity /> }
  ];

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-muted">Loading available events...</p>
      </Container>
    );
  }

  return (
    <div className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, #4B0082 0%, #6B3FA0 100%)' }}>
                <h2 className="text-white mb-0 fw-bold">Book Your Tickets</h2>
                <p className="text-white-50 mb-0">Secure your spot at SSUET events</p>
              </div>
              <Card.Body className="p-4 p-md-5">
                {events.length === 0 ? (
                  <Alert variant="warning" className="text-center">
                    <p className="mb-0">No upcoming events available for booking at this time.</p>
                    <Button
                      variant="primary"
                      className="mt-3"
                      style={{ background: '#4B0082', border: 'none' }}
                      onClick={() => navigate('/events')}
                    >
                      Browse Events
                    </Button>
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Select Event</Form.Label>
                      <Form.Select
                        value={selectedEvent}
                        onChange={handleEventChange}
                        className="form-control-modern"
                        isInvalid={!!formErrors.event}
                        required
                      >
                        <option value="">-- Select an Event --</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name} - {event.date} (PKR {event.price}/-) - {event.available_tickets} tickets left
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{formErrors.event}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: '#4B0082' }}>Personal Information</h6>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="form-control-modern"
                              placeholder="Enter your full name"
                              isInvalid={!!formErrors.fullName}
                              required
                            />
                            <Form.Control.Feedback type="invalid">{formErrors.fullName}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="form-control-modern"
                              placeholder="you@example.com"
                              isInvalid={!!formErrors.email}
                              required
                            />
                            <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="form-control-modern"
                              placeholder="03XXXXXXXXX"
                              isInvalid={!!formErrors.phone}
                              required
                            />
                            <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
                            <Form.Text className="text-muted">Pakistani number: 03XXXXXXXXX</Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">CNIC Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="cnic"
                              value={formData.cnic}
                              onChange={handleInputChange}
                              className="form-control-modern"
                              placeholder="1234567890123"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Address</Form.Label>
                            <Form.Control
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="form-control-modern"
                              placeholder="Your address"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Number of Tickets</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={eventDetails?.available_tickets || 10}
                        value={numTickets}
                        onChange={(e) => setNumTickets(Math.min(parseInt(e.target.value) || 1, eventDetails?.available_tickets || 10))}
                        className="form-control-modern"
                        required
                      />
                      {eventDetails && (
                        <Form.Text className="text-muted">Max {eventDetails.available_tickets} tickets available</Form.Text>
                      )}
                    </Form.Group>

                    {eventDetails && eventDetails.early_bird_available && !eventDetails.is_free && (
                      <div className="mb-4 p-3 rounded-3 early-bird-section">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <FaTags style={{ color: '#FF8C00', fontSize: '20px' }} />
                              <strong style={{ color: '#FF8C00' }}>Early Bird Discount Available!</strong>
                            </div>
                            <small className="text-muted">
                              Save {eventDetails.early_bird_discount || 10}% - Valid until 48 hours before the event<br />
                              {eventDetails.days_left_for_early_bird > 0 ?
                                `${eventDetails.days_left_for_early_bird} days left for this offer` :
                                'Last day to book with discount!'}
                            </small>
                          </div>
                          <Form.Check
                            type="switch"
                            id="early-bird-switch"
                            label="Apply Early Bird Discount"
                            checked={useEarlyBird}
                            onChange={(e) => setUseEarlyBird(e.target.checked)}
                            style={{ fontWeight: '500' }}
                          />
                        </div>
                      </div>
                    )}

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Payment Method</Form.Label>
                      <div className="row g-2">
                        {paymentMethods.map((method) => (
                          <Col key={method.value} xs={6} md={4}>
                            <div
                              className={`payment-option p-3 rounded-3 border cursor-pointer ${paymentMethod === method.value ? 'payment-option-selected' : ''}`}
                              onClick={() => setPaymentMethod(method.value)}
                              style={{
                                cursor: 'pointer',
                                border: paymentMethod === method.value ? '2px solid #4B0082' : '1px solid #dee2e6',
                                background: paymentMethod === method.value ? 'rgba(75, 0, 130, 0.05)' : 'white',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <div className="text-center">
                                <div style={{ color: '#4B0082', fontSize: '24px' }}>{method.icon}</div>
                                <span className="small fw-semibold" style={{ color: paymentMethod === method.value ? '#4B0082' : '#666' }}>
                                  {method.label}
                                </span>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </div>
                      {formErrors.payment && <div className="text-danger small mt-2">{formErrors.payment}</div>}
                    </Form.Group>

                    {eventDetails && (
                      <Card className="bg-light mb-4 border-0 rounded-3">
                        <Card.Body>
                          <h5 className="fw-bold mb-3" style={{ color: '#4B0082' }}>Price Summary</h5>

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Ticket Price:</span>
                            <span className="fw-semibold">PKR {eventDetails.price}/-</span>
                          </div>

                          {useEarlyBird && eventDetails.early_bird_available && !eventDetails.is_free && (
                            <div className="d-flex justify-content-between mb-2 text-success">
                              <span className="text-muted">Early Bird Discount ({eventDetails.early_bird_discount || 10}%):</span>
                              <span className="fw-semibold">- PKR {Math.round(eventDetails.price * (eventDetails.early_bird_discount || 10) / 100)}/-</span>
                            </div>
                          )}

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Number of Tickets:</span>
                            <span className="fw-semibold">{numTickets}</span>
                          </div>

                          <hr />

                          <div className="d-flex justify-content-between mb-0 fs-5">
                            <span className="fw-bold">Total Amount:</span>
                            <span className="fw-bold" style={{ color: useEarlyBird && eventDetails.early_bird_available ? '#FF8C00' : '#4B0082' }}>
                              PKR {Math.round(getFinalTotal())}/-
                            </span>
                          </div>

                          {useEarlyBird && eventDetails.early_bird_available && !eventDetails.is_free && calculateSavings() > 0 && (
                            <div className="mt-2 small text-success">
                              You save PKR {Math.round(calculateSavings())}/- with Early Bird discount!
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    )}

                    <Button
                      type="submit"
                      className="w-100 py-3 fw-semibold"
                      style={{ background: '#4B0082', border: 'none', borderRadius: '8px' }}
                      disabled={submitting || !selectedEvent || events.length === 0}
                    >
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showPaymentModal} onHide={() => !paymentProcessing && setShowPaymentModal(false)} centered>
        <Modal.Header closeButton={!paymentProcessing}>
          <Modal.Title>
            <FaLock className="me-2" style={{ color: '#4B0082' }} />
            Secure Payment Gateway
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentProcessing && !paymentStatus ? (
            <div className="text-center py-4">
              <div className="loading-spinner mx-auto mb-3"></div>
              <h5>Processing Payment...</h5>
              <p className="text-muted">Please do not close this window</p>
              <div className="mt-3">
                <small className="text-muted">
                  <FaShieldAlt className="me-1" /> Secure 256-bit SSL Encryption
                </small>
              </div>
            </div>
          ) : paymentStatus === 'success' ? (
            <div className="text-center py-4">
              <div className="mb-3">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#006633" />
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h5 style={{ color: '#006633' }}>Payment Successful!</h5>
              <p>Your booking has been confirmed.</p>
              <p className="text-muted small">Preparing your digital ticket...</p>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center py-4">
              <div className="mb-3">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#dc3545" />
                  <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h5 style={{ color: '#dc3545' }}>Payment Failed</h5>
              <p>Please try again or contact support.</p>
              <Button
                className="mt-3"
                style={{ background: '#4B0082', border: 'none' }}
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentStatus(null);
                }}
              >
                Try Again
              </Button>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>

      {/* Ticket Modal */}
      {currentBooking && currentEvent && user && (
        <TicketModal
          show={showTicketModal}
          onHide={() => {
            setShowTicketModal(false);
            navigate('/user-dashboard');
          }}
          booking={currentBooking}
          event={currentEvent}
          user={user}
        />
      )}

      <style>{`
        .payment-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .payment-option-selected {
          border-color: #4B0082 !important;
          background: rgba(75, 0, 130, 0.05) !important;
        }
        .early-bird-section {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          border-left: 4px solid #FF8C00;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default Booking;