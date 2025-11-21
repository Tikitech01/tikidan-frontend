import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
} from '@mui/icons-material';
import AddClientForm from '../components/AddClientForm';

const Clients: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  
  // Empty clients data - will be populated from API later
  const clients: any[] = [];

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveClient = (data: any) => {
    console.log('Client saved:', data);
    // Here you would typically update your clients list
  };

  return (
    <>
      {/* Full Width Clients Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">CLIENTS</h1>
        </div>
      </div>

      <Box sx={{ 
        backgroundColor: '#fafbfc', 
        minHeight: '100vh', 
        p: 3,
        borderRadius: 2,
        position: 'relative'
      }}>
        {/* Overview Cards with Plus Icon */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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
                Total Clients
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
                Active Clients
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
                Total Meetings
              </Typography>
            </CardContent>
          </Card>
          
          {/* Plus Icon Button */}
          <IconButton
            onClick={handleOpenDialog}
            sx={{ 
              backgroundColor: '#3b82f6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              width: 70,
              height: 70,
              flexShrink: 0,
              ml: 'auto',
            }}
          >
            <Add sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>

        {/* Clients Table */}
        <Card sx={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
              Client List
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact Person</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sales Person</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Meetings</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No clients added yet. Click the plus icon to add a new client.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.company}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {client.contactPerson}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.contactEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {client.salesPerson}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.totalMeetings}
                            size="small"
                            color="primary"
                            sx={{ borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {client.location}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" title="View">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="info" title="Edit">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" title="Delete">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Client Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <AddClientForm 
            onClose={handleCloseDialog}
            onSave={handleSaveClient}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Clients;
