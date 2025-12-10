import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Form, 
  InputGroup,
  Badge,
  Alert,
  Spinner
} from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

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

interface ManagerInfo {
  name: string;
  email: string;
  designation: string;
  role: string;
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch team hierarchy
  useEffect(() => {
    const fetchTeamHierarchy = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${getApiUrl()}/auth/team-hierarchy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setManagerInfo(data.data.manager);
            setTeamMembers(data.data.directReports);
          } else {
            setTeamMembers([]);
          }
        } else if (response.status === 401) {
          setError('Unauthorized. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team hierarchy:', error);
        setError(`Error fetching team members: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamHierarchy();
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#d32f2f';
      case 'manager':
      case 'senior_manager':
        return '#1976d2';
      case 'assistant_manager':
      case 'deputy_manager':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading your team...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <>
      {/* Full Width Team Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">TEAM</h1>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {/* Manager Info */}
            {managerInfo && (
              <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                <h6 style={{ marginBottom: '15px', fontWeight: 600, color: '#333' }}>Your Information</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: getRoleColor(managerInfo.role),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    {managerInfo.name
                      .split(' ')
                      .map(word => word.charAt(0))
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#333', fontSize: '14px' }}>
                      {managerInfo.name}
                    </p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {managerInfo.designation}
                    </p>
                  </div>
                  <Badge bg="secondary" style={{ marginLeft: 'auto' }}>
                    {managerInfo.role.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                  <Icon icon="mdi:magnify" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: '1px solid #ddd' }}
                />
              </InputGroup>
            </div>

            {/* Pagination info */}
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Form.Select style={{ width: '80px' }} defaultValue="10">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </Form.Select>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Showing {Math.min(10, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} entries
              </span>
            </div>

            {/* Team Members Table */}
            {filteredAndSortedMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <Icon icon="mdi:folder-open" style={{ fontSize: '48px', marginBottom: '10px' }} />
                <p>No team members found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle" style={{ marginBottom: 0 }}>
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
                          <span style={{ fontWeight: 600, fontSize: '13px', color: '#333' }}>
                            {member.meetings}
                          </span>
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
      </div>
    </>
  );
};

export default Team;