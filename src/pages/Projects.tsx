import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem as ContextMenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Stack,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

interface Project {
  _id: string;
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: string;
  priority: string;
  client?: string;
  teamMembers?: Array<{
    name: string;
    role: string;
    email?: string;
  }>;
  progress?: number;
  notes?: string;
  contractor?: string;
  consultant?: string;
  products?: string[];
  assignBy?: string | { _id: string; name: string; email?: string };
  assignTo?: string | { _id: string; name: string; email?: string };
  stage?: string;
  projectType?: string;
  lastUpdate?: string;
  meeting?: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('All Assignee');
  const [selectedStage, setSelectedStage] = useState('Select All Stage');
  const [selectedDateRange, setSelectedDateRange] = useState('December 8, 2025 - December 8, 2025');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: undefined,
    status: 'active',
    priority: 'medium',
    client: '',
    stage: '',
    projectType: '',
    contractor: '',
    consultant: '',
    products: [],
  });

  // Fetch projects and team members
  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
    
    // Get user role
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || '');
    }
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/auth/team-members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.teamMembers)) {
          console.log('Fetched team members:', data.teamMembers); // Debug log
          setTeamMembers(data.teamMembers);
        }
      } else {
        console.error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const projectsList = Array.isArray(data.data) ? data.data : data.projects || [];
        setProjects(projectsList);
        setFilteredProjects(projectsList);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Filter projects
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.client?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Assignee filter
    if (selectedAssignee !== 'All Assignee') {
      filtered = filtered.filter((p) => {
        if (!p.assignTo) return false; // Skip if assignTo is null or undefined
        if (typeof p.assignTo === 'object' && p.assignTo !== null) {
          return (p.assignTo as any)._id === selectedAssignee; // Compare object ID
        }
        return p.assignTo === selectedAssignee; // Compare string value
      });
    }

    // Stage filter
    if (selectedStage !== 'Select All Stage') {
      filtered = filtered.filter((p) => p.stage === selectedStage);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedAssignee, selectedStage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleEditProject = () => {
    if (selectedProject) {
      // Extract assignTo ID if it's an object
      const assignToId = selectedProject.assignTo && typeof selectedProject.assignTo === 'object'
        ? (selectedProject.assignTo as any)._id
        : selectedProject.assignTo;

      setFormData({
        ...selectedProject,
        assignTo: assignToId, // Set just the ID
      });
      setEditingProjectId(selectedProject._id || selectedProject.id); // Use _id first
      setShowAddDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteProject = async () => {
    if (selectedProject && window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        const projectId = selectedProject._id || selectedProject.id; // Use _id if available
        const response = await fetch(`${getApiUrl()}/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setProjects(projects.filter((p) => (p._id || p.id) !== projectId));
          alert('Project deleted successfully');
        } else {
          alert('Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    }
    handleMenuClose();
  };

  const handleSaveProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingProjectId ? 'PUT' : 'POST';
      const endpoint = editingProjectId ? `/projects/${editingProjectId}` : '/projects';

      // Prepare data to send - convert assignTo object to ID if needed
      const dataToSend = {
        ...formData,
        assignTo: formData.assignTo && typeof formData.assignTo === 'object' 
          ? (formData.assignTo as any)._id 
          : formData.assignTo
      };

      const response = await fetch(`${getApiUrl()}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert(editingProjectId ? 'Project updated successfully' : 'Project created successfully');
        setShowAddDialog(false);
        setEditingProjectId(undefined);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          budget: undefined,
          status: 'active',
          priority: 'medium',
          client: '',
          stage: '',
          contractor: '',
          consultant: '',
          products: [],
        });
        fetchProjects();
      } else {
        alert('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  return (
    <>
      {/* Full Width Projects Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">PROJECTS</h1>
        </div>
      </div>

      <Container maxWidth={false} sx={{ mt: 1, mb: 3, px: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', width: '100%' }}>
        <Card elevation={0} sx={{ 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fff'
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Add button with yellow circle */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <IconButton
                onClick={() => {
                  setEditingProjectId(undefined);
                  setFormData({
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    budget: undefined,
                    status: 'active',
                    priority: 'medium',
                    client: '',
                    stage: 'planning',
                    contractor: '',
                    consultant: '',
                    products: [],
                  });
                  setShowAddDialog(true);
                }}
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: userRole === 'admin' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: '8px', color: '#999' }} />,
                  }}
                  size="small"
                />
                {userRole === 'admin' && (
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                    >
                      <MenuItem value="All Assignee">All Assignee</MenuItem>
                      {teamMembers.map((member) => (
                        <MenuItem
                          key={member.id || member._id}
                          value={member.id || member._id}
                        >
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                  >
                    <MenuItem value="Select All Stage">Select All Stage</MenuItem>
                    <MenuItem value="suspect">Suspect</MenuItem>
                    <MenuItem value="prospect">Prospect</MenuItem>
                    <MenuItem value="source-approver-submission">Source Approver Submission</MenuItem>
                    <MenuItem value="source-approved">Source Approved</MenuItem>
                    <MenuItem value="negotiation">Negotiation</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  type="date"
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <Icon icon="mdi:calendar" style={{ marginRight: '8px' }} />,
                  }}
                />
              </Box>
            </Stack>

            {/* Table */}
            <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Date/Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Project Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Contractor</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Consultant</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Products</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Assign By</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Assign To</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Stage</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Last Update</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Meeting</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                          No data available in table
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow
                        key={project._id || project.id} // Ensure unique key for each row
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: '#f9fafb' },
                          borderBottom: '1px solid #e5e7eb'
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.startDate
                            ? new Date(project.startDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                          {project.title}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.contractor || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.consultant || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.products && Array.isArray(project.products) && project.products.length > 0
                            ? project.products.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.assignBy && typeof project.assignBy === 'object' 
                            ? project.assignBy.name // Render name if assignBy is an object
                            : project.assignBy || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.assignTo && typeof project.assignTo === 'object' 
                            ? project.assignTo.name // Render name if assignTo is an object
                            : project.assignTo || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Chip
                            label={project.stage || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{
                              backgroundColor: '#e0e7ff',
                              color: '#4f46e5',
                              textTransform: 'capitalize',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.lastUpdate
                            ? new Date(project.lastUpdate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {project.meeting || '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, project)}
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
                disabled 
                size="small"
                sx={{ 
                  color: '#d1d5db',
                  '&.Mui-disabled': {
                    color: '#d1d5db'
                  }
                }}
              >
                ←
              </Button>
              <Button 
                disabled 
                size="small"
                sx={{ 
                  color: '#d1d5db',
                  '&.Mui-disabled': {
                    color: '#d1d5db'
                  }
                }}
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
        <ContextMenuItem onClick={handleEditProject}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </ContextMenuItem>
        {userRole === 'admin' && (
          <ContextMenuItem onClick={handleDeleteProject}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </ContextMenuItem>
        )}
      </Menu>

      {/* Add/Edit Project Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProjectId 
            ? (userRole === 'admin' ? 'Edit Project' : 'Update Project Status')
            : 'Add New Project'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {userRole === 'admin' && (
            <>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                  Project Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Project Name"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                  Project Type
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.projectType || ''}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select Project Type</em>
                    </MenuItem>
                    <MenuItem value="residential">Residential</MenuItem>
                    <MenuItem value="hospital">Hospital</MenuItem>
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="commercial">Commercial Space</MenuItem>
                    <MenuItem value="airport">Airport</MenuItem>
                    <MenuItem value="railway">Railway</MenuItem>
                    <MenuItem value="mes">MES</MenuItem>
                    <MenuItem value="landmark">Landmark Project</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                  Contractor
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Contractor Name"
                  value={formData.contractor || ''}
                  onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                  Consultant
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Consultant Name"
                  value={formData.consultant || ''}
                  onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Products
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Waterproofing Membranes', 'Acoustic insulation', 'Spray', 'Coatings', 'Drainage boards', 'Thermal Insulation', 'Floorings'].map((product) => (
                    <Box key={product} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="checkbox"
                        id={product}
                        checked={
                          formData.products && Array.isArray(formData.products)
                            ? formData.products.includes(product)
                            : false
                        }
                        onChange={(e) => {
                          const currentProducts = formData.products && Array.isArray(formData.products) ? [...formData.products] : [];
                          if (e.target.checked) {
                            if (!currentProducts.includes(product)) {
                              currentProducts.push(product);
                            }
                          } else {
                            currentProducts.splice(currentProducts.indexOf(product), 1);
                          }
                          setFormData({ ...formData, products: currentProducts });
                        }}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                      <label htmlFor={product} style={{ cursor: 'pointer', userSelect: 'none', color: '#4b5563' }}>
                        {product}
                      </label>
                    </Box>
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Stage
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={formData.stage || ''}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select Stage</em>
                </MenuItem>
                <MenuItem value="suspect">Suspect</MenuItem>
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="source-approver-submission">Source Approver Submission</MenuItem>
                <MenuItem value="source-approved">Source Approved</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Assign To
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={formData.assignTo || ''}
                onChange={(e) => setFormData({ ...formData, assignTo: e.target.value })}
                displayEmpty
                disabled={userRole !== 'admin'} // Disable for non-admin users
              >
                <MenuItem value="">
                  <em>Select Team Member</em>
                </MenuItem>
                {userRole === 'admin' && teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <MenuItem
                      key={member.id || member._id}
                      value={member.id || member._id}
                    >
                      {member.name}
                    </MenuItem>
                  ))
                ) : userRole === 'admin' ? (
                  <MenuItem disabled>No team members available</MenuItem>
                ) : (
                  <MenuItem value="self">Self</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          {userRole === 'admin' && (
            <>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}

          <TextField
            fullWidth
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProject}>
            {editingProjectId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Projects;