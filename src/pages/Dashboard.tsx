import React from 'react';
import { Row, Col } from 'react-bootstrap';

const Dashboard: React.FC = () => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4 className="mb-1" style={{ color: '#333', fontWeight: 600 }}>Dashboard</h4>
          <p className="text-muted" style={{ fontSize: '14px' }}>Coming soon...</p>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
