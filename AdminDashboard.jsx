// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Table, Modal, Form,
  Alert, Spinner, Badge, Nav, Tab, InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUsers, FaCalendarAlt, FaTicketAlt, FaDollarSign,
  FaChartLine, FaPlus, FaEdit, FaTrash, FaEye,
  FaCheckCircle, FaClock, FaEnvelope, FaChartBar,
  FaDownload, FaFilter, FaSearch, FaUserCheck,
  FaTags, FaVenusMars, FaCog, FaBell, FaDatabase
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingContacts: 0
  });
  
  // Data states
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactReplyModal, setShowContactReplyModal] = useState(false);
  
  // Form states
  const [eventForm, setEventForm] = useState({
    name: '', date: '', venue: '', price: 0, available_tickets: 0,
    description: '', category: 'Society-Led Events', is_free: false,
    early_bird_discount: 10, early_bird_deadline: 5, has_early_bird: true,
    registration_link: ''
  });
  
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Chart data states
  const [salesChartData, setSalesChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [bookingTrendData, setBookingTrendData] = useState(null);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all dashboard data
  useEffect(() => {
    if (user?.is_admin) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await axios.get('/api/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      
      // Fetch events
      const eventsRes = await axios.get('/api/admin/events');
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events);
      }
      
      // Fetch users
      const usersRes = await axios.get('/api/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      
      // Fetch bookings
      const bookingsRes = await axios.get('/api/admin/bookings');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
        prepareCharts(bookingsRes.data.bookings, eventsRes.data.events);
      }
      
      // Fetch contacts
      const contactsRes = await axios.get('/api/admin/contacts');
      if (contactsRes.data.success) {
        setContacts(contactsRes.data.contacts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const prepareCharts = (bookingsData, eventsData) => {
    // Sales by event chart (Pie)
    const eventSales = {};
    bookingsData.forEach(booking => {
      if (booking.status === 'active') {
        eventSales[booking.event_name] = (eventSales[booking.event_name] || 0) + booking.total_price;
      }
    });
    
    const pieLabels = Object.keys(eventSales).slice(0, 6);
    const pieData = Object.values(eventSales).slice(0, 6);
    
    setSalesChartData({
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: ['#4B0082', '#6B3FA0', '#006633', '#008844', '#FF8C00', '#FFA500', '#17a2b8', '#dc3545'],
        borderWidth: 0,
      }]
    });
    
    // Category distribution (Bar)
    const categoryCount = {};
    if (eventsData) {
      eventsData.forEach(event => {
        const cat = event.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    }
    
    setCategoryChartData({
      labels: Object.keys(categoryCount),
      datasets: [{
        label: 'Number of Events',
        data: Object.values(categoryCount),
        backgroundColor: '#4B0082',
        borderRadius: 8,
      }]
    });
    
    // Booking trend (Line) - last 7 days
    const last7Days = [];
    const dailyBookings = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      dailyBookings[dateStr] = 0;
    }
    
    bookingsData.forEach(booking => {
      const bookingDate = booking.booking_date?.split('T')[0];
      if (dailyBookings.hasOwnProperty(bookingDate)) {
        dailyBookings[bookingDate]++;
      }
    });
    
    setBookingTrendData({
      labels: last7Days.map(d => d.substring(5)),
      datasets: [{
        label: 'Bookings',
        data: last7Days.map(d => dailyBookings[d]),
        borderColor: '#4B0082',
        backgroundColor: 'rgba(75, 0, 130, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4B0082',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    });
  };

  // Event CRUD operations
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setEventForm({
      name: '', date: '', venue: '', price: 0, available_tickets: 0,
      description: '', category: 'Society-Led Events', is_free: false,
      early_bird_discount: 10, early_bird_deadline: 5, has_early_bird: true,
      registration_link: ''
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      name: event.name || '',
      date: event.date?.split('T')[0] || '',
      venue: event.venue || '',
      price: event.price || 0,
      available_tickets: event.available_tickets || 0,
      description: event.description || '',
      category: event.category || 'Society-Led Events',
      is_free: event.is_free || false,
      early_bird_discount: event.early_bird_discount || 10,
      early_bird_deadline: event.early_bird_deadline || 5,
      has_early_bird: event.has_early_bird !== undefined ? event.has_early_bird : true,
      registration_link: event.registration_link || ''
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      const response = await axios.delete(`/api/admin/events/${selectedEvent.id}`);
      if (response.data.success) {
        toast.success('Event deleted successfully');
        fetchDashboardData();
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
    }
  };

  const handleSaveEvent = async () => {
    setSubmitting(true);
    try {
      let response;
      if (selectedEvent) {
        response = await axios.put(`/api/admin/events/${selectedEvent.id}`, eventForm);
      } else {
        response = await axios.post('/api/admin/events', eventForm);
      }
      
      if (response.data.success) {
        toast.success(selectedEvent ? 'Event updated successfully' : 'Event added successfully');
        setShowEventModal(false);
        fetchDashboardData();
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  // User management - FIXED VERSION
  const handleDeleteUser = async (userItem) => {
    if (!window.confirm(`Are you sure you want to delete user ${userItem.first_name} ${userItem.last_name}? This action cannot be undone.`)) {
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axios.delete(`/api/admin/users/${userItem.id}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        // Refresh the users list
        fetchDashboardData();
      } else {
        toast.error(response.data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete user. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Contact management
  const handleMarkContactRead = async (contact) => {
    try {
      const response = await axios.put(`/api/admin/contacts/${contact.id}/read`);
      if (response.data.success) {
        toast.success('Marked as read');
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteContact = async (contact) => {
    if (!window.confirm('Delete this contact message?')) return;
    
    try {
      const response = await axios.delete(`/api/admin/contacts/${contact.id}`);
      if (response.data.success) {
        toast.success('Contact deleted');
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleReplyContact = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
    setShowContactReplyModal(true);
  };

  const sendReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    toast.success(`Reply sent to ${selectedContact.email}`);
    setShowContactReplyModal(false);
    setSelectedContact(null);
    setReplyMessage('');
  };

  // Mark attendance
  const handleMarkAttendance = (booking) => {
    toast.success(`Attendance marked for ${booking.user_name}`);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3 text-muted">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <div className="admin-dashboard" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Container fluid className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="display-6 fw-bold" style={{ color: '#4B0082' }}>
              Admin Dashboard
            </h1>
            <p className="text-muted mb-0">
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <Button 
            className="btn-primary-ssuet rounded-pill px-4"
            onClick={handleAddEvent}
            style={{ background: '#4B0082', border: 'none' }}
          >
            <FaPlus className="me-2" /> Add New Event
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-purple-light">
                  <FaCalendarAlt size={30} style={{ color: '#4B0082' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">{stats.totalEvents}</h3>
                <p className="text-muted small mb-0">Total Events</p>
                <small className="text-success">{stats.activeEvents} Active</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-green-light">
                  <FaUsers size={30} style={{ color: '#006633' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">{stats.totalUsers}</h3>
                <p className="text-muted small mb-0">Registered Students</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-orange-light">
                  <FaTicketAlt size={30} style={{ color: '#FF8C00' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">{stats.totalBookings}</h3>
                <p className="text-muted small mb-0">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-teal-light">
                  <FaDollarSign size={30} style={{ color: '#17a2b8' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">PKR {stats.totalRevenue?.toLocaleString()}</h3>
                <p className="text-muted small mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-red-light">
                  <FaEnvelope size={30} style={{ color: '#dc3545' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">{stats.pendingContacts}</h3>
                <p className="text-muted small mb-0">Pending Inquiries</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4} xl={2}>
            <Card className="stat-card-admin border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="stat-icon bg-info-light">
                  <FaChartLine size={30} style={{ color: '#17a2b8' }} />
                </div>
                <h3 className="mt-3 mb-0 fw-bold">{(stats.totalRevenue / (stats.totalBookings || 1)).toFixed(0)}</h3>
                <p className="text-muted small mb-0">Avg. Ticket Value</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="g-4 mb-4">
          <Col lg={5}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="fw-bold mb-0"><FaChartBar className="me-2" style={{ color: '#4B0082' }} />Revenue by Event</h5>
              </Card.Header>
              <Card.Body>
                {salesChartData ? (
                  <div style={{ height: '280px' }}>
                    <Pie data={salesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={7}>
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="fw-bold mb-0"><FaChartLine className="me-2" style={{ color: '#4B0082' }} />Booking Trend (Last 7 Days)</h5>
              </Card.Header>
              <Card.Body>
                {bookingTrendData ? (
                  <div style={{ height: '280px' }}>
                    <Line data={bookingTrendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
                  </div>
                ) : (
                  <p className="text-muted text-center py-5">No data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs for different sections */}
        <Tab.Container defaultActiveKey="events">
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-white border-0 pt-4">
              <Nav variant="pills" className="gap-2">
                <Nav.Item>
                  <Nav.Link eventKey="events" className="rounded-pill px-4">
                    <FaCalendarAlt className="me-2" /> Manage Events
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="users" className="rounded-pill px-4">
                    <FaUsers className="me-2" /> Registered Students
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="bookings" className="rounded-pill px-4">
                    <FaTicketAlt className="me-2" /> All Bookings
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="contacts" className="rounded-pill px-4">
                    <FaEnvelope className="me-2" /> Contact Messages
                    {stats.pendingContacts > 0 && (
                      <Badge bg="danger" className="ms-2 rounded-pill">{stats.pendingContacts}</Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="attendance" className="rounded-pill px-4">
                    <FaUserCheck className="me-2" /> Mark Attendance
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Content>
                {/* Events Tab */}
                <Tab.Pane eventKey="events">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div className="d-flex gap-3">
                      <InputGroup style={{ width: '250px' }}>
                        <InputGroup.Text style={{ background: '#f8f9fa' }}>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                      <Form.Select 
                        style={{ width: '180px' }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </div>
                    <Button className="btn-primary-ssuet rounded-pill px-4" onClick={handleAddEvent}>
                      <FaPlus className="me-2" /> Add Event
                    </Button>
                  </div>
                  
                  <div className="table-responsive">
                    <Table className="admin-table" hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Event Name</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Venue</th>
                          <th>Price</th>
                          <th>Available</th>
                          <th>Early Bird</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.length === 0 ? (
                          <tr><td colSpan="10" className="text-center py-5">No events found</td></tr>
                        ) : (
                          filteredEvents.map(event => (
                            <tr key={event.id}>
                              <td>{event.id}</td>
                              <td className="fw-semibold">{event.name}</td>
                              <td><Badge className="category-badge-mini">{event.category || 'General'}</Badge></td>
                              <td>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</td>
                              <td>{event.venue}</td>
                              <td>{event.is_free ? 'FREE' : `PKR ${event.price}`}</td>
                              <td>{event.available_tickets}</td>
                              <td>{event.has_early_bird ? `${event.early_bird_discount}%` : 'No'}</td>
                              <td>
                                <Badge className={event.status === 'active' ? 'badge-success' : 'badge-danger'}>
                                  {event.status}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="outline-primary" size="sm" className="me-2 rounded-circle" onClick={() => handleEditEvent(event)}>
                                  <FaEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" className="rounded-circle" onClick={() => handleDeleteEvent(event)}>
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>

                {/* Users Tab */}
                <Tab.Pane eventKey="users">
                  <div className="mb-4">
                    <InputGroup style={{ width: '300px' }}>
                      <InputGroup.Text><FaSearch /></InputGroup.Text>
                      <Form.Control placeholder="Search by name or registration..." />
                    </InputGroup>
                  </div>
                  <div className="table-responsive">
                    <Table className="admin-table" hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Registration #</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Degree</th>
                          <th>Batch</th>
                          <th>Registered On</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan="9" className="text-center py-5">No users found</td></tr>
                        ) : (
                          users.map(userItem => (
                            <tr key={userItem.id}>
                              <td>{userItem.id}</td>
                              <td><code>{userItem.registration_number}</code></td>
                              <td className="fw-semibold">{userItem.first_name} {userItem.last_name}</td>
                              <td>{userItem.email}</td>
                              <td>{userItem.phone || 'N/A'}</td>
                              <td>{userItem.degree || 'N/A'}</td>
                              <td>{userItem.batch_year || 'N/A'}</td>
                              <td>{userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}</td>
                              <td>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="rounded-circle" 
                                  onClick={() => handleDeleteUser(userItem)}
                                  disabled={submitting}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>

                {/* Bookings Tab */}
                <Tab.Pane eventKey="bookings">
                  <div className="table-responsive">
                    <Table className="admin-table" hover>
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Student Name</th>
                          <th>Registration #</th>
                          <th>Event</th>
                          <th>Tickets</th>
                          <th>Total Price</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                          <th>Booking Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr><td colSpan="9" className="text-center py-5">No bookings found</td></tr>
                        ) : (
                          bookings.map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id}</td>
                              <td className="fw-semibold">{booking.user_name}</td>
                              <td><code>{booking.registration_number}</code></td>
                              <td>{booking.event_name}</td>
                              <td>{booking.num_tickets}</td>
                              <td>PKR {booking.total_price}</td>
                              <td>{booking.payment_method}</td>
                              <td>
                                <Badge className={booking.status === 'active' ? 'badge-success' : 'badge-danger'}>
                                  {booking.status}
                                </Badge>
                              </td>
                              <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>

                {/* Contacts Tab */}
                <Tab.Pane eventKey="contacts">
                  <div className="table-responsive">
                    <Table className="admin-table" hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Message</th>
                          <th>Submitted</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-5">No messages found</td></tr>
                        ) : (
                          contacts.map(contact => (
                            <tr key={contact.id}>
                              <td>{contact.id}</td>
                              <td className="fw-semibold">{contact.name}</td>
                              <td>{contact.email}</td>
                              <td style={{ maxWidth: '250px' }} className="text-truncate">{contact.message}</td>
                              <td>{contact.submission_date ? new Date(contact.submission_date).toLocaleString() : 'N/A'}</td>
                              <td>
                                <Badge className={contact.status === 'unread' ? 'badge-warning' : 'badge-success'}>
                                  {contact.status === 'unread' ? 'Unread' : 'Read'}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="outline-info" size="sm" className="me-2 rounded-circle" onClick={() => handleReplyContact(contact)}>
                                  <FaEnvelope />
                                </Button>
                                {contact.status === 'unread' && (
                                  <Button variant="outline-success" size="sm" className="me-2 rounded-circle" onClick={() => handleMarkContactRead(contact)}>
                                    <FaCheckCircle />
                                  </Button>
                                )}
                                <Button variant="outline-danger" size="sm" className="rounded-circle" onClick={() => handleDeleteContact(contact)}>
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>

                {/* Attendance Tab */}
                <Tab.Pane eventKey="attendance">
                  <div className="table-responsive">
                    <Table className="admin-table" hover>
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Student Name</th>
                          <th>Registration #</th>
                          <th>Event</th>
                          <th>Event Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.filter(b => b.status === 'active').length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-5">No active bookings found</td></tr>
                        ) : (
                          bookings.filter(b => b.status === 'active').map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id}</td>
                              <td className="fw-semibold">{booking.user_name}</td>
                              <td><code>{booking.registration_number}</code></td>
                              <td>{booking.event_name}</td>
                              <td>{booking.event_date ? new Date(booking.event_date).toLocaleDateString() : 'N/A'}</td>
                              <td>
                                <Button variant="success" size="sm" className="rounded-pill px-3" onClick={() => handleMarkAttendance(booking)}>
                                  <FaUserCheck className="me-1" /> Mark Present
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>

      {/* Add/Edit Event Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#4B0082', color: 'white' }}>
          <Modal.Title>{selectedEvent ? 'Edit Event' : 'Add New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name *</Form.Label>
                  <Form.Control type="text" value={eventForm.name} onChange={(e) => setEventForm({...eventForm, name: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Venue *</Form.Label>
                  <Form.Control type="text" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})}>
                    <option>Major Festivals & Trips</option>
                    <option>Tech & Academia</option>
                    <option>Seminars & Workshops</option>
                    <option>Internship Programs</option>
                    <option>Sports & Competitions</option>
                    <option>Society-Led Events</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (PKR)</Form.Label>
                  <Form.Control type="number" value={eventForm.price} onChange={(e) => setEventForm({...eventForm, price: parseFloat(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Available Tickets *</Form.Label>
                  <Form.Control type="number" value={eventForm.available_tickets} onChange={(e) => setEventForm({...eventForm, available_tickets: parseInt(e.target.value)})} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Free Event?</Form.Label>
                  <Form.Check type="switch" label="Free" checked={eventForm.is_free} onChange={(e) => setEventForm({...eventForm, is_free: e.target.checked})} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Registration Link (for free events)</Form.Label>
              <Form.Control type="url" value={eventForm.registration_link} onChange={(e) => setEventForm({...eventForm, registration_link: e.target.value})} placeholder="https://forms.gle/..." />
            </Form.Group>
            <hr />
            <h6 className="fw-bold mb-3"><FaTags className="me-2" />Early Bird Settings</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Early Bird Discount (%)</Form.Label>
                  <Form.Control type="number" value={eventForm.early_bird_discount} onChange={(e) => setEventForm({...eventForm, early_bird_discount: parseInt(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Early Bird Deadline (days before)</Form.Label>
                  <Form.Control type="number" value={eventForm.early_bird_deadline} onChange={(e) => setEventForm({...eventForm, early_bird_deadline: parseInt(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Enable Early Bird</Form.Label>
                  <Form.Check type="switch" label="Enable" checked={eventForm.has_early_bird} onChange={(e) => setEventForm({...eventForm, has_early_bird: e.target.checked})} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>Cancel</Button>
          <Button className="btn-primary-ssuet" onClick={handleSaveEvent} disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            {selectedEvent ? 'Update Event' : 'Add Event'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete event <strong>{selectedEvent?.name}</strong>?
          <p className="text-danger small mt-2">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteEvent} disabled={submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : null}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reply Contact Modal */}
      <Modal show={showContactReplyModal} onHide={() => setShowContactReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {selectedContact?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Your Reply</Form.Label>
            <Form.Control as="textarea" rows={5} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your response here..." />
          </Form.Group>
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted">Original message:</small>
            <p className="small mt-1 mb-0">{selectedContact?.message}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactReplyModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={sendReply} style={{ background: '#006633', border: 'none' }}>
            <FaEnvelope className="me-2" /> Send Reply
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .stat-card-admin {
          transition: all 0.3s ease;
          border-radius: 16px;
        }
        .stat-card-admin:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .bg-purple-light { background: rgba(75, 0, 130, 0.1); }
        .bg-green-light { background: rgba(0, 102, 51, 0.1); }
        .bg-orange-light { background: rgba(255, 140, 0, 0.1); }
        .bg-teal-light { background: rgba(23, 162, 184, 0.1); }
        .bg-red-light { background: rgba(220, 53, 69, 0.1); }
        .bg-info-light { background: rgba(23, 162, 184, 0.1); }
        
        .admin-table thead th {
          background: #f8f9fa;
          border-bottom: 2px solid #4B0082;
          padding: 12px;
          font-weight: 600;
        }
        .admin-table tbody td {
          padding: 10px 12px;
          vertical-align: middle;
        }
        .category-badge-mini {
          background: #4B0082;
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .badge-success {
          background: #006633;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .badge-danger {
          background: #dc3545;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .badge-warning {
          background: #FF8C00;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .nav-pills .nav-link.active {
          background: #4B0082;
        }
        .nav-pills .nav-link {
          color: #4B0082;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;