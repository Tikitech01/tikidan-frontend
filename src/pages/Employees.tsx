import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import AddEmployeeForm from '../components/AddEmployeeForm';

// Types
interface Employee {
  id: string;
  name: string;
  role: string;
  reportingTo: string;
  status: 'Active' | 'Inactive';
  allMeetings: number;
  mostVisitedCategory: string;
  phone: string;
}

const Employees: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Fetch employees from backend
  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Get current user info to filter out admin
        const currentUserData = localStorage.getItem('user');
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        
        // Transform backend data to match Employee interface and filter out admin
        const transformedEmployees: Employee[] = data.employees
          .filter((emp: any) => emp.role !== 'admin' && emp._id !== currentUser?.id)
          .map((emp: any) => ({
            id: emp._id,
            name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A',
            role: emp.role ? emp.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'N/A',
            reportingTo: emp.reporting ? emp.reporting.charAt(0).toUpperCase() + emp.reporting.slice(1) : 'N/A',
            status: 'Active', // Default to active
            allMeetings: 0, // Placeholder - will be implemented later
            mostVisitedCategory: 'N/A', // Placeholder - will be implemented later
            phone: emp.mobile || 'N/A',
          }));
        
        setEmployees(transformedEmployees);
      } else {
        console.error('Failed to fetch employees:', data.message);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = React.useMemo(() => {
    let filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.mostVisitedCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddEmployee = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleEditEmployee = (id: string) => {
    // Navigate to edit page or open edit dialog
    console.log('Edit employee:', id);
  };

  // Get employee initials for avatar
  const getEmployeeInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 3, pt: 2, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 1.5, borderBottom: '1px solid #e8e8e8' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', letterSpacing: '-0.3px' }}>
            Employee Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={handleAddEmployee}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            textTransform: 'none',
            px: 2,
            py: 0.75,
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Add Profile
        </Button>
      </Box>

      {/* Employees Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #e8e8e8',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6',
              }}>
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortDirection}
                    onClick={() => handleSort('name')}
                  >
                    Employee
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortDirection}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'allMeetings'}
                    direction={sortDirection}
                    onClick={() => handleSort('allMeetings')}
                  >
                    Meetings
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'mostVisitedCategory'}
                    direction={sortDirection}
                    onClick={() => handleSort('mostVisitedCategory')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'phone'}
                    direction={sortDirection}
                    onClick={() => handleSort('phone')}
                  >
                    Contact
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#495057', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      transition: 'background-color 0.2s ease',
                    },
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <TableCell sx={{ py: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5, fontSize: '0.95rem' }}>
                        {employee.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block', mb: 0.3, fontSize: '0.8rem' }}>
                        {employee.role}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: '0.75rem' }}>
                        Reports to: {employee.reportingTo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 3 }}>
                    <Chip
                      label={employee.status}
                      size="small"
                      sx={{
                        backgroundColor: employee.status === 'Active' ? '#d4edda' : '#f8d7da',
                        color: employee.status === 'Active' ? '#155724' : '#721c24',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        px: 1.5,
                        height: 26,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9rem' }}>
                      {employee.allMeetings}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3 }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                      {employee.mostVisitedCategory}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: '#95a5a6' }} />
                      <Typography variant="body2" sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                        {employee.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditEmployee(employee.id)}
                          sx={{
                            color: '#667eea',
                            backgroundColor: '#f0f3ff',
                            '&:hover': {
                              backgroundColor: '#e0e7ff',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          sx={{
                            color: '#e74c3c',
                            backgroundColor: '#ffe8e8',
                            '&:hover': {
                              backgroundColor: '#ffd4d4',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredAndSortedEmployees.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first employee'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add Employee Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <AddEmployeeForm
            onClose={handleCloseAddDialog}
            onSave={() => {
              // Refresh the employee list after adding
              fetchEmployees();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Employees;