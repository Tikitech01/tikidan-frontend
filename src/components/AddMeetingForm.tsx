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

const MEETING_TYPE_OPTIONS = [
  { value: 'client', label: 'Client Meeting' },
  { value: 'internal', label: 'Internal Meeting' },
  { value: 'review', label: 'Review Meeting' },
  { value: 'planning', label: 'Planning Meeting' },
  { value: 'standup', label: 'Stand-up' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

const MEETING_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LOCATION_TYPE_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'online', label: 'Online' },
  { value: 'client_site', label: 'Client Site' },
  { value: 'other', label: 'Other' },
];

interface MeetingFormData {
  title: string;
  description: string;
  client: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  locationType: string;
  meetingLink: string;
  type: string;
  status: string;
  attendees: string;
  agenda: string;
  notes: string;
}

interface AddMeetingFormProps {
  onClose: () => void;
  onSave?: (data: MeetingFormData) => void;
  meetingId?: string;
}

const AddMeetingForm: React.FC<AddMeetingFormProps> = ({ 
  onClose, 
  onSave,
  meetingId 
}) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    client: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    locationType: 'office',
    meetingLink: '',
    type: 'client',
    status: 'scheduled',
    attendees: '',
    agenda: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof MeetingFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSelectChange = (field: keyof MeetingFormData) => (
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

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client/Participant name is required';
    }
    if (!formData.date) {
      newErrors.date = 'Meeting date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Meeting time is required';
    }
    if (!formData.type) {
      newErrors.type = 'Meeting type is required';
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
      console.log('Meeting data:', formData);
      
      // In a real application, you would make an API call here
      // const response = await fetch('http://localhost:5000/api/meetings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify(formData),
      // });

      alert('Meeting scheduled successfully!');
      
      if (onSave) {
        onSave(formData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      alert(error.message || 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {meetingId ? 'Edit Meeting' : 'Schedule New Meeting'}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Meeting Title */}
            <TextField
              fullWidth
              label="Meeting Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Enter meeting title"
              required
            />

            {/* Client/Participant */}
            <TextField
              fullWidth
              label="Client/Participant"
              value={formData.client}
              onChange={handleInputChange('client')}
              error={!!errors.client}
              helperText={errors.client}
              placeholder="Enter client or participant name"
              required
            />

            {/* Meeting Type */}
            <FormControl fullWidth error={!!errors.type} required>
              <InputLabel>Meeting Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleSelectChange('type')}
                label="Meeting Type"
              >
                {MEETING_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            {/* Date */}
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleInputChange('date')}
              error={!!errors.date}
              helperText={errors.date}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Time */}
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={formData.time}
              onChange={handleInputChange('time')}
              error={!!errors.time}
              helperText={errors.time}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Duration */}
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={handleInputChange('duration')}
              placeholder="Enter duration in minutes"
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleSelectChange('status')}
                label="Status"
              >
                {MEETING_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Location Type */}
            <FormControl fullWidth>
              <InputLabel>Location Type</InputLabel>
              <Select
                value={formData.locationType}
                onChange={handleSelectChange('locationType')}
                label="Location Type"
              >
                {LOCATION_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location */}
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              placeholder="Enter meeting location"
            />

            {/* Meeting Link */}
            <TextField
              fullWidth
              label="Meeting Link (Optional)"
              value={formData.meetingLink}
              onChange={handleInputChange('meetingLink')}
              placeholder="Enter online meeting link"
            />

            {/* Attendees */}
            <TextField
              fullWidth
              label="Attendees"
              value={formData.attendees}
              onChange={handleInputChange('attendees')}
              placeholder="Enter attendee names (comma separated)"
              multiline
              rows={2}
            />

            {/* Agenda */}
            <TextField
              fullWidth
              label="Agenda"
              value={formData.agenda}
              onChange={handleInputChange('agenda')}
              placeholder="Enter meeting agenda"
              multiline
              rows={3}
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Additional notes"
              multiline
              rows={2}
            />
          </Box>
        </Box>

        {/* Description - Full Width */}
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Enter meeting description"
            multiline
            rows={3}
          />
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
          {isSubmitting ? 'Saving...' : (meetingId ? 'Update Meeting' : 'Schedule Meeting')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddMeetingForm;
