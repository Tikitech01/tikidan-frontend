import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Tab,
  Tabs,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Security,
  Work,
  Badge,
  LocationOn,
  Event,
  TrendingUp,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Fetch user profile data from /auth/me endpoint
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userDataResponse = await userResponse.json();
      if (userDataResponse.user) {
        setUserData(userDataResponse.user);
      }

      // Fetch activity stats
      const userId = localStorage.getItem('userId');
      console.log('📊 Fetching activity for userId:', userId);
      
      if (userId) {
        const statsResponse = await fetch(`http://localhost:5000/api/reports/employee/${userId}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('📊 Activity data received:', statsData);
          if (statsData.success && statsData.data) {
            setActivityData({
              totalClients: statsData.data.totalClients || 0,
              totalMeetings: statsData.data.totalMeetings || 0,
              meetings: statsData.data.meetings || []
            });
          }
        } else {
          console.error('❌ Failed to fetch activity stats:', statsResponse.status);
        }
      } else {
        console.warn('⚠️ userId not found in localStorage');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

// Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format role display (role-department or just role)
  const getRoleDisplay = (role: string, department: string) => {
    if (!role) return 'User';
    
    // Simple role name formatting for display
    const formatRoleName = (roleName: string) => {
      return roleName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    };
    
    const formattedRole = formatRoleName(role);
    
    // If no department is assigned, return just the role
    if (!department) return formattedRole;
    
    // If department exists, return "Role - Department" format
    return `${formattedRole} - ${department}`;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="body1" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Full Width Profile Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">PROFILE</h1>
        </div>
      </div>

      <Box sx={{ 
        p: 1.5, 
        backgroundColor: '#fafbfc', 
        minHeight: '100vh'
      }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#1e293b', 
            fontSize: '1.1rem',
            mb: 0.5
          }}
        >
          My Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
          Manage your personal information and account settings
        </Typography>
      </Box>

      {/* Profile Overview and Main Content */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '250px 1fr' }, gap: 2 }}>
        {/* Profile Overview Card */}
        <Card sx={{ 
          borderRadius: 1, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#3b82f6',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {getUserInitials(userData.name || 'User')}
              </Typography>
            </Avatar>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#1e293b', fontSize: '0.9rem' }}>
              {userData.name || 'User Name'}
            </Typography>
            
            <Box sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              px: 1.5,
              py: 0.3,
              borderRadius: 12,
              display: 'inline-block',
              mb: 1.5
            }}>
              <Typography variant="caption" sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                {getRoleDisplay(userData.role, userData.department)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1.5 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ 
                  backgroundColor: '#eff6ff',
                  p: 0.5,
                  borderRadius: 1
                }}>
                  <Email sx={{ fontSize: 14, color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.75rem' }}>
                    {userData.email || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Box sx={{ 
                  backgroundColor: '#f0fdf4',
                  p: 0.5,
                  borderRadius: 1
                }}>
                  <Phone sx={{ fontSize: 14, color: '#22c55e' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.75rem' }}>
                    {userData.mobile || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card sx={{ 
          borderRadius: 1, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                px: 2, 
                minHeight: 40,
                '& .MuiTab-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  textTransform: 'none',
                  minHeight: 40,
                  fontSize: '0.8rem',
                  '&.Mui-selected': {
                    color: '#1e293b',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3b82f6',
                  height: 2,
                  borderRadius: '2px 2px 0 0'
                }
              }}
            >
              <Tab 
                label="Personal" 
                icon={<Person fontSize="small" />} 
                iconPosition="start" 
              />
              <Tab 
                label="Activity & Stats" 
                icon={<TrendingUp fontSize="small" />} 
                iconPosition="start" 
              />
              <Tab 
                label="Security" 
                icon={<Security fontSize="small" />} 
                iconPosition="start" 
              />
            </Tabs>
          </Box>

          {/* Personal Info Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
              Personal Information
            </Typography>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Loading profile data...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ backgroundColor: '#fee2e2', p: 2, borderRadius: 1, border: '1px solid #fecaca' }}>
                <Typography variant="body2" sx={{ color: '#991b1b' }}>{error}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <Person fontSize="small" /> Full Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                    {userData?.name || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <Email fontSize="small" /> Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {userData?.email || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <Phone fontSize="small" /> Mobile Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                    {userData?.mobile || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <Badge fontSize="small" /> Role
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                    {getRoleDisplay(userData?.role, userData?.department)}
                  </Typography>
                </Box>

                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <Work fontSize="small" /> Designation
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                    {userData?.designation || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.6rem'
                  }}>
                    <LocationOn fontSize="small" /> Department
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                    {userData?.department || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            )}
          </TabPanel>

          {/* Activity & Stats Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                Activity & Performance
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                <Card sx={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        backgroundColor: '#0284c7',
                        p: 1.2,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Person sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#0369a1', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          Total Clients
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0c4a6e', fontSize: '1.8rem' }}>
                          {activityData?.totalClients || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card sx={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 1 }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          backgroundColor: '#10b981',
                          p: 1.2,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Event sx={{ fontSize: 24, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#047857', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            Total Meetings
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#065f46', fontSize: '1.8rem' }}>
                            {activityData?.totalMeetings || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                Recent Meetings
              </Typography>
              
              {activityData?.meetings && activityData.meetings.length > 0 ? (
                <TableContainer component={Paper} sx={{ border: '1px solid #e2e8f0', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Meeting Title</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityData.meetings.slice(0, 5).map((meeting: any, index: number) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 500 }}>
                            {meeting.title || 'Untitled'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {meeting.client?.clientName || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(meeting.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {meeting.time || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  backgroundColor: '#f8fafc',
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    No meetings recorded yet
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
              Security Settings
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.8rem' }}>
              Security settings and password management will be available soon.
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
              <Box sx={{ 
                backgroundColor: '#f8fafc',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  display: 'block', 
                  mb: 0.5,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontSize: '0.6rem'
                }}>
                  Current Password
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '2px', color: '#1e293b', fontSize: '0.8rem' }}>
                  ••••••••••
                </Typography>
              </Box>
              
              <Box sx={{ 
                backgroundColor: '#fef3c7',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid #fde68a'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#92400e', 
                  display: 'block', 
                  mb: 0.5,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontSize: '0.6rem'
                }}>
                  New Password
                </Typography>
                <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.8rem' }}>
                  Password change feature coming soon
                </Typography>
              </Box>
              
              <Box sx={{ 
                backgroundColor: '#fef3c7',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid #fde68a'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#92400e', 
                  display: 'block', 
                  mb: 0.5,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  fontSize: '0.6rem'
                }}>
                  Confirm New Password
                </Typography>
                <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.8rem' }}>
                  Password change feature coming soon
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Card>
      </Box>
    </Box>
    </>
  );
};

export default Profile;