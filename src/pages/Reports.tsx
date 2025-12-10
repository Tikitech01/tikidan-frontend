import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Tab, Tabs, Table, InputGroup, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

interface DashboardMetrics {
  totalMeetings: number;
  totalClients: number;
  repeatVisits: number;
  totalQuotations: number;
  pendingQuotations: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  employeeId: string;
  meetings: number;
  average: string | number;
}

interface Meeting {
  _id: string;
  title: string;
  date: string;
  time: string;
  client: {
    _id: string;
    clientName: string;
  };
  location: {
    _id: string;
    name: string;
    address?: string;
    city?: string;
  };
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    capturedAt: string;
  };
}

const Reports: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMeetings: 0,
    totalClients: 0,
    repeatVisits: 0,
    totalQuotations: 0,
    pendingQuotations: 0
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [employeeMeetings, setEmployeeMeetings] = useState<Meeting[]>([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [showMeetingsModal, setShowMeetingsModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const metricsRes = await fetch(`${getApiUrl()}/reports/dashboard/metrics?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setTeamLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/auth/team-hierarchy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Map backend response to TeamMember format
          const mappedMembers = data.data.directReports.map((member: any) => ({
            id: member._id || member.id,
            name: member.name,
            email: member.email,
            designation: member.designation,
            role: member.role,
            employeeId: member.employeeId,
            meetings: member.meetingCount || 0,
            average: member.reportsCount || 0
          }));
          setTeamMembers(mappedMembers);
        } else {
          setTeamMembers([]);
        }
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchEmployeeMeetings = async (employeeId: string, employeeName: string) => {
    try {
      setMeetingsLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${getApiUrl()}/reports/employee-meetings/${employeeId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployeeMeetings(data.data || []);
        setSelectedEmployeeName(employeeName);
        setShowMeetingsModal(true);
      }
    } catch (error) {
      console.error('Error fetching employee meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTeamMembers();
  }, []);

  const handleDateFilter = () => {
    fetchDashboardData();
  };

  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMembers = teamMembers
    .filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const stats = [
    {
      title: 'Total Meetings',
      value: metrics.totalMeetings,
      icon: 'mdi:calendar-multiple',
      color: '#188ae2',
    },
    {
      title: 'Clients',
      value: metrics.totalClients,
      icon: 'mdi:account-tie',
      color: '#31ce77',
    },
    {
      title: 'Repeat Visit',
      value: metrics.repeatVisits,
      icon: 'mdi:account-reload',
      color: '#fbcc5c',
    },
    {
      title: 'Total Quotation',
      value: metrics.totalQuotations,
      icon: 'mdi:file-document',
      color: '#6b5eae',
    },
    {
      title: 'Pending Quotation',
      value: metrics.pendingQuotations,
      icon: 'mdi:clock-outline',
      color: '#f34943',
    },
  ];

  const handleDownload = () => {
    const reportData = {
      metrics,
      teamMembers: filteredAndSortedMembers,
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString()
    };

    const csvContent = generateCSV(reportData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateCSV = (data: any) => {
    let csv = 'Dashboard Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Date Range: ${data.dateRange.startDate || 'All'} to ${data.dateRange.endDate || 'All'}\n\n`;
    
    csv += 'METRICS\n';
    csv += `Total Meetings,${data.metrics.totalMeetings}\n`;
    csv += `Total Clients,${data.metrics.totalClients}\n`;
    csv += `Repeat Visits,${data.metrics.repeatVisits}\n`;
    csv += `Total Quotations,${data.metrics.totalQuotations}\n`;
    csv += `Pending Quotations,${data.metrics.pendingQuotations}\n\n`;
    
    csv += 'MEETING LOCATIONS\n';
    csv += 'Location,Total Meetings,Clients Visited\n';
    data.meetingLocations.forEach((loc: any) => {
      csv += `"${loc.location?.name || 'Unknown'}",${loc.totalMeetings || loc.count || 0},${loc.clientsVisited || 0}\n`;
    });

    csv += '\nSALES PERSON PERFORMANCE\n';
    csv += 'Name,Designation,Meetings,Average\n';
    data.teamMembers.forEach((member: any) => {
      csv += `"${member.name}","${member.designation}",${member.meetings},${member.average}\n`;
    });

    return csv;
  };

  return (
    <>
      {/* Full Width Reports Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">REPORTS</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} lg={2} md={4} sm={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <Card.Body className="text-center">
                <Icon 
                  icon={stat.icon} 
                  width="32" 
                  height="32" 
                  style={{ color: stat.color }}
                  className="mb-2"
                />
                <p className="text-muted small mb-2">{stat.title}</p>
                <h3 className="mb-0" style={{ color: stat.color }}>
                  {loading ? '-' : stat.value}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Section */}
      <Row className="g-3 mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-end">
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-bold">Start Date</Form.Label>
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
                    <Form.Label className="text-muted small fw-bold">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={4} sm={12} className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleDateFilter}
                    className="d-flex align-items-center"
                    size="sm"
                    disabled={loading}
                  >
                    <Icon icon="mdi:filter" className="me-2" />
                    Filter
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleDownload}
                    className="d-flex align-items-center"
                    size="sm"
                  >
                    <Icon icon="mdi:download" className="me-2" />
                    Download
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Row className="g-3">
        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="activity" className="mb-3">
                <Tab eventKey="activity" title="Activity">
                  <div className="mt-3">
                    <p className="text-muted">No Activity Found</p>
                  </div>
                </Tab>
                <Tab eventKey="calendar" title="Calendar">
                  <div className="mt-3">
                    <p className="text-muted">Calendar view coming soon</p>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Person Performance Table */}
      <Row className="g-3 mt-2">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-bottom">
              <Row className="align-items-center">
                <Col>
                  <h6 className="mb-0">Sales Person Performance</h6>
                </Col>
                <Col md={4}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                      <Icon icon="mdi:magnify" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ border: '1px solid #ddd' }}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {teamLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Loading team data...</p>
                </div>
              ) : filteredAndSortedMembers.length === 0 ? (
                <p className="text-muted text-center py-4">No team members found</p>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                      <tr>
                        <th style={{ fontWeight: 600, color: '#666', fontSize: '12px', borderBottom: '1px solid #ddd' }}>
                          <button
                            onClick={() => handleSort('name')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#666',
                              fontWeight: 600,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            Sales Person
                            <Icon
                              icon={
                                sortField === 'name' && sortDirection === 'desc'
                                  ? 'mdi:chevron-down'
                                  : 'mdi:chevron-up'
                              }
                              width={16}
                            />
                          </button>
                        </th>
                        <th style={{ fontWeight: 600, color: '#666', fontSize: '12px', borderBottom: '1px solid #ddd' }}>
                          <button
                            onClick={() => handleSort('meetings')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#666',
                              fontWeight: 600,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            Meetings
                            <Icon
                              icon={
                                sortField === 'meetings' && sortDirection === 'desc'
                                  ? 'mdi:chevron-down'
                                  : 'mdi:chevron-up'
                              }
                              width={16}
                            />
                          </button>
                        </th>
                        <th style={{ fontWeight: 600, color: '#666', fontSize: '12px', borderBottom: '1px solid #ddd' }}>
                          <button
                            onClick={() => handleSort('average')}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#666',
                              fontWeight: 600,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            Average
                            <Icon
                              icon={
                                sortField === 'average' && sortDirection === 'desc'
                                  ? 'mdi:chevron-down'
                                  : 'mdi:chevron-up'
                              }
                              width={16}
                            />
                          </button>
                        </th>
                        <th style={{ fontWeight: 600, color: '#666', fontSize: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedMembers.map((member) => (
                        <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '4px',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  flexShrink: 0
                                }}
                              >
                                {member.name
                                  .split(' ')
                                  .map(word => word.charAt(0))
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#333' }}>
                                  {member.name}
                                </p>
                                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#999' }}>
                                  {member.designation}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => fetchEmployeeMeetings(member.id, member.name)}
                              style={{
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '13px',
                                color: '#007bff',
                                cursor: 'pointer',
                                padding: '0'
                              }}
                            >
                              {member.meetings}
                            </Button>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              {member.average}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              style={{
                                background: '#4CAF50',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                              }}
                            >
                              <Icon icon="mdi:chart-line" width={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Meetings Modal */}
          {showMeetingsModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Card style={{
                width: '90%',
                maxWidth: '900px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-0">
                    {selectedEmployeeName}'s Meetings
                  </Card.Title>
                  <Button
                    variant="close"
                    onClick={() => setShowMeetingsModal(false)}
                  />
                </Card.Header>
                <Card.Body>
                  {meetingsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spinner animation="border" size="sm" />
                      <p className="text-muted mt-2">Loading meetings...</p>
                    </div>
                  ) : employeeMeetings.length === 0 ? (
                    <p className="text-muted text-center">No meetings found</p>
                  ) : (
                    <Table striped hover size="sm">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ fontSize: '12px' }}>Title</th>
                          <th style={{ fontSize: '12px' }}>Date</th>
                          <th style={{ fontSize: '12px' }}>Time</th>
                          <th style={{ fontSize: '12px' }}>Client</th>
                          <th style={{ fontSize: '12px' }}>Location</th>
                          <th style={{ fontSize: '12px' }}>GPS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeMeetings.map((meeting) => (
                          <tr key={meeting._id}>
                            <td style={{ fontSize: '12px' }}>{meeting.title}</td>
                            <td style={{ fontSize: '12px' }}>
                              {new Date(meeting.date).toLocaleDateString()}
                            </td>
                            <td style={{ fontSize: '12px' }}>{meeting.time}</td>
                            <td style={{ fontSize: '12px' }}>{meeting.client?.clientName}</td>
                            <td style={{ fontSize: '12px' }}>
                              <div>
                                <div style={{ fontWeight: 500 }}>{meeting.location?.name}</div>
                                {meeting.location?.address && (
                                  <div style={{ fontSize: '10px', color: '#999' }}>
                                    {meeting.location.address}
                                    {meeting.location.city && `, ${meeting.location.city}`}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ fontSize: '12px', textAlign: 'center' }}>
                              {meeting.gpsCoordinates?.latitude ? (
                                <a
                                  href={`https://www.google.com/maps/search/${meeting.gpsCoordinates.latitude},${meeting.gpsCoordinates.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#007bff', textDecoration: 'none' }}
                                  title={`±${meeting.gpsCoordinates.accuracy.toFixed(0)}m`}
                                >
                                  📍 View
                                </a>
                              ) : (
                                <span style={{ color: '#ccc' }}>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}
    </>
  );
};

export default Reports;

