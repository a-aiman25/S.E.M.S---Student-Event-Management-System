import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ContactSuccess = () => {
  return (
    <Container className="py-5" style={{ background: '#f5f5f5', minHeight: '80vh' }}>
      <Card className="text-center shadow-sm mx-auto border-0 rounded-4" style={{ maxWidth: '500px' }}>
        <Card.Body className="p-5">
          <FaCheckCircle size={60} style={{ color: '#006633' }} className="mb-3" />
          <h2 className="mb-3 fw-bold" style={{ color: '#4B0082' }}>Message Sent Successfully!</h2>
          <p className="text-muted mb-4">
            Thank you for contacting SSUET Event Management System. 
            We'll get back to you as soon as possible.
          </p>
          <Button as={Link} to="/" className="btn-primary-ssuet px-4">
            Return to Home
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactSuccess;