import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Container,
  Stack,
  Menu,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

interface Meeting {
  _id?: string;
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  client?: string;
  contactPerson?: string;
  products?: string[];
  comments?: string;
  attendees?: string[];
  location?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Meeting>>({
    title: '',
    date: '',
    time: '',
    client: '',
    contactPerson: '',
    products: [],
    comments: '',
    location: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const meetingsList = Array.isArray(data.data) ? data.data : data.meetings || [];
        setMeetings(meetingsList);
        setFilteredMeetings(meetingsList);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  // Filter meetings
  useEffect(() => {
    let filtered = meetings;

    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMeetings(filtered);
    setCurrentPage(1);
  }, [meetings, searchTerm]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, meeting: Meeting) => {
    setAnchorEl(event.currentTarget);
    setSelectedMeeting(meeting);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMeeting(null);
  };

  const handleOpenDialog = () => {
    setEditingMeetingId(undefined);
    setFormData({
      title: '',
      date: '',
      time: '',
      client: '',
      contactPerson: '',
      products: [],
      comments: '',
      location: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEditMeeting = () => {
    if (selectedMeeting) {
      setFormData(selectedMeeting);
      setEditingMeetingId(selectedMeeting._id || selectedMeeting.id);
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteMeeting = async () => {
    if (selectedMeeting && window.confirm('Are you sure you want to delete this meeting?')) {
      const meetingId = selectedMeeting._id || selectedMeeting.id;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/meetings/${meetingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMeetings(meetings.filter((m) => (m._id || m.id) !== meetingId));
          alert('Meeting deleted successfully');
        } else {
          alert('Failed to delete meeting');
        }
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    }
    handleMenuClose();
  };

  const handleSaveMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingMeetingId ? 'PUT' : 'POST';
      const endpoint = editingMeetingId ? `/meetings/${editingMeetingId}` : '/meetings';

      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingMeetingId ? 'Meeting updated successfully' : 'Meeting created successfully');
        setOpenDialog(false);
        setEditingMeetingId(undefined);
        fetchMeetings();
      } else {
        alert('Failed to save meeting');
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const totalMeetings = meetings.length;
  const averageMeetings = totalMeetings > 0 ? (totalMeetings / 1).toFixed(2) : '0.00';
  const leaves = 0;
  const repeatVisit = meetings.filter(m => m.client).length; // Placeholder

  return (
    <>
      {/* Full Width Meetings Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">MEETINGS</h1>
        </div>
      </div>

      <Container maxWidth={false} sx={{ mt: 1, mb: 3, px: { xs: 2, sm: 4, md: 8 }, maxWidth: '1400px', width: '100%' }}>
        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Card sx={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                {totalMeetings}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Meetings
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                {averageMeetings}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Average Meetings
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                {leaves}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Leaves
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mb: 0.5 }}>
                {repeatVisit}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Repeat Visit
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content Card */}
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Add button with yellow circle */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <IconButton
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#333',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    backgroundColor: '#FFC700',
                  },
                  fontSize: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>+</span>
              </IconButton>
            </Box>

            {/* Filters */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: '8px', color: '#999' }} />,
                  }}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>Items per page:</Typography>
                  <Select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    size="small"
                    sx={{ width: '80px' }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Stack>

            {/* Table */}
            <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Contact Person</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Products</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Comments</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                          No data available in table
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMeetings.map((meeting) => (
                      <TableRow
                        key={meeting._id || meeting.id}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: '#f9fafb' },
                          borderBottom: '1px solid #e5e7eb'
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {meeting.date ? new Date(meeting.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {meeting.client || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {meeting.contactPerson || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {meeting.products && Array.isArray(meeting.products) && meeting.products.length > 0
                            ? meeting.products.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {meeting.comments || '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, meeting)}
                            sx={{ color: '#6b7280' }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                size="small"
                sx={{ color: currentPage === 1 ? '#d1d5db' : '#374151' }}
              >
                ←
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center', px: 2 }}>
                Page {currentPage} of {totalPages || 1}
              </Typography>
              <Button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                size="small"
                sx={{ color: currentPage === totalPages || totalPages === 0 ? '#d1d5db' : '#374151' }}
              >
                →
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditMeeting}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteMeeting}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Meeting Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMeetingId ? 'Edit Meeting' : 'Add New Meeting'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Meeting Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Time"
            type="time"
            value={formData.time || ''}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Client Name"
            value={formData.client || ''}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="Contact Person"
            value={formData.contactPerson || ''}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            size="small"
          />
          <TextField
            fullWidth
            label="Comments"
            value={formData.comments || ''}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMeeting}>
            {editingMeetingId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Meetings;
