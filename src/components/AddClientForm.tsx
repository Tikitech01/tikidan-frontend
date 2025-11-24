import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Paper,
  IconButton,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add,
  Delete,
  ExpandMore,
  ExpandLess,
  Business,
  Person,
} from '@mui/icons-material';

const CATEGORY_OPTIONS = [
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'SMB', label: 'SMB (Small & Medium Business)' },
  { value: 'Startup', label: 'Startup' },
  { value: 'Government', label: 'Government' },
  { value: 'Non-Profit', label: 'Non-Profit' },
  { value: 'Other', label: 'Other' },
];

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

interface ClientFormData {
  category: string;
  clientName: string;
  locations: BranchLocation[];
}

interface AddClientFormProps {
  onClose: () => void;
  onSave?: (data: ClientFormData) => void;
  clientId?: string;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ 
  onClose, 
  onSave,
  clientId 
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    category: '',
    clientName: '',
    locations: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

  const handleInputChange = (field: keyof ClientFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSelectChange = (field: keyof ClientFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleAddLocation = () => {
    const newLocation: BranchLocation = {
      id: Date.now().toString(),
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      contacts: [],
    };
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
    setExpandedLocations(prev => new Set(prev).add(newLocation.id));
  };

  const handleRemoveLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId),
    }));
    setExpandedLocations(prev => {
      const newSet = new Set(prev);
      newSet.delete(locationId);
      return newSet;
    });
  };

  const handleLocationChange = (locationId: string, field: keyof BranchLocation, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(location =>
        location.id === locationId
          ? { ...location, [field]: value }
          : location
      ),
    }));
  };

  const handleAddContact = (locationId: string) => {
    const newContact: ContactPerson = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      designation: '',
    };

    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(location =>
        location.id === locationId
          ? { ...location, contacts: [...location.contacts, newContact] }
          : location
      ),
    }));
  };

  const handleRemoveContact = (locationId: string, contactId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(location =>
        location.id === locationId
          ? { ...location, contacts: location.contacts.filter(contact => contact.id !== contactId) }
          : location
      ),
    }));
  };

  const handleContactChange = (locationId: string, contactId: string, field: keyof ContactPerson, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(location =>
        location.id === locationId
          ? {
              ...location,
              contacts: location.contacts.map(contact =>
                contact.id === contactId
                  ? { ...contact, [field]: value }
                  : contact
              ),
            }
          : location
      ),
    }));
  };

  const toggleLocationExpansion = (locationId: string) => {
    setExpandedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    // Validate at least one location
    if (formData.locations.length === 0) {
      newErrors.locations = 'At least one branch location is required';
    }

    // Validate locations
    formData.locations.forEach((location, index) => {
      if (!location.name.trim()) {
        newErrors[`location_${index}_name`] = `Location ${index + 1} name is required`;
      }
      if (!location.addressLine1.trim()) {
        newErrors[`location_${index}_address1`] = `Location ${index + 1} address line 1 is required`;
      }

      // Validate contacts
      location.contacts.forEach((contact, contactIndex) => {
        if (!contact.name.trim()) {
          newErrors[`contact_${index}_${contactIndex}_name`] = `Contact ${contactIndex + 1} name is required`;
        }
        if (!contact.email.trim()) {
          newErrors[`contact_${index}_${contactIndex}_email`] = `Contact ${contactIndex + 1} email is required`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
          newErrors[`contact_${index}_${contactIndex}_email`] = `Contact ${contactIndex + 1} email is invalid`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      console.log('Client data:', formData);
      
      alert('Client added successfully!');
      
      console.log('About to call onSave callback with:', formData);
      
      if (onSave) {
        onSave(formData);
        console.log('onSave callback executed');
      } else {
        console.warn('onSave callback is not provided');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving client:', error);
      alert(error.message || 'Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {clientId ? 'Edit Client' : 'Add New Client'}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Category */}
          <FormControl fullWidth error={!!errors.category} required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleSelectChange('category')}
              label="Category"
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          {/* Client Name */}
          <TextField
            fullWidth
            label="Client Name"
            value={formData.clientName}
            onChange={handleInputChange('clientName')}
            error={!!errors.clientName}
            helperText={errors.clientName}
            placeholder="Enter client name"
            required
          />
        </Box>
      </Paper>

      {/* Branch Locations Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business color="primary" />
        Branch Locations
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddLocation}
          size="small"
        >
          Add Branch Location
        </Button>
        {errors.locations && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
            {errors.locations}
          </Typography>
        )}
      </Box>

      {/* Locations List */}
      {formData.locations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No branch locations added yet. Click "Add Branch Location" to get started.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {formData.locations.map((location, locationIndex) => (
            <Paper key={location.id} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
              {/* Location Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleLocationExpansion(location.id)}
                  >
                    {expandedLocations.has(location.id) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Location {locationIndex + 1}: {location.name || 'Unnamed Location'}
                  </Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveLocation(location.id)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>

              {/* Location Details */}
              <Collapse in={expandedLocations.has(location.id)}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                  <TextField
                    label="Location Name"
                    value={location.name}
                    onChange={(e) => handleLocationChange(location.id, 'name', e.target.value)}
                    error={!!errors[`location_${locationIndex}_name`]}
                    helperText={errors[`location_${locationIndex}_name`]}
                    required
                  />
                  <TextField
                    label="Country"
                    value={location.country}
                    onChange={(e) => handleLocationChange(location.id, 'country', e.target.value)}
                    required
                  />
                  <TextField
                    label="Address Line 1"
                    value={location.addressLine1}
                    onChange={(e) => handleLocationChange(location.id, 'addressLine1', e.target.value)}
                    error={!!errors[`location_${locationIndex}_address1`]}
                    helperText={errors[`location_${locationIndex}_address1`]}
                    required
                  />
                  <TextField
                    label="Address Line 2"
                    value={location.addressLine2}
                    onChange={(e) => handleLocationChange(location.id, 'addressLine2', e.target.value)}
                  />
                  <TextField
                    label="City"
                    value={location.city}
                    onChange={(e) => handleLocationChange(location.id, 'city', e.target.value)}
                    required
                  />
                  <TextField
                    label="State"
                    value={location.state}
                    onChange={(e) => handleLocationChange(location.id, 'state', e.target.value)}
                    required
                  />
                </Box>

                {/* Contact Persons Section */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Contact Persons
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleAddContact(location.id)}
                    size="small"
                  >
                    Add Contact Person
                  </Button>
                </Box>

                {/* Contacts List */}
                {location.contacts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No contacts added for this location yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {location.contacts.map((contact, contactIndex) => (
                      <Paper key={contact.id} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Contact {contactIndex + 1}
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveContact(location.id, contact.id)}
                            size="small"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <TextField
                            label="Name"
                            value={contact.name}
                            onChange={(e) => handleContactChange(location.id, contact.id, 'name', e.target.value)}
                            error={!!errors[`contact_${locationIndex}_${contactIndex}_name`]}
                            helperText={errors[`contact_${locationIndex}_${contactIndex}_name`]}
                            required
                            size="small"
                          />
                          <TextField
                            label="Designation"
                            value={contact.designation}
                            onChange={(e) => handleContactChange(location.id, contact.id, 'designation', e.target.value)}
                            size="small"
                          />
                          <TextField
                            label="Email"
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleContactChange(location.id, contact.id, 'email', e.target.value)}
                            error={!!errors[`contact_${locationIndex}_${contactIndex}_email`]}
                            helperText={errors[`contact_${locationIndex}_${contactIndex}_email`]}
                            required
                            size="small"
                          />
                          <TextField
                            label="Phone"
                            value={contact.phone}
                            onChange={(e) => handleContactChange(location.id, contact.id, 'phone', e.target.value)}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<CancelIcon />}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (clientId ? 'Update Client' : 'Save Client')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddClientForm;
