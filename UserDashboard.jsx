import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Tab,
  Nav,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  FaTicketAlt,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTrash,
  FaHistory,
  FaDownload,
} from "react-icons/fa";
import TicketModal from "../components/TicketModal";

// Phone validation function
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^03[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchProfile();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/user/bookings");
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/user/profile");
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setProfile({ ...profile, phone: phone });
    
    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError("Please enter a valid Pakistani number (e.g., 03XXXXXXXXX)");
    } else {
      setPhoneError("");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profile.phone && !validatePhoneNumber(profile.phone)) {
      toast.error("Please enter a valid Pakistani phone number");
      return;
    }
    
    setUpdating(true);
    try {
      const response = await axios.put("/api/user/profile", profile);
      if (response.data.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await axios.post(`/api/cancel-booking/${bookingId}`);
        if (response.data.success) {
          toast.success("Booking cancelled successfully");
          fetchBookings();
        } else {
          toast.error(response.data.error);
        }
      } catch (error) {
        toast.error("Failed to cancel booking");
      }
    }
  };

  const handleDownloadTicket = (booking) => {
    const event = {
      event_name: booking.event_name,
      event_date: booking.event_date,
      event_venue: booking.event_venue,
    };
    
    const bookingInfo = {
      id: booking.id,
      num_tickets: booking.num_tickets,
      total_price: booking.total_price,
      booking_date: booking.booking_date,
    };
    
    setSelectedBooking(bookingInfo);
    setSelectedEvent(event);
    setShowTicketModal(true);
  };

  const getTimeRemaining = (bookingDate) => {
    const cancelDeadline = new Date(
      new Date(bookingDate).getTime() + 24 * 60 * 60 * 1000,
    );
    const now = new Date();
    const timeLeft = cancelDeadline - now;

    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <div
      className="py-4"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1
              className="display-5 fw-bold"
              style={{
                background: "linear-gradient(135deg, #4B0082 0%, #6B3FA0 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              SSUET Student Dashboard
            </h1>
            <p className="lead text-muted">
              Welcome to S.E.M.S, {profile.first_name}!
            </p>
          </div>
          <Button
            className="btn-primary-ssuet rounded-pill px-4 py-2"
            href="/booking"
            style={{ background: "#4B0082", border: "none" }}
          >
            <FaTicketAlt className="me-2" /> Book Tickets
          </Button>
        </div>

        <Tab.Container defaultActiveKey="tickets">
          <Nav variant="pills" className="mb-4 gap-2">
            <Nav.Item>
              <Nav.Link eventKey="tickets" className="rounded-pill px-4">
                <FaTicketAlt className="me-2" /> My Tickets
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="profile" className="rounded-pill px-4">
                <FaUser className="me-2" /> My Profile
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="tickets">
              {bookings.length === 0 ? (
                <Card className="text-center p-5 shadow-sm border-0 rounded-4">
                  <Card.Body>
                    <FaTicketAlt size={60} className="text-muted mb-3" />
                    <h4 className="fw-bold">No bookings yet</h4>
                    <p className="text-muted">
                      Book your first SSUET event ticket now!
                    </p>
                    <Button
                      className="btn-primary-ssuet rounded-pill px-4"
                      href="/events"
                      style={{ background: "#4B0082", border: "none" }}
                    >
                      Browse Events
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-4">
                  {bookings.map((booking) => {
                    const timeLeft = getTimeRemaining(booking.booking_date);

                    return (
                      <Col key={booking.id} md={6} lg={4}>
                        <Card className="dashboard-card h-100 shadow-sm">
                          <Card.Header className="bg-white border-0 pt-4 px-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <Card.Title className="fw-bold mb-0 fs-5">
                                {booking.event_name}
                              </Card.Title>
                              <Badge className="badge-success-ssuet">
                                Confirmed
                              </Badge>
                            </div>
                          </Card.Header>
                          <Card.Body className="px-4">
                            <div className="mb-3">
                              <FaCalendarAlt className="me-2" style={{ color: "#4B0082" }} />
                              <small className="text-muted">
                                {booking.event_date}
                              </small>
                            </div>
                            <div className="mb-3">
                              <FaMapMarkerAlt className="me-2" style={{ color: "#4B0082" }} />
                              <small className="text-muted">
                                {booking.event_venue}
                              </small>
                            </div>
                            <div className="mb-3">
                              <FaTicketAlt className="me-2" style={{ color: "#4B0082" }} />
                              <small className="text-muted">
                                {booking.num_tickets} tickets
                              </small>
                            </div>
                            <div className="mb-3">
                              <FaDollarSign className="me-2" style={{ color: "#4B0082" }} />
                              <strong>PKR {booking.total_price}/-</strong>
                            </div>
                          </Card.Body>
                          <Card.Footer className="bg-white border-0 pb-4 px-4">
                            <hr className="my-3" />
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                              <Button
                                variant="info"
                                size="sm"
                                className="rounded-pill px-3"
                                style={{ background: '#17a2b8', border: 'none', color: 'white' }}
                                onClick={() => handleDownloadTicket(booking)}
                              >
                                <FaDownload className="me-1" /> Get Ticket
                              </Button>
                              {timeLeft ? (
                                <>
                                  <div className="countdown-timer" style={{ color: "#006633", fontWeight: "bold" }}>
                                    Cancel within: {timeLeft}
                                  </div>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="rounded-pill px-3"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <FaTrash className="me-1" /> Cancel
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted small w-100 text-center">
                                  Cancellation period expired
                                </span>
                              )}
                            </div>
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="profile">
              <Card className="dashboard-card shadow-sm">
                <Card.Header
                  className="gradient-header"
                  style={{
                    background: "linear-gradient(135deg, #4B0082 0%, #6B3FA0 100%)",
                    color: "white",
                    padding: "1.5rem",
                    border: "none",
                    borderRadius: "20px 20px 0 0",
                  }}
                >
                  <h3 className="mb-0 fs-4 fw-bold">Edit Profile</h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleProfileUpdate}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            First Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-modern"
                            value={profile.first_name}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                first_name: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Last Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control-modern"
                            value={profile.last_name}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                last_name: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        className="form-control-modern"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Phone (Number)
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        className="form-control-modern"
                        value={profile.phone}
                        onChange={handlePhoneChange}
                        placeholder="03XXXXXXXXX"
                        isInvalid={!!phoneError}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {phoneError}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter a valid Number (e.g., 03XXXXXXXXX)
                      </Form.Text>
                    </Form.Group>

                    <Button
                      type="submit"
                      className="rounded-pill px-4 py-2"
                      style={{ background: "#4B0082", border: "none" }}
                      disabled={updating}
                    >
                      {updating ? "Updating..." : "Update Profile"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      {/* Ticket Modal */}
      {selectedBooking && selectedEvent && user && (
        <TicketModal
          show={showTicketModal}
          onHide={() => setShowTicketModal(false)}
          booking={selectedBooking}
          event={selectedEvent}
          user={user}
        />
      )}
    </div>
  );
};

export default UserDashboard;