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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const CATEGORY_OPTIONS = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'individual', label: 'Individual' },
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'startup', label: 'Startup' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'sme', label: 'SME (Small & Medium Enterprise)' },
  { value: 'other', label: 'Other' },
];

interface ClientFormData {
  category: string;
  clientName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  branchLocation: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
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
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    branchLocation: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

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
      
      // In a real application, you would make an API call here
      // const response = await fetch('http://localhost:5000/api/clients', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify(formData),
      // });

      alert('Client added successfully!');
      
      if (onSave) {
        onSave(formData);
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
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {clientId ? 'Edit Client' : 'Add New Client'}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Column */}
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

            {/* Contact Person */}
            <TextField
              fullWidth
              label="Contact Person"
              value={formData.contactPerson}
              onChange={handleInputChange('contactPerson')}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson}
              placeholder="Enter contact person name"
              required
            />

            {/* Contact Person Email */}
            <TextField
              fullWidth
              label="Contact Person Email"
              type="email"
              value={formData.contactEmail}
              onChange={handleInputChange('contactEmail')}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              placeholder="Enter contact email"
              required
            />

            {/* Contact Person Phone */}
            <TextField
              fullWidth
              label="Contact Person Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleInputChange('contactPhone')}
              error={!!errors.contactPhone}
              helperText={errors.contactPhone}
              placeholder="Enter contact phone"
              required
            />

            {/* Branch/Location Name */}
            <TextField
              fullWidth
              label="Branch/Location Name"
              value={formData.branchLocation}
              onChange={handleInputChange('branchLocation')}
              placeholder="Enter branch or location name"
            />
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Address Line 1 */}
            <TextField
              fullWidth
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={handleInputChange('addressLine1')}
              placeholder="Street, Locality etc."
            />

            {/* Address Line 2 */}
            <TextField
              fullWidth
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={handleInputChange('addressLine2')}
              placeholder="Street, Locality etc."
            />

            {/* City */}
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
              placeholder="City"
            />

            {/* State */}
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleInputChange('state')}
              placeholder="Enter State"
            />

            {/* Country */}
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={handleInputChange('country')}
              placeholder="Enter country"
            />
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
