import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  Delete,
  Close,
  Business,
  Person,
} from '@mui/icons-material';

interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

interface BranchLocation {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  contacts: ContactPerson[];
}

interface Client {
  id: string;
  category: string;
  clientName: string;
  locations: BranchLocation[];
  totalMeetings?: number;
}

interface ClientDetailsDialogProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onUpdateClient: (updatedClient: Client) => void;
}

interface AddContactFormProps {
  locationId: string;
  onAddContact: (locationId: string, contact: ContactPerson) => void;
  onCancel: () => void;
}

const AddContactForm: React.FC<AddContactFormProps> = ({
  locationId,
  onAddContact,
  onCancel,
}) => {
  const [newContact, setNewContact] = useState<Partial<ContactPerson>>({
    name: '',
    email: '',
    phone: '',
    designation: '',
  });

  const handleSubmit = () => {
    if (!newContact.name || !newContact.email) return;

    const contact: ContactPerson = {
      id: Date.now().toString(),
      name: newContact.name!,
      email: newContact.email!,
      phone: newContact.phone || '',
      designation: newContact.designation || '',
    };

    onAddContact(locationId, contact);
    setNewContact({ name: '', email: '', phone: '', designation: '' });
    onCancel();
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Add New Contact Person
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField
          label="Name"
          value={newContact.name || ''}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          required
          size="small"
        />
        <TextField
          label="Designation"
          value={newContact.designation || ''}
          onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
          size="small"
        />
        <TextField
          label="Email"
          type="email"
          value={newContact.email || ''}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          required
          size="small"
        />
        <TextField
          label="Phone"
          value={newContact.phone || ''}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          size="small"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" size="small" onClick={handleSubmit}>Add Contact</Button>
        <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};

const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({
  open,
  client,
  onClose,
  onUpdateClient,
}) => {
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddContactFor, setShowAddContactFor] = useState<string | null>(null);
  
  const [newLocation, setNewLocation] = useState<Partial<BranchLocation>>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
  });

  // Don't render dialog if client is null, but keep dialog structure for proper opening
  if (!client || !open) {
    return null;
  }

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.addressLine1) return;

    const location: BranchLocation = {
      id: Date.now().toString(),
      name: newLocation.name!,
      addressLine1: newLocation.addressLine1!,
      addressLine2: newLocation.addressLine2 || '',
      city: newLocation.city || '',
      state: newLocation.state || '',
      country: newLocation.country || '',
      contacts: [],
    };

    const updatedClient = {
      ...client,
      locations: [...client.locations, location],
    };

    onUpdateClient(updatedClient);
    setNewLocation({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
    });
    setShowAddLocation(false);
  };

  const handleAddContact = (locationId: string, contact: ContactPerson) => {
    const updatedClient = {
      ...client,
      locations: client.locations.map(location =>
        location.id === locationId
          ? { ...location, contacts: [...location.contacts, contact] }
          : location
      ),
    };

    onUpdateClient(updatedClient);
  };

  const handleDeleteLocation = (locationId: string) => {
    const updatedClient = {
      ...client,
      locations: client.locations.filter(loc => loc.id !== locationId),
    };
    onUpdateClient(updatedClient);
  };

  const handleDeleteContact = (locationId: string, contactId: string) => {
    const updatedClient = {
      ...client,
      locations: client.locations.map(location =>
        location.id === locationId
          ? { ...location, contacts: location.contacts.filter(contact => contact.id !== contactId) }
          : location
      ),
    };
    onUpdateClient(updatedClient);
  };

  // Create table rows: one row per contact, with location info in the first row of each location
  const getTableRows = () => {
    const rows: React.ReactElement[] = [];
    
    client.locations.forEach((location) => {
      if (location.contacts.length === 0) {
        // Location with no contacts
        rows.push(
          <TableRow key={`${location.id}-empty`}>
            <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" fontSize="small" />
                {location.name}
              </Box>
            </TableCell>
            <TableCell sx={{ verticalAlign: 'top' }}>
              <Typography variant="body2">
                {location.addressLine1}
                {location.addressLine2 && `, ${location.addressLine2}`}
              </Typography>
              <Typography variant="body2">
                {location.city}, {location.state}
              </Typography>
              <Typography variant="body2">
                {location.country}
              </Typography>
            </TableCell>
            <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary', verticalAlign: 'middle' }}>
              No contacts added yet
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => setShowAddContactFor(location.id)}
                sx={{ ml: 1 }}
              >
                Add Contact
              </Button>
            </TableCell>
            <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
              <IconButton 
                edge="end" 
                color="error" 
                onClick={() => handleDeleteLocation(location.id)}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        );
      } else {
        location.contacts.forEach((contact, contactIndex) => {
          rows.push(
            <TableRow key={contact.id}>
              {/* Location Name - only show on first contact row */}
              <TableCell sx={{ fontWeight: 600, verticalAlign: 'top' }}>
                {contactIndex === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" fontSize="small" />
                    {location.name}
                  </Box>
                ) : null}
              </TableCell>
              
              {/* Address - only show on first contact row */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                {contactIndex === 0 ? (
                  <Box>
                    <Typography variant="body2">
                      {location.addressLine1}
                      {location.addressLine2 && `, ${location.addressLine2}`}
                    </Typography>
                    <Typography variant="body2">
                      {location.city}, {location.state}
                    </Typography>
                    <Typography variant="body2">
                      {location.country}
                    </Typography>
                  </Box>
                ) : null}
              </TableCell>
              
              {/* Contact Person */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" fontSize="small" />
                  <Typography variant="body2">{contact.name}</Typography>
                </Box>
              </TableCell>
              
              {/* Designation */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {contact.designation || '-'}
                </Typography>
              </TableCell>
              
              {/* Email */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {contact.email}
                </Typography>
              </TableCell>
              
              {/* Phone */}
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {contact.phone || '-'}
                </Typography>
              </TableCell>
              
              {/* Actions */}
              <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {contactIndex === location.contacts.length - 1 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setShowAddContactFor(location.id)}
                      sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
                    >
                      Add
                    </Button>
                  )}
                  <IconButton 
                    edge="end" 
                    color="error" 
                    onClick={() => handleDeleteContact(location.id, contact.id)}
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          );
          
          // Add add contact form for this location
          if (showAddContactFor === location.id) {
            rows.push(
              <TableRow key={`add-contact-${location.id}`}>
                <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                  <AddContactForm
                    locationId={location.id}
                    onAddContact={handleAddContact}
                    onCancel={() => setShowAddContactFor(null)}
                  />
                </TableCell>
              </TableRow>
            );
          }
        });
      }
      
      // Add add contact form for location with no contacts
      if (location.contacts.length === 0 && showAddContactFor === location.id) {
        rows.push(
          <TableRow key={`add-contact-${location.id}`}>
            <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
              <AddContactForm
                locationId={location.id}
                onAddContact={handleAddContact}
                onCancel={() => setShowAddContactFor(null)}
              />
            </TableCell>
          </TableRow>
        );
      }
    });
    
    return rows;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          <Typography variant="h6">
            {client.clientName} - Locations & Contacts
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Add Location Section */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddLocation(true)}
            sx={{ mb: 2 }}
          >
            Add Branch Location
          </Button>

          {showAddLocation && (
            <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Add New Branch Location</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField
                  label="Location Name"
                  value={newLocation.name || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Country"
                  value={newLocation.country || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Address Line 1"
                  value={newLocation.addressLine1 || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, addressLine1: e.target.value })}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Address Line 2"
                  value={newLocation.addressLine2 || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, addressLine2: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="City"
                  value={newLocation.city || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="State"
                  value={newLocation.state || ''}
                  onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleAddLocation}>Add Location</Button>
                <Button variant="outlined" onClick={() => setShowAddLocation(false)}>Cancel</Button>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Locations and Contacts Table */}
        {client.locations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No branch locations added yet. Click "Add Branch Location" to get started.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '25%' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Contact Person</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '15%' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '10%' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '5%' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getTableRows()}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsDialog;
