import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  Person,
  AccessTime,
  LocationOn,
  MoreVert,
} from '@mui/icons-material';

const Meetings: React.FC = () => {
  // Empty meetings data
  const meetings: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      {/* Full Width Meetings Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">MEETINGS</h1>
        </div>
      </div>

      <Box sx={{ 
        backgroundColor: '#fafbfc', 
        minHeight: '100vh', 
        p: 3,
        borderRadius: 2
      }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
          Meetings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ color: '#64748b' }}>
          Manage your meetings and schedule
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ 
            borderRadius: 2, 
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            textTransform: 'none'
          }}
        >
          Schedule Meeting
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarMonth />}
          sx={{ 
            borderRadius: 2,
            borderColor: '#e2e8f0',
            color: '#475569',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc',
            },
            textTransform: 'none'
          }}
        >
          View Calendar
        </Button>
      </Box>

      {/* Meetings Overview Cards */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <Card sx={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Total Meetings This Month
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Pending Meetings
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981' }}>
              0
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Completed Meetings
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Meetings Table */}
      <Card sx={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
            Upcoming & Recent Meetings
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meeting Details</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {meeting.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AccessTime sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {meeting.time}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {meeting.client}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {meeting.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {meeting.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.type}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.status}
                        size="small"
                        color={getStatusColor(meeting.status) as any}
                        sx={{ borderRadius: 1, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add meeting"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Add />
      </Fab>
    </Box>
    </>
  );
};

export default Meetings;