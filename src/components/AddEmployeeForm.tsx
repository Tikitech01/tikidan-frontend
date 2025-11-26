import React, { useState, useEffect } from 'react';
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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const DEPARTMENT_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'it', label: 'Information Technology' },
  { value: 'operations', label: 'Operations' },
  { value: 'specifications', label: 'Specifications' },
  { value: 'business_development', label: 'Business Development' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'technical', label: 'Technical' },
  { value: 'testing', label: 'Testing' },
  { value: 'territory', label: 'Territory' },
  { value: 'general_management', label: 'General Management' },
  { value: 'head_office', label: 'Head Office' },
  { value: '', label: 'No Department' },
];

const ROLE_OPTIONS = [
  { value: 'deputy_manager', label: 'Deputy Manager' },
  { value: 'assistant_manager', label: 'Assistant Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior_manager', label: 'Senior Manager' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'president', label: 'President' },
  { value: 'marketing_coordinator', label: 'Marketing Coordinator' },
  { value: 'agm', label: 'AGM' },
  { value: 'executive', label: 'Executive' },
  { value: 'accounts_executive', label: 'Accounts Executive' },
  { value: 'zonal_manager', label: 'Zonal Manager' },
  { value: 'technical_head', label: 'Technical Head' },
  { value: 'tester', label: 'Tester' },
  { value: 'territory_manager', label: 'Territory Manager' },
  { value: 'sr_general_manager', label: 'Sr. General Manager' },
  { value: 'business_head', label: 'Business Head' },
  { value: 'admin', label: 'Administrator' },
  { value: 'user', label: 'User' },
];

interface Permission {
  value: string;
  label: string;
}

interface EmployeeFormData {
  reporting: string;
  reportsTo: string;
  department: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  customPermissions: string[];
}

interface EmployeeOption {
  id: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  employeeId: string;
}

interface AddEmployeeFormProps {
  onClose: () => void;
  onSave?: (data: EmployeeFormData) => void;
  employeeId?: string; // If provided, form is in edit mode
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ 
  onClose, 
  onSave,
  employeeId 
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    reporting: '',
    reportsTo: '',
    department: '',
    employeeId: 'EMP' + Math.floor(Math.random() * 10000),
    firstName: '',
    lastName: '',
    designation: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    customPermissions: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeOption[]>([]);

  // Fetch available permissions and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching employee data...');
        
        // Fetch employees for reporting dropdown
        const employeesResponse = await fetch('http://localhost:5000/api/auth/employees-list', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Employees response status:', employeesResponse.status);
        
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          console.log('Fetched employees:', employeesData.employees);
          setAvailableEmployees(employeesData.employees);
        } else {
          console.error('Failed to fetch employees:', employeesResponse.status);
        }
        
        // Fetch permissions
        const permissionsResponse = await fetch('http://localhost:5000/api/auth/available-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          setAvailablePermissions(permissionsData.permissions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (employeeId) {
      const fetchEmployeeData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/auth/employees/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const employee = data.employee;
            setFormData({
              reporting: employee.reporting || '',
              reportsTo: employee.reportsTo || '',
              department: employee.department || '',
              employeeId: employee.employeeId || '',
              firstName: employee.firstName || '',
              lastName: employee.lastName || '',
              designation: employee.designation || '',
              email: employee.email || '',
              mobile: employee.mobile || '',
              password: '', // Don't populate password for security
              role: employee.role || '',
              addressLine1: employee.addressLine1 || '',
              addressLine2: employee.addressLine2 || '',
              city: employee.city || '',
              state: employee.state || '',
              country: employee.country || '',
              customPermissions: employee.customPermissions || [],
            });
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        }
      };

      fetchEmployeeData();
    }
  }, [employeeId]);

  const handleInputChange = (field: keyof EmployeeFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSelectChange = (field: keyof EmployeeFormData) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // Auto-populate permissions when role is selected
    if (field === 'role' && value) {
      fetchRolePermissions(value);
    }
  };

  // Fetch role-based permissions and auto-populate
  const fetchRolePermissions = async (role: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/roles/role-permissions/${role}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched role permissions:', data);
        // Auto-populate with role's default permissions
        setFormData(prev => ({
          ...prev,
          customPermissions: data.permissions || []
        }));
      } else {
        console.error('Failed to fetch role permissions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const handlePermissionChange = (event: any) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      customPermissions: typeof value === 'string' ? value.split(',') : value
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Only validate essential fields for testing
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Password is only required when creating new employee
    if (!employeeId) {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    if (!formData.role) newErrors.role = 'Role is required';

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
      const token = localStorage.getItem('token');
      
      // Determine if we're creating or updating
      const url = employeeId 
        ? `http://localhost:5000/api/auth/employees/${employeeId}`
        : 'http://localhost:5000/api/auth/register-employee';
      
      const method = employeeId ? 'PUT' : 'POST';
      
      // Call the backend API to register/update employee
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          employeeId: formData.employeeId,
          designation: formData.designation,
          mobile: formData.mobile,
          department: formData.department,
          reporting: formData.reporting,
          reportsTo: formData.reportsTo || null,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          customPermissions: formData.customPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${employeeId ? 'update' : 'create'} employee`);
      }

      console.log(`Employee ${employeeId ? 'updated' : 'created'} successfully:`, data);
      alert(`Employee ${employeeId ? 'updated' : 'created'} successfully!${!employeeId ? ` They can now login with email: ${formData.email}` : ''}`);
      
      if (onSave) {
        onSave(formData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      alert(error.message || 'Failed to create employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {employeeId ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Reports To */}
            <FormControl fullWidth error={!!errors.reportsTo}>
              <InputLabel>Reports To</InputLabel>
              <Select
                value={formData.reportsTo}
                onChange={handleSelectChange('reportsTo')}
                label="Reports To"
              >
                <MenuItem value="">
                  <em>None (Self-Managing)</em>
                </MenuItem>
                {availableEmployees.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      No employees available or loading...
                    </Typography>
                  </MenuItem>
                ) : (
                  availableEmployees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.designation} ({employee.employeeId})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.reportsTo && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.reportsTo}
                </Typography>
              )}
            </FormControl>

            {/* Department */}
            <FormControl fullWidth error={!!errors.department}>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleSelectChange('department')}
                label="Department"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.department && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.department}
                </Typography>
              )}
            </FormControl>

            {/* Employee ID */}
            <TextField
              fullWidth
              label="Employee ID"
              value={formData.employeeId}
              onChange={handleInputChange('employeeId')}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
              disabled
            />

            {/* First Name */}
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              placeholder="Enter first name"
            />

            {/* Last Name */}
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              placeholder="Enter last name"
            />

            {/* Designation */}
            <TextField
              fullWidth
              label="Designation"
              value={formData.designation}
              onChange={handleInputChange('designation')}
              error={!!errors.designation}
              helperText={errors.designation}
              placeholder="Enter designation"
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="Enter email address"
            />

            {/* Mobile */}
            <TextField
              fullWidth
              label="Mobile Number"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile}
              placeholder="Enter mobile number"
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              placeholder="Enter password"
            />

            {/* Role */}
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={handleSelectChange('role')}
                label="Role"
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            {/* Custom Permissions */}
            <FormControl fullWidth>
              <InputLabel>Custom Permissions</InputLabel>
              <Select
                multiple
                value={formData.customPermissions}
                onChange={handlePermissionChange}
                input={<OutlinedInput label="Custom Permissions" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const permission = availablePermissions.find(p => p.value === value);
                      return (
                        <Chip
                          key={value}
                          label={permission?.label || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission.value} value={permission.value}>
                    <Checkbox checked={formData.customPermissions.indexOf(permission.value) > -1} />
                    <ListItemText primary={permission.label} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Select specific routes/permissions for this employee. If none selected, role-based permissions will be used.
              </Typography>
            </FormControl>
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Address Line 1 */}
            <TextField
              fullWidth
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={handleInputChange('addressLine1')}
              error={!!errors.addressLine1}
              helperText={errors.addressLine1}
              placeholder="Enter address line 1"
            />

            {/* Address Line 2 */}
            <TextField
              fullWidth
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={handleInputChange('addressLine2')}
              placeholder="Enter address line 2 (optional)"
            />

            {/* City */}
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
              error={!!errors.city}
              helperText={errors.city}
              placeholder="Enter city"
            />

            {/* State */}
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleInputChange('state')}
              error={!!errors.state}
              helperText={errors.state}
              placeholder="Enter state"
            />

            {/* Country */}
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={handleInputChange('country')}
              error={!!errors.country}
              helperText={errors.country}
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
          {isSubmitting ? 'Saving...' : (employeeId ? 'Update Employee' : 'Save Employee')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddEmployeeForm;