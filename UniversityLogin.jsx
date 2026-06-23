// frontend/src/pages/UniversityLogin.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner, Tab, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaIdCard, FaLock, FaGraduationCap, FaUniversity, FaArrowRight, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

const UniversityLogin = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('student');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateRegistrationNumber = (regNo) => {
        const pattern = /^(\d{4})(F|S)-([A-Z]{3,4})-(\d{1,3})$/i;
        return pattern.test(regNo);
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Auto-format registration number for student
    const handleLoginIdChange = (e) => {
        let value = e.target.value;

        if (userType === 'student') {
            value = value.toUpperCase();
            // Remove any invalid characters
            value = value.replace(/[^A-Z0-9-]/g, '');

            // Auto-add hyphens as user types
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
            setLoginId(value);
        } else {
            setLoginId(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!loginId || !password) {
            setError('Please enter both login ID and password');
            return;
        }

        if (userType === 'student' && !validateRegistrationNumber(loginId)) {
            setError('Invalid Registration Number format. Example: 2023F-BSE-332');
            return;
        }

        if (userType === 'admin' && !validateEmail(loginId)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        // Pass userType as 'student' or 'admin' - AuthContext will convert to backend format
        const result = await login(loginId, password, userType);

        if (result.success) {
            if (rememberMe && userType === 'student') {
                localStorage.setItem('rememberedUser', loginId);
            } else {
                localStorage.removeItem('rememberedUser');
            }

            if (result.isAdmin) {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } else {
            setError(result.error || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    // Load remembered user on component mount
    useEffect(() => {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            setLoginId(remembered);
            setRememberMe(true);
        }
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
            padding: '40px 20px'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card style={{
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                            borderRadius: '20px',
                            overflow: 'hidden'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '30px 20px',
                                textAlign: 'center',
                                background: '#4B0082'
                            }}>
                                <FaUniversity size={45} style={{ color: 'white', marginBottom: '15px' }} />
                                <h2 style={{ color: 'white', marginBottom: '5px', fontWeight: 'bold' }}>S.E.M.S PORTAL</h2>
                                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0' }}>Login to access your dashboard</p>
                            </div>

                            {/* Tabs for Student and Admin */}
                            <Tab.Container activeKey={userType} onSelect={(k) => {
                                setUserType(k);
                                setLoginId('');
                                setPassword('');
                                setError('');
                            }}>
                                <Nav variant="pills" className="mt-3 justify-content-center gap-3 px-3">
                                    <Nav.Item>
                                        <Nav.Link eventKey="student" className="rounded-pill px-4" style={{ color: '#4B0082' }}>
                                            <FaGraduationCap className="me-2" /> Student
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="admin" className="rounded-pill px-4" style={{ color: '#4B0082' }}>
                                            <FaShieldAlt className="me-2" /> Admin
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <div style={{ padding: '30px' }}>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Login ID Field */}
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                {userType === 'student' ? 'Registration Number' : 'Email Address'}
                                            </Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text style={{
                                                    background: '#f8f9fa',
                                                    border: '1px solid #e0e0e0',
                                                    borderRight: 'none',
                                                    borderRadius: '12px 0 0 12px'
                                                }}>
                                                    {userType === 'student' ? <FaIdCard style={{ color: '#4B0082' }} /> : <FaEnvelope style={{ color: '#4B0082' }} />}
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type={userType === 'student' ? 'text' : 'email'}
                                                    placeholder={userType === 'student' ? '2023F-BSE-332' : 'admin@example.com'}
                                                    value={loginId}
                                                    onChange={handleLoginIdChange}
                                                    style={{
                                                        fontFamily: userType === 'student' ? 'monospace' : 'inherit',
                                                        fontSize: '1rem',
                                                        letterSpacing: userType === 'student' ? '0.5px' : 'normal',
                                                        border: '1px solid #e0e0e0',
                                                        borderLeft: 'none',
                                                        borderRadius: '0 12px 12px 0',
                                                        padding: '12px 15px'
                                                    }}
                                                    required
                                                />
                                            </InputGroup>
                                            {userType === 'student' && (
                                                <Form.Text style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                                    <strong>Format:</strong> YYYY[S/F]-DEGREE-ROLLNO<br />
                                                    <strong>Example:</strong> 2023F-BSE-332 (Batch 2023 Fall, Software Engineering, Roll 332)
                                                </Form.Text>
                                            )}
                                            {userType === 'admin' && (
                                                <Form.Text style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                                    <strong>Demo Admin:</strong> admin@example.com
                                                </Form.Text>
                                            )}
                                        </Form.Group>

                                        {/* Password Field */}
                                        <Form.Group className="mb-4">
                                            <Form.Label style={{ fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                <FaLock style={{ marginRight: '8px', color: '#4B0082' }} /> Password
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                style={{
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '12px',
                                                    padding: '12px 15px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                required
                                            />
                                            {userType === 'student' ? (
                                                <Form.Text style={{ marginTop: '8px', color: '#666', fontSize: '12px', display: 'block' }}>
                                                    Use the password you set during registration
                                                </Form.Text>
                                            ) : (
                                                <Form.Text style={{ marginTop: '8px', color: '#666', fontSize: '12px', display: 'block' }}>
                                                    <strong>Demo Password:</strong> admin123
                                                </Form.Text>
                                            )}
                                        </Form.Group>

                                        {/* Remember Me & Forgot Password */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                            <Form.Check
                                                type="checkbox"
                                                label="Remember me"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                style={{ color: '#555' }}
                                            />
                                            <Link to="/forgot-password" style={{ color: '#006633', textDecoration: 'none', fontSize: '14px' }}>
                                                Forgot password?
                                            </Link>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <Alert variant="danger" style={{ borderRadius: '12px', marginBottom: '20px' }}>
                                                {error}
                                            </Alert>
                                        )}

                                        {/* Sign In Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                width: '100%',
                                                padding: '14px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '16px',
                                                background: 'linear-gradient(135deg, #4B0082, #6B3FA0)',
                                                border: 'none',
                                                color: 'white',
                                                transition: 'all 0.3s ease'
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
                                            {loading ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" style={{ marginRight: '8px' }} />
                                                    Signing In...
                                                </>
                                            ) : (
                                                <>
                                                    Sign In <FaArrowRight style={{ marginLeft: '8px' }} />
                                                </>
                                            )}
                                        </Button>

                                        {/* Register Link (only for students) */}
                                        {userType === 'student' && (
                                            <div style={{ textAlign: 'center', marginTop: '25px' }}>
                                                <p style={{ color: '#666', marginBottom: '0' }}>
                                                    Don't have an account?{' '}
                                                    <Link to="/register" style={{ color: '#4B0082', textDecoration: 'none', fontWeight: '600' }}>
                                                        Register here
                                                    </Link>
                                                </p>
                                                <small style={{ color: '#999' }}>
                                                    New students use your registration number to register
                                                </small>
                                            </div>
                                        )}
                                    </Form>
                                </div>
                            </Tab.Container>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UniversityLogin;