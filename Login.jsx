import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaUserGraduate, FaShieldAlt, FaIdCard } from 'react-icons/fa';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateRegistrationNumber = (regNo) => {
    const pattern = /^(\d{4})(F|S)-([A-Z]{3,4})-(\d{1,3})$/i;
    return pattern.test(regNo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginId || !password) {
      setError('Please enter both login ID and password');
      return;
    }
    
    // Validate based on user type
    if (userType === 'student' && !validateRegistrationNumber(loginId)) {
      setError('Invalid Registration Number format. Example: 2023F-BSE-332');
      return;
    }
    
    if (userType === 'admin' && !loginId.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);

    // For student: send registration number, For admin: send email
    const result = await login(loginId, password, userType);
    
    if (result.success) {
      if (result.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Auto-format registration number as user types
  const handleLoginIdChange = (e) => {
    let value = e.target.value;
    
    if (userType === 'student') {
      value = value.toUpperCase();
      // Auto-add hyphens for registration number
      if (value.length === 4 && !value.includes('-')) {
        value = value + '-';
      } else if (value.length === 6 && value.includes('-') && value.split('-')[1]?.length === 1) {
        const parts = value.split('-');
        if (parts[1] && parts[1].match(/[FS]/i)) {
          value = `${parts[0]}-${parts[1]}-`;
        }
      }
      // Limit length
      if (value.length > 15) return;
    }
    
    setLoginId(value);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', background: '#f5f5f5' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="p-4 text-center" style={{ background: '#4B0082' }}>
                <h2 className="text-white mb-0 fw-bold">Welcome to SSUET</h2>
                <p className="text-white-50 mb-0">Login to S.E.M.S Portal</p>
              </div>
              <Card.Body className="p-5">
                <Tab.Container activeKey={userType} onSelect={(k) => {
                  setUserType(k);
                  setLoginId(''); // Clear login ID when switching tabs
                  setError('');
                }}>
                  <Nav variant="pills" className="mb-4 justify-content-center gap-3">
                    <Nav.Item>
                      <Nav.Link eventKey="student" className="rounded-pill px-4" style={{ color: '#4B0082' }}>
                        <FaUserGraduate className="me-2" /> Student
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="admin" className="rounded-pill px-4" style={{ color: '#4B0082' }}>
                        <FaShieldAlt className="me-2" /> Admin
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        {userType === 'student' ? 'Registration Number' : 'Email Address'}
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light rounded-start-pill">
                          {userType === 'student' ? <FaIdCard className="text-muted" /> : <FaEnvelope className="text-muted" />}
                        </span>
                        <Form.Control
                          type={userType === 'student' ? 'text' : 'email'}
                          placeholder={userType === 'student' ? '2023F-BSE-332' : 'admin@example.com'}
                          className="border-0 bg-light rounded-end-pill py-2"
                          style={userType === 'student' ? { fontFamily: 'monospace' } : {}}
                          value={loginId}
                          onChange={handleLoginIdChange}
                          required
                        />
                      </div>
                      {userType === 'student' && (
                        <Form.Text className="text-muted">
                          Format: YYYY[S/F]-DEGREE-ROLLNO (e.g., 2023F-BSE-332)
                        </Form.Text>
                      )}
                      {userType === 'admin' && (
                        <Form.Text className="text-muted">
                          Enter your admin email address
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light rounded-start-pill">
                          <FaLock className="text-muted" />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="Enter your password"
                          className="border-0 bg-light rounded-end-pill py-2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      {userType === 'admin' && (
                        <Form.Text className="text-muted">
                          Default admin password: <strong>admin123</strong>
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    {error && <Alert variant="danger" className="rounded-pill text-center">{error}</Alert>}
                    
                    <Button 
                      className="w-100 py-3 rounded-pill fw-semibold"
                      style={{ background: '#4B0082', border: 'none' }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    
                    {userType === 'student' && (
                      <div className="text-center mt-4">
                        <p className="text-muted mb-0">
                          Don't have an account?{' '}
                          <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: '#4B0082' }}>
                            Register here
                          </Link>
                        </p>
                      </div>
                    )}
                  </Form>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;