import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Container,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  BusinessCenter
} from '@mui/icons-material';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  employeeId: string;
}

interface CurrentUser {
  name: string;
  designation: string;
  role: string;
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || '',
          designation: user.designation || '',
          role: user.role || ''
        });
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/auth/team-members', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.teamMembers);
        } else {
          setError('Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        setError('Error fetching team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

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
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your team...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
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

      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Card
        elevation={1}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 1,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                color: '#1e293b',
                mb: 1 
              }}
            >
              My Team
            </Typography>
            
            {currentUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: getRoleColor(currentUser.role), width: 32, height: 32 }}>
                  <Person fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: '#1e293b' }}>
                    {currentUser.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {currentUser.designation}
                  </Typography>
                </Box>
                <Chip 
                  label={currentUser.role.replace('_', ' ').toUpperCase()} 
                  size="small"
                  sx={{ 
                    bgcolor: getRoleColor(currentUser.role),
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.6rem',
                    height: 20,
                    minHeight: 'auto'
                  }}
                />
              </Box>
            )}
            
            <Divider sx={{ mb: 2 }} />
          </Box>

          {teamMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessCenter sx={{ fontSize: 40, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
                No Team Members
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                You don't have any team members reporting to you yet.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ mb: 2, fontWeight: 500, color: '#1e293b', fontSize: '0.9rem' }}
              >
                Team Members ({teamMembers.length})
              </Typography>
              
              <Stack spacing={1.5}>
                {teamMembers.map((member) => (
                  <Card 
                    key={member.id}
                    variant="outlined"
                    sx={{
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ bgcolor: getRoleColor(member.role), width: 28, height: 28, mr: 1 }}>
                          <Person fontSize="small" />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 500, 
                              fontSize: '0.85rem',
                              color: '#1e293b'
                            }}
                          >
                            {member.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: '#64748b', fontSize: '0.7rem' }}
                          >
                            {member.designation}
                          </Typography>
                        </Box>
                        <Chip 
                          label={member.role.replace('_', ' ').toUpperCase()} 
                          size="small"
                          sx={{ 
                            bgcolor: getRoleColor(member.role),
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.6rem',
                            height: 18,
                            minHeight: 'auto'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Email sx={{ fontSize: 12, mr: 1, color: '#94a3b8' }} />
                        <Typography 
                          variant="caption" 
                          sx={{ color: '#64748b', fontSize: '0.7rem' }}
                        >
                          {member.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge sx={{ fontSize: 12, mr: 1, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                          {member.employeeId}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
    </>
  );
};

export default Team;