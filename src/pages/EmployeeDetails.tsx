import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import MeetingLocationsMap from '../components/MeetingLocationsMap';
import MovementTrackingMap from '../components/MovementTrackingMap';
import LiveLocationMap from '../components/LiveLocationMap';
import { getApiUrl } from '../services/api';

interface EmployeeDetailsData {
  name: string;
  designation: string;
  totalClients: number;
  totalMeetings: number;
  meetings: Array<any>;
}

interface LiveLocationData {
  onlineMarker?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    type?: 'online' | 'offline';
  } | null;
  offlineMarkers?: Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    type?: 'online' | 'offline';
  }>;
  status?: 'online' | 'offline';
}

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeDetailsData | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocationData | null>(null);
  const [liveLocationLoading, setLiveLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMapTab, setActiveMapTab] = useState<'meetings' | 'movement' | 'live'>('meetings');
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

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

  const fetchLiveLocation = async () => {
    try {
      setLiveLocationLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/reports/employee/${id}/location-history`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch live location');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setLiveLocation(result.data);
      }
    } catch (err) {
      console.error('Error fetching live location:', err);
    } finally {
      setLiveLocationLoading(false);
    }
  };

  // Filter meetings by date range
  const getFilteredMeetings = () => {
    if (!data?.meetings) return [];
    
    return data.meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      
      if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        if (meetingDate < startDate) return false;
      }
      
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (meetingDate > endDate) return false;
      }
      
      return true;
    });
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
        <div style={{ padding: '24px' }}>
          {/* Stats Row - Compact */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <div style={{
                backgroundColor: '#f0f9ff',
                borderLeft: '3px solid #4CAF50',
                padding: '10px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Icon icon="mdi:account-multiple" width="24" style={{ color: '#4CAF50', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '18px' }}>
                    {data.totalClients}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666', fontWeight: 500 }}>
                    Clients
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                backgroundColor: '#eff6ff',
                borderLeft: '3px solid #2196F3',
                padding: '10px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Icon icon="mdi:calendar-check" width="24" style={{ color: '#2196F3', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '18px' }}>
                    {data.totalMeetings}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666', fontWeight: 500 }}>
                    Meetings
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                backgroundColor: '#fef3f2',
                borderLeft: '3px solid #ff6b6b',
                padding: '10px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Icon icon="mdi:chart-line" width="24" style={{ color: '#ff6b6b', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#333', fontSize: '18px' }}>
                    {data.totalMeetings > 0 ? (data.totalClients / data.totalMeetings).toFixed(1) : '0'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666', fontWeight: 500 }}>
                    Avg/Meeting
                  </p>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="g-4" style={{ marginTop: '16px' }}>
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
                      {getFilteredMeetings().length > 0 ? (
                        <MeetingLocationsMap meetings={getFilteredMeetings()} />
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
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                            {filterStartDate || filterEndDate ? 'No meetings in selected date range' : 'No meetings with location data'}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeMapTab === 'movement' && (
                    <>
                      {id ? (
                        <MovementTrackingMap 
                          employeeId={id} 
                          date={new Date().toISOString().split('T')[0]}
                          startDate={filterStartDate}
                          endDate={filterEndDate}
                        />
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
                          <Icon icon="mdi:route" width="48" style={{ marginBottom: '12px' }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Unable to load movement data</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeMapTab === 'live' && (
                    <>
                      {liveLocationLoading ? (
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
                          <Spinner animation="border" size="sm" style={{ marginBottom: '12px' }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Loading live location...</p>
                        </div>
                      ) : liveLocation && liveLocation.onlineMarker ? (
                        <LiveLocationMap locations={liveLocation} />
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
                          <Icon icon="mdi:crosshairs-gps" width="48" style={{ marginBottom: '12px' }} />
                          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 500 }}>No live location data</p>
                          {!liveLocation && (
                            <button
                              onClick={fetchLiveLocation}
                              style={{
                                backgroundColor: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Load Live Location
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Col>

            {/* Meetings List Section - Right Side */}
            <Col lg={6}>
              <div>
                <h5 style={{ fontWeight: 700, color: '#333', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <Icon icon="mdi:format-list-bulleted" width="20" />
                  Recent Meetings ({getFilteredMeetings().length || 0})
                </h5>

                {/* Date Filter Section */}
                <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 600, color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        From
                      </label>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 600, color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        To
                      </label>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFilterStartDate('');
                        setFilterEndDate('');
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#666'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{
                  maxHeight: '400px',
                  overflow: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#fff'
                }}>
                  {getFilteredMeetings().length > 0 ? (
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
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredMeetings().slice(0, 15).map((meeting, idx) => (
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
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setShowMeetingDetails(true);
                                }}
                                style={{ fontSize: '11px', padding: '4px 12px' }}
                              >
                                Details
                              </Button>
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
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                        {filterStartDate || filterEndDate ? 'No meetings in selected date range' : 'No meetings found'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Meeting Details Modal */}
      {showMeetingDetails && selectedMeeting && (
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
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Card style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Meeting Details</Card.Title>
              <Button
                variant="close"
                onClick={() => setShowMeetingDetails(false)}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Meeting Title
                  </label>
                  <div style={{ fontSize: '14px', color: '#333', marginTop: '5px', fontWeight: 500 }}>
                    {selectedMeeting.title || 'N/A'}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Date
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    {new Date(selectedMeeting.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Time
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    {selectedMeeting.time || 'N/A'}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Duration
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    {selectedMeeting.duration ? `${selectedMeeting.duration} mins` : 'N/A'}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Status
                  </label>
                  <div style={{ fontSize: '13px', marginTop: '5px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: selectedMeeting.status === 'completed' ? '#d4edda' : selectedMeeting.status === 'cancelled' ? '#f8d7da' : '#cfe2ff',
                      color: selectedMeeting.status === 'completed' ? '#155724' : selectedMeeting.status === 'cancelled' ? '#721c24' : '#084298',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      fontWeight: 500
                    }}>
                      {selectedMeeting.status || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Type
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    {selectedMeeting.type || 'N/A'}
                  </div>
                </div>

                {/* Client */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Client Name
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    {selectedMeeting.client?.clientName || 'N/A'}
                  </div>
                </div>

                {/* Location */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Location
                  </label>
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                    <div style={{ fontWeight: 500 }}>{selectedMeeting.location?.name || 'N/A'}</div>
                    {selectedMeeting.location?.address && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                        {selectedMeeting.location.address}
                      </div>
                    )}
                    {selectedMeeting.location?.city && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedMeeting.location.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedMeeting.description && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Description
                    </label>
                    <div style={{ fontSize: '13px', color: '#333', marginTop: '5px', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #007bff' }}>
                      {selectedMeeting.description}
                    </div>
                  </div>
                )}

                {/* GPS Coordinates */}
                {selectedMeeting.gpsCoordinates && (
                  <>
                    <div>
                      <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Latitude
                      </label>
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '5px', fontFamily: 'monospace' }}>
                        {selectedMeeting.gpsCoordinates.latitude.toFixed(6)}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Longitude
                      </label>
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '5px', fontFamily: 'monospace' }}>
                        {selectedMeeting.gpsCoordinates.longitude.toFixed(6)}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Accuracy
                      </label>
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '5px' }}>
                        ±{selectedMeeting.gpsCoordinates.accuracy.toFixed(0)}m
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Captured At
                      </label>
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '5px' }}>
                        {new Date(selectedMeeting.gpsCoordinates.capturedAt).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        href={`https://www.google.com/maps/search/${selectedMeeting.gpsCoordinates.latitude},${selectedMeeting.gpsCoordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginTop: '10px' }}
                      >
                        📍 Open in Google Maps
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="bg-light d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMeetingDetails(false)}
              >
                Close
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
