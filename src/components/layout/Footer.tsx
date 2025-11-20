import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto w-100">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div className="footer-text">
            © {currentYear} Tikidan SaaS. All rights reserved.
          </div>
          <div className="footer-links">
            <span className="text-muted">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;