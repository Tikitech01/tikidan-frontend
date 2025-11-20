import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import PageTitle from '../components/PageTitle';

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center p-3">
        <div 
          className="me-3 d-flex align-items-center justify-content-center rounded"
          style={{
            width: '48px',
            height: '48px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            color: 'white'
          }}
        >
          <Icon icon={icon} width="24" height="24" />
        </div>
        <div className="flex-grow-1">
          <h3 className="mb-0 fw-bold" style={{ color: '#313a46', fontSize: '1.75rem' }}>
            {value}
          </h3>
          <p className="mb-0 text-muted small fw-medium">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

const Reports: React.FC = () => {
  const stats = [
    {
      title: 'Total Meetings',
      value: 0,
      icon: 'mdi:calendar-multiple',
      color: '#188ae2',
    },
    {
      title: 'Clients',
      value: 0,
      icon: 'mdi:account-tie',
      color: '#31ce77',
    },
    {
      title: 'Repeat Visit',
      value: 0,
      icon: 'mdi:account-reload',
      color: '#fbcc5c',
    },
    {
      title: 'Total Quotation',
      value: 0,
      icon: 'mdi:file-document',
      color: '#6b5eae',
    },
    {
      title: 'Pending Quotation',
      value: 0,
      icon: 'mdi:clock-outline',
      color: '#f34943',
    },
  ];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownload = () => {
    console.log('Downloading report...', { startDate, endDate });
    // Add download logic here
  };

  return (
    <>
      <PageTitle 
        title="Reports Dashboard"
        subtitle="Overview of business metrics and analytics"
        icon="mdi:chart-line"
      />

      <Row className="g-3 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} lg={2} md={4} sm={6}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={4} sm={12}>
                  <Button 
                    variant="primary" 
                    onClick={handleDownload}
                    className="d-flex align-items-center"
                  >
                    <Icon icon="mdi:download" className="me-2" />
                    Download Report
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Reports;
