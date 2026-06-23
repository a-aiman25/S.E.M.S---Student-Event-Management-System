import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard, FaGraduationCap, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { degreeCodes, getDegreeName, getAllDegrees } from '../utils/degreeCodes';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    registration_number: '',
    degree: '',
    batch_year: '',
    semester: '',
    roll_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingReg, setValidatingReg] = useState(false);
  const [regValid, setRegValid] = useState(null);
  const [regExists, setRegExists] = useState(false);
  const [parsedInfo, setParsedInfo] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const degreeOptions = getAllDegrees();

  // Auto-parse registration number
  const validateRegistrationNumber = async (regNo) => {
    if (!regNo || regNo.length < 10) {
      setRegValid(null);
      setParsedInfo(null);
      return;
    }

    setValidatingReg(true);
    try {
      const response = await axios.post('/api/validate-registration', { registration_number: regNo });
      if (response.data.success) {
        setRegValid(response.data.valid);
        setRegExists(response.data.exists);
        if (response.data.parsed) {
          setParsedInfo(response.data.parsed);
          // Auto-fill degree, batch_year, semester, roll_number
          setFormData(prev => ({
            ...prev,
            degree: response.data.parsed.degree,
            batch_year: response.data.parsed.batch_year,
            semester: response.data.parsed.semester_code,
            roll_number: response.data.parsed.roll_number
          }));
        }
      } else {
        setRegValid(false);
        setParsedInfo(null);
      }
    } catch (error) {
      setRegValid(false);
      setParsedInfo(null);
    } finally {
      setValidatingReg(false);
    }
  };

  const handleRegistrationChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Auto-add hyphens
    if (value.length === 4 && !value.includes('-')) {
      value = value + '-';
    } else if (value.length === 6 && value.includes('-') && value.split('-')[1]?.length === 1) {
      const parts = value.split('-');
      if (parts[1] && parts[1].match(/[FS]/i)) {
        value = `${parts[0]}-${parts[1]}-`;
      }
    }
    
    if (value.length <= 15) {
      setFormData({ ...formData, registration_number: value });
      validateRegistrationNumber(value);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!regValid) {
      setError('Please enter a valid registration number');
      return;
    }
    
    if (regExists) {
      setError('This registration number is already registered. Please login instead.');
      return;
    }
    
    setLoading(true);
    
    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      registration_number: formData.registration_number,
      degree: formData.degree,
      batch_year: formData.batch_year,
      semester: formData.semester,
      roll_number: formData.roll_number
    });
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', background: '#f5f5f5' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="p-4 text-center" style={{ background: '#4B0082' }}>
                <h2 className="text-white mb-0 fw-bold">Join SSUET</h2>
                <p className="text-white-50 mb-0">Create your S.E.M.S account with Registration Number</p>
              </div>
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit}>
                  {/* Registration Number Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FaIdCard className="me-2" /> Registration Number <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: '#f8f9fa' }}>
                        <FaGraduationCap />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="registration_number"
                        placeholder="2023F-BSE-332"
                        className="form-control-modern"
                        value={formData.registration_number}
                        onChange={handleRegistrationChange}
                        style={{ fontFamily: 'monospace' }}
                        required
                        isInvalid={formData.registration_number && !regValid}
                        isValid={formData.registration_number && regValid && !regExists}
                      />
                    </InputGroup>
                    {validatingReg && (
                      <div className="mt-1 text-info">
                        <FaSpinner className="spin me-1" /> Validating registration number...
                      </div>
                    )}
                    {formData.registration_number && regValid && !regExists && (
                      <div className="mt-1 text-success">
                        <FaCheckCircle className="me-1" /> Valid registration number!
                        {parsedInfo && (
                          <div className="mt-1 small">
                            <strong>Batch:</strong> {parsedInfo.batch_year} ({parsedInfo.semester}) | 
                            <strong> Degree:</strong> {parsedInfo.degree} | 
                            <strong> Roll:</strong> {parsedInfo.roll_number}
                          </div>
                        )}
                      </div>
                    )}
                    {formData.registration_number && regValid && regExists && (
                      <div className="mt-1 text-warning">
                        ⚠️ This registration number is already registered. Please <Link to="/login">login</Link> instead.
                      </div>
                    )}
                    {formData.registration_number && !regValid && !validatingReg && (
                      <div className="mt-1 text-danger">
                        Invalid format. Use: YYYY[S/F]-DEGREE-ROLLNO (e.g., 2023F-BSE-332)
                      </div>
                    )}
                    <Form.Text className="text-muted">
                      Enter your university-issued registration number exactly as provided
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">First Name <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{ background: '#f8f9fa' }}>
                            <FaUser />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="first_name"
                            placeholder="First name"
                            className="form-control-modern"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Last Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          placeholder="Last name"
                          className="form-control-modern"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: '#f8f9fa' }}>
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className="form-control-modern"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Use your personal or university email address
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Phone Number <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ background: '#f8f9fa' }}>
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="03XXXXXXXXX"
                        className="form-control-modern"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Pakistani number: 03XXXXXXXXX
                    </Form.Text>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Password <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{ background: '#f8f9fa' }}>
                            <FaLock />
                          </InputGroup.Text>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-control-modern"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Confirm Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="confirm_password"
                          placeholder="Confirm password"
                          className="form-control-modern"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Hidden fields for degree info (auto-filled) */}
                  <input type="hidden" name="degree" value={formData.degree} />
                  <input type="hidden" name="batch_year" value={formData.batch_year} />
                  <input type="hidden" name="semester" value={formData.semester} />
                  <input type="hidden" name="roll_number" value={formData.roll_number} />
                  
                  {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                  
                  <Button 
                    className="w-100 py-3 rounded-3 fw-semibold"
                    style={{ background: '#4B0082', border: 'none' }}
                    type="submit"
                    disabled={loading || !regValid || regExists}
                  >
                    {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Creating Account...</> : 'Register'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#4B0082' }}>
                        Login here
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;