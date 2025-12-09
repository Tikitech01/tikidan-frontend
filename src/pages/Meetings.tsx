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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

interface Client {
  _id: string;
  clientName: string;
  locations?: Array<{
    _id: string;
    name: string;
    contacts?: Array<{
      _id: string;
      name: string;
      email: string;
    }>;
  }>;
}

interface Project {
  _id: string;
  title: string;
}

interface Meeting {
  _id?: string;
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  client?: string | { _id: string; clientName: string };
  contactPerson?: string | { _id: string; name: string };
  products?: string[];
  comments?: string;
  attendees?: string[];
  location?: string | { _id: string; name: string };
  status?: string;
  project?: string | { _id: string; title: string };
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
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Meeting>>({
    date: '',
    time: '',
    client: '',
    location: '',
    contactPerson: '',
    comments: '',
    products: [],
    project: '',
  });

  useEffect(() => {
    fetchMeetings();
    fetchClients();
    fetchProjects();
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

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the new endpoint that returns ALL clients without filtering
      const response = await fetch(`${getApiUrl()}/clients/all-for-forms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const clientsList = Array.isArray(data.data) ? data.data : data.clients || [];
        setClients(clientsList);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the new endpoint that returns ALL projects without filtering
      const response = await fetch(`${getApiUrl()}/projects/all-for-forms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const projectsList = Array.isArray(data.data) ? data.data : data.projects || [];
        setProjects(projectsList);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Filter meetings
  useEffect(() => {
    let filtered = meetings;

    if (searchTerm) {
      filtered = filtered.filter((m) => {
        const clientName = typeof m.client === 'string' ? m.client : m.client?.clientName || '';
        const contactName = typeof m.contactPerson === 'string' ? m.contactPerson : m.contactPerson?.name || '';
        return (
          m.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contactName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
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
      date: '',
      time: '',
      client: '',
      location: '',
      contactPerson: '',
      comments: '',
      products: [],
      project: '',
    });
    setSelectedClient(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEditMeeting = () => {
    if (selectedMeeting) {
      setFormData(selectedMeeting);
      setEditingMeetingId(selectedMeeting._id || selectedMeeting.id);
      // Set selected client for cascading dropdowns
      const clientId = typeof selectedMeeting.client === 'string' ? selectedMeeting.client : selectedMeeting.client?._id;
      const selectedClientObj = clients.find(c => c._id === clientId);
      setSelectedClient(selectedClientObj || null);
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

      // Prepare data - ensure IDs are stored as strings
      const dataToSave = {
        date: formData.date,
        time: formData.time,
        client: typeof formData.client === 'string' ? formData.client : formData.client?._id,
        location: typeof formData.location === 'string' ? formData.location : formData.location?._id,
        contactPerson: typeof formData.contactPerson === 'string' ? formData.contactPerson : formData.contactPerson?._id,
        comments: formData.comments,
        products: formData.products || [],
        project: typeof formData.project === 'string' ? formData.project : formData.project?._id,
      };

      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        alert(editingMeetingId ? 'Meeting updated successfully' : 'Meeting created successfully');
        setOpenDialog(false);
        setEditingMeetingId(undefined);
        setSelectedClient(null);
        setFormData({
          date: '',
          time: '',
          client: '',
          location: '',
          contactPerson: '',
          comments: '',
          products: [],
          project: '',
        });
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
                          {typeof meeting.client === 'string' ? meeting.client : meeting.client?.clientName || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {typeof meeting.contactPerson === 'string' ? meeting.contactPerson : meeting.contactPerson?.name || '-'}
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
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {editingMeetingId ? 'Edit Meeting' : 'Add New Meeting'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date and Time */}
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
            required
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

          {/* Client Dropdown with Tree Structure */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, color: '#dc2626' }}>
              * Client
            </Typography>
            <Select
              fullWidth
              size="small"
              value={typeof formData.client === 'string' ? formData.client : (typeof formData.client === 'object' && formData.client?._id) ? formData.client._id : ''}
              onChange={(e) => {
                const selectedClientId = e.target.value;
                const selectedClientObj = clients.find(c => c._id === selectedClientId);
                setFormData({ ...formData, client: selectedClientId, location: '', contactPerson: '' });
                setSelectedClient(selectedClientObj || null);
              }}
              displayEmpty
            >
              <MenuItem value="">Select Client</MenuItem>
              {clients.map((client) => [
                // Client header
                <MenuItem key={`client-${client._id}`} value={client._id} sx={{ fontWeight: 600, backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                  📌 {client.clientName}
                </MenuItem>,
                // Locations under each client
                ...(client.locations && client.locations.length > 0 ? client.locations.map((loc) => [
                  // Location header
                  <MenuItem key={`loc-header-${loc._id}`} disabled sx={{ pl: 4, fontWeight: 500, backgroundColor: '#fafbfc', color: '#4b5563', fontSize: '0.85rem' }}>
                    └─ 📍 {loc.name}
                  </MenuItem>,
                  // Contacts under each location
                  ...(loc.contacts && loc.contacts.length > 0 ? loc.contacts.map((contact) => (
                    <MenuItem key={`contact-${contact._id}`} disabled sx={{ pl: 8, backgroundColor: '#ffffff', color: '#6b7280', fontSize: '0.8rem' }}>
                      └─ 👤 {contact.name} ({contact.email})
                    </MenuItem>
                  )) : []),
                ]) : []),
              ])}
            </Select>
          </Box>

          {/* Location Dropdown (Cascading) */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, color: '#dc2626' }}>
              * Client Location
            </Typography>
            <Select
              fullWidth
              size="small"
              value={typeof formData.location === 'string' ? formData.location : (typeof formData.location === 'object' && formData.location?._id) ? formData.location._id : ''}
              onChange={(e) => {
                const selectedLocationId = e.target.value;
                setFormData({ ...formData, location: selectedLocationId, contactPerson: '' });
              }}
              displayEmpty
              disabled={!selectedClient}
            >
              <MenuItem value="">Select Client Location</MenuItem>
              {selectedClient?.locations?.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Contact Person Dropdown (Cascading) */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, color: '#dc2626' }}>
              * Client Contact
            </Typography>
            <Select
              fullWidth
              size="small"
              value={typeof formData.contactPerson === 'string' ? formData.contactPerson : (typeof formData.contactPerson === 'object' && formData.contactPerson?._id) ? formData.contactPerson._id : ''}
              onChange={(e) => {
                const selectedContactId = e.target.value;
                setFormData({ ...formData, contactPerson: selectedContactId });
              }}
              displayEmpty
              disabled={!selectedClient || !formData.location}
            >
              <MenuItem value="">Select Contact</MenuItem>
              {selectedClient?.locations?.find(loc => loc._id === formData.location)?.contacts?.map((contact) => (
                <MenuItem key={contact._id} value={contact._id}>
                  {contact.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Comment */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, color: '#dc2626' }}>
              * Comment
            </Typography>
            <TextField
              fullWidth
              value={formData.comments || ''}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              multiline
              rows={3}
              size="small"
              placeholder="Enter comments..."
            />
          </Box>

          {/* Next Visit */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, color: '#dc2626' }}>
              * Next Visit
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
            >
              <MenuItem value="">Select Next Visit</MenuItem>
              <MenuItem value="1_week">Next 1 Week</MenuItem>
              <MenuItem value="2_weeks">Next 2 Weeks</MenuItem>
              <MenuItem value="1_month">Next 1 Month</MenuItem>
              <MenuItem value="later">Later</MenuItem>
            </Select>
          </Box>

          {/* Products Checkboxes */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1, color: '#dc2626' }}>
              * Product
            </Typography>
            <Box sx={{ pl: 1 }}>
              {['Membranes', 'Spray', 'Coatings', 'Sealants', 'Drainage', 'XPS', 'Floorings'].map((product) => (
                <FormControlLabel
                  key={product}
                  control={
                    <Checkbox
                      checked={Array.isArray(formData.products) && formData.products.includes(product)}
                      onChange={(e) => {
                        const currentProducts = Array.isArray(formData.products) ? formData.products : [];
                        if (e.target.checked) {
                          setFormData({ ...formData, products: [...currentProducts, product] });
                        } else {
                          setFormData({ ...formData, products: currentProducts.filter(p => p !== product) });
                        }
                      }}
                      size="small"
                    />
                  }
                  label={product}
                  sx={{ display: 'block', mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>

          {/* Project Dropdown */}
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5 }}>
              Project
            </Typography>
            <Select
              fullWidth
              size="small"
              value={typeof formData.project === 'string' ? formData.project : (typeof formData.project === 'object' && formData.project?._id) ? formData.project._id : ''}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              displayEmpty
            >
              <MenuItem value="">Select Project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>
            CANCEL
          </Button>
          <Button variant="contained" onClick={handleSaveMeeting} sx={{ backgroundColor: '#3b82f6' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Meetings;
