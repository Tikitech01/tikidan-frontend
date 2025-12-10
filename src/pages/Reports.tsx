import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Tab, Tabs, Table, InputGroup, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';
import MeetingLocationsMap from '../components/MeetingLocationsMap';

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
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [employeeMeetings, setEmployeeMeetings] = useState<Meeting[]>([]);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [showMeetingsModal, setShowMeetingsModal] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchDashboardMetrics = async () => {
    try {
      setMetricsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/reports/dashboard/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Metrics API Response:', data);
        if (data.success && data.data) {
          setMetrics(data.data);
        } else {
          console.warn('Unexpected response format:', data);
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setMetricsLoading(false);
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

      const response = await fetch(`${getApiUrl()}/reports/employee-meetings/${employeeId}`, {
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

  const fetchAllMeetingsWithGPS = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/reports/map/all-meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('All meetings from API:', data.data);
        // Filter to only meetings with locations
        const meetingsWithLocations = (data.data || []).filter((m: Meeting) => m.location && m.location._id);
        console.log('Meetings with locations:', meetingsWithLocations);
        setAllMeetings(meetingsWithLocations);
      } else {
        console.error('API response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching meetings with GPS:', error);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
    fetchTeamMembers();
    fetchAllMeetingsWithGPS();
  }, []);

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

  return (
    <>
      {/* Metrics Header - Similar to the design shown */}
      <div style={{ 
        backgroundColor: '#fff', // More solid white for consistency
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', // subtle shadow for separation
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {[
            {
              title: 'Total Meetings',
              value: metrics.totalMeetings
            },
            {
              title: 'Total Clients',
              value: metrics.totalClients
            },
            {
              title: 'Repeat Visits',
              value: metrics.repeatVisits
            },
            {
              title: 'Pending Quotations',
              value: metrics.pendingQuotations,
              color: '#ef4444'
            }
          ].map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: stat.color || '#333',
                marginBottom: '4px'
              }}>
                {metricsLoading ? '-' : (stat.value || 0)}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#999',
                whiteSpace: 'nowrap'
              }}>
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        {/* Date range and user icon on the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '13px',
            color: '#666'
          }}>
            <Icon icon="mdi:calendar" width="18" />
            <span>Date Range</span>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon icon="mdi:account-circle" width="20" color="#999" />
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Row className="g-3">
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="activity" className="mb-3">
                <Tab eventKey="activity" title="Activity">
                  <div className="mt-3">
                    <p className="text-muted">No Activity Found</p>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* Meeting Locations Card with Map */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-bottom">
              <h6 className="mb-0">
                <Icon icon="mdi:map-marker" width="18" style={{ marginRight: '8px' }} />
                Meeting Locations Map
              </h6>
            </Card.Header>
            <Card.Body style={{ padding: '12px' }}>
              <MeetingLocationsMap meetings={allMeetings} />
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
                              onClick={() => window.location.href = `/employee/${member.id}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#22c55e'
                              }}
                              title="View Professional Info"
                            >
                              <Icon icon="mdi:chat" width={20} />
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

