import React, { useState, useEffect } from 'react';
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
  DialogTitle,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  History as HistoryIcon,
} from '@mui/icons-material';
import AddClientForm from '../components/AddClientForm';
import ClientDetailsDialog from '../components/ClientDetailsDialog';
import ClientHistoryDialog from '../components/ClientHistoryDialog';
import { clientApi } from '../services/api';
import type { Client } from '../services/api';

const Clients: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Clients state
  const [clients, setClients] = useState<Client[]>([]);

  // Load clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await clientApi.getAll();

        if (result.success && result.data) {
          // Map _id to id for frontend compatibility
          const mappedClients = result.data.map(client => ({
            ...client,
            id: client._id || client.id || ''
          }));
          setClients(mappedClients);
        } else {
          throw new Error(result.message || 'Failed to fetch clients');
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setClients([]);
      }
    };

    fetchClients();
  }, []);

  // Debug logging for clients state changes
  useEffect(() => {
    console.log('Clients state updated:', clients);
    console.log('Total clients count:', clients.length);
  }, [clients]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleViewClient = () => {
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleViewHistory = () => {
    setHistoryDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClient = () => {
    console.log('Edit client:', selectedClient);
    handleMenuClose();
  };

  const handleDeleteClient = () => {
    if (selectedClient) {
      setClientToDelete(selectedClient);
      setDeleteConfirmOpen(true);
    }
    handleMenuClose();
  };

  const confirmDeleteClient = async () => {
    if (clientToDelete) {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/clients/${clientToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Remove client from state
          setClients(prevClients => prevClients.filter(client => client.id !== clientToDelete.id));
          console.log('Client and related data deleted successfully:', result);
          
          // Show success message (you could use a toast notification here)
          alert(`Client "${clientToDelete.clientName}" and all related data deleted successfully!`);
        } else {
          throw new Error(result.message || 'Failed to delete client');
        }

      } catch (error) {
        console.error('Error deleting client:', error);
        alert(`Error deleting client: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  const cancelDeleteClient = () => {
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (data: any) => {
    console.log('Received client data from form:', data);
    
    try {
      // Create client data for API - only include salesPerson if it exists
      const clientData: any = {
        category: data.category,
        clientName: data.clientName,
        locations: data.locations || []
      };
      
      // Add salesPerson only if provided
      if (data.salesPerson && data.salesPerson.trim()) {
        clientData.salesPerson = data.salesPerson.trim();
      }
      
      console.log('Sending to API:', clientData);
      
      const result = await clientApi.create(clientData);
      
      if (result.success && result.data) {
        // After creating client, refetch the list to get the populated salesPerson
        setTimeout(() => {
          const fetchClients = async () => {
            try {
              const result = await clientApi.getAll();
              if (result.success && result.data) {
                const mappedClients = result.data.map(client => ({
                  ...client,
                  id: client._id || client.id || ''
                }));
                setClients(mappedClients);
              }
            } catch (err) {
              console.error('Error refetching clients:', err);
            }
          };
          fetchClients();
        }, 500);
        
        console.log('Client saved successfully');
      } else {
        throw new Error(result.message || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert(`Error creating client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
                {clients.length}
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
                {clients.length}
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
                {clients.reduce((total, client) => total + (client.totalMeetings || 0), 0)}
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
                    <TableCell sx={{ fontWeight: 600 }}>Contacts</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sales Person</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Meetings</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Locations</TableCell>
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
                              {client.clientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {client.locations && client.locations.length > 0 && client.locations[0].contacts && client.locations[0].contacts.length > 0 
                                ? client.locations[0].contacts[0].name 
                                : 'No contacts'}
                            </Typography>
                            {(() => {
                              const totalContacts = client.locations ? client.locations.reduce((sum, location) => {
                                return sum + (location.contacts ? location.contacts.length : 0);
                              }, 0) : 0;
                              return totalContacts > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  {totalContacts} contact{totalContacts > 1 ? 's' : ''}
                                </Typography>
                              );
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {client.salesPerson ? client.salesPerson : 'Not Assigned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={client.totalMeetings || 0}
                            size="small"
                            color="primary"
                            sx={{ borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {client.locations && client.locations.length > 0 ? client.locations[0].name : 'No locations'}
                          </Typography>
                          {client.locations && client.locations.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {client.locations.length} location{client.locations.length > 1 ? 's' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(event) => handleMenuClick(event, client)}
                            size="small"
                          >
                            <MoreVert fontSize="small" />
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

        {/* Menu for actions */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewClient}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleViewHistory}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View History</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditClient}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteClient}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Client Details Dialog */}
        <ClientDetailsDialog
          open={detailsDialogOpen}
          client={selectedClient as any}
          onClose={handleCloseDetailsDialog}
          onUpdateClient={handleUpdateClient}
        />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDeleteClient}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Client Deletion
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the client <strong>"{clientToDelete?.clientName}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This action will also delete:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              All branch locations and contact persons
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All meetings associated with this client
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All projects associated with this client
            </Typography>
            <Typography component="li" variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
              This action cannot be undone
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={cancelDeleteClient}
            variant="outlined"
            sx={{ 
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteClient}
            variant="contained"
            sx={{ 
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#dc2626',
              }
            }}
            startIcon={<Delete />}
          >
            Delete client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client History Dialog */}
      <ClientHistoryDialog
        open={historyDialogOpen}
        clientName={selectedClient?.clientName}
        createdBy={selectedClient?.createdBy as any}
        createdAt={selectedClient?.createdAt}
        transferHistory={selectedClient?.transferHistory as any}
        onClose={() => setHistoryDialogOpen(false)}
      />
    </>
  );
};

export default Clients;

