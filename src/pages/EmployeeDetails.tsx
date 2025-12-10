import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Button, Nav } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import MeetingLocationsMap from '../components/MeetingLocationsMap';
import { getApiUrl } from '../services/api';

interface EmployeeDetailsData {
  name: string;
  designation: string;
  totalClients: number;
  totalMeetings: number;
  meetings: Array<any>;
}

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMapTab, setActiveMapTab] = useState<'meetings' | 'movement' | 'live'>('meetings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${getApiUrl()}/reports/employee/${id}/details`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employee details');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px' }}>
          <Spinner animation="border" />
          <p className="mt-3 text-muted">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <Card style={{ width: '400px', border: 'none' }}>
          <Card.Body className="text-center">
            <Icon icon="mdi:alert-circle" width="48" style={{ color: '#ef4444', marginBottom: '16px' }} />
            <p className="text-danger mb-3">{error || 'Employee not found'}</p>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        width: '75%',
        maxHeight: '95vh',
        overflow: 'auto',
        padding: '0'
      }}>
        {/* Header Section */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              {data.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '18px' }}>
                {data.name}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>
                {data.designation}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#e0e0e0';
              (e.currentTarget as HTMLElement).style.color = '#333';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#999';
            }}
          >
            <Icon icon="mdi:close" width="24" />
          </button>
        </div>

        {/* Content Section */}
        <div style={{ padding: '32px' }}>
          {/* Stats Row */}
          <Row className="mb-4 g-3">
            <Col md={4}>
              <div style={{
                backgroundColor: '#f0f9ff',
                borderLeft: '4px solid #4CAF50',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Icon icon="mdi:account-multiple" width="32" style={{ color: '#4CAF50', marginBottom: '8px', display: 'block' }} />
                <h3 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '24px' }}>
                  {data.totalClients}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  Total Clients Created
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                backgroundColor: '#eff6ff',
                borderLeft: '4px solid #2196F3',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Icon icon="mdi:calendar-check" width="32" style={{ color: '#2196F3', marginBottom: '8px', display: 'block' }} />
                <h3 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '24px' }}>
                  {data.totalMeetings}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  Total Meetings Done
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                backgroundColor: '#fef3f2',
                borderLeft: '4px solid #ff6b6b',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Icon icon="mdi:chart-line" width="32" style={{ color: '#ff6b6b', marginBottom: '8px', display: 'block' }} />
                <h3 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '24px' }}>
                  {data.totalMeetings > 0 ? (data.totalClients / data.totalMeetings).toFixed(1) : '0'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  Avg. Clients per Meeting
                </p>
              </div>
            </Col>
          </Row>

          <Row className="g-4" style={{ marginTop: '24px' }}>
            {/* Map Section - Left Side */}
            <Col lg={6}>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '0',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    <button
                      onClick={() => setActiveMapTab('meetings')}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: activeMapTab === 'meetings' ? '#fff' : '#f9f9f9',
                        borderBottom: activeMapTab === 'meetings' ? '3px solid #4CAF50' : 'none',
                        fontWeight: activeMapTab === 'meetings' ? 600 : 500,
                        fontSize: '13px',
                        color: activeMapTab === 'meetings' ? '#4CAF50' : '#666',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Icon icon="mdi:map-marker" width="16" />
                      Meetings
                    </button>
                    <button
                      onClick={() => setActiveMapTab('movement')}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: activeMapTab === 'movement' ? '#fff' : '#f9f9f9',
                        borderBottom: activeMapTab === 'movement' ? '3px solid #2196F3' : 'none',
                        fontWeight: activeMapTab === 'movement' ? 600 : 500,
                        fontSize: '13px',
                        color: activeMapTab === 'movement' ? '#2196F3' : '#666',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Icon icon="mdi:route" width="16" />
                      Movement Track
                    </button>
                    <button
                      onClick={() => setActiveMapTab('live')}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: activeMapTab === 'live' ? '#fff' : '#f9f9f9',
                        borderBottom: activeMapTab === 'live' ? '3px solid #ff6b6b' : 'none',
                        fontWeight: activeMapTab === 'live' ? 600 : 500,
                        fontSize: '13px',
                        color: activeMapTab === 'live' ? '#ff6b6b' : '#666',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Icon icon="mdi:crosshairs-gps" width="16" />
                      Live Location
                    </button>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  padding: '0',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                  height: '400px'
                }}>
                  {activeMapTab === 'meetings' && (
                    <>
                      {data.meetings && data.meetings.length > 0 ? (
                        <MeetingLocationsMap meetings={data.meetings} />
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          color: '#999',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%'
                        }}>
                          <Icon icon="mdi:map-search-outline" width="48" style={{ marginBottom: '12px' }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No meetings with location data</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeMapTab === 'movement' && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#999',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Icon icon="mdi:route" width="48" style={{ marginBottom: '12px' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Movement Track functionality coming soon</p>
                    </div>
                  )}

                  {activeMapTab === 'live' && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#999',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Icon icon="mdi:crosshairs-gps" width="48" style={{ marginBottom: '12px' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Live Location functionality coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Meetings List Section - Right Side */}
            <Col lg={6}>
              <div>
                <h5 style={{ fontWeight: 700, color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <Icon icon="mdi:format-list-bulleted" width="20" />
                  Recent Meetings ({data.meetings?.length || 0})
                </h5>
                <div style={{
                  maxHeight: '400px',
                  overflow: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#fff'
                }}>
                  {data.meetings && data.meetings.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0', position: 'sticky', top: 0 }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                            Date
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                            Client
                          </th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.meetings.slice(0, 15).map((meeting, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', whiteSpace: 'nowrap' }}>
                              {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#333', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {meeting.client?.clientName || 'N/A'}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {meeting.location?.name || 'No location'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#999',
                      height: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon icon="mdi:list-box-outline" width="48" style={{ marginBottom: '12px' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No meetings found</p>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
