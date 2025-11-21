import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
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
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | undefined>(undefined);

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
        
        // Get all employees to map reporting names
        const allEmployees = data.employees;
        
        // Create a mapping of employee IDs to names
        const employeeNameMap: Record<string, string> = {};
        allEmployees.forEach((emp: any) => {
          const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A';
          employeeNameMap[emp._id] = name;
        });
        
        // Transform backend data to match Employee interface and filter out admin
        const transformedEmployees: Employee[] = data.employees
          .filter((emp: any) => emp.role !== 'admin' && emp._id !== currentUser?.id)
          .map((emp: any) => {
            // Map reporting field to actual manager name using reportsTo field (ObjectId reference)
            let reportingTo = 'N/A';
            if (emp.reportsTo) {
              // If reportsTo is set, look up the manager's name from the employee map
              if (employeeNameMap[emp.reportsTo]) {
                reportingTo = employeeNameMap[emp.reportsTo];
              } else {
                reportingTo = 'Manager Not Found';
              }
            } else if (emp.reporting && emp.reporting !== 'self') {
              // Fallback to reporting field for cases where it's a direct name/ID
              reportingTo = emp.reporting;
            }
            
            return {
              id: emp._id,
              name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A',
              role: emp.role ?
                (emp.department ?
                  `${emp.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} - ${emp.department}` :
                  emp.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                ) : 'N/A',
              reportingTo: reportingTo,
              status: 'Active', // Default to active
              allMeetings: 0, // Placeholder - will be implemented later
              mostVisitedCategory: 'N/A', // Placeholder - will be implemented later
              phone: emp.mobile || 'N/A',
            };
          });
        
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
    setEditingEmployeeId(undefined);
    setShowAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setEditingEmployeeId(undefined);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/auth/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Remove employee from local state after successful deletion
          setEmployees(employees.filter(emp => emp.id !== id));
        } else {
          console.error('Failed to delete employee:', data.message);
          alert('Failed to delete employee: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee. Please try again.');
      }
    }
  };

  const handleEditEmployee = (id: string) => {
    // Open edit dialog with employee ID
    setEditingEmployeeId(id);
    setShowAddDialog(true);
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
    <>
      {/* Full Width Employee Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">EMPLOYEES</h1>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-transparent border-0">
          <div>
            <h5 className="mb-0 fw-semibold">Employees</h5>
          </div>
          <Button 
            variant="primary" 
            onClick={handleAddEmployee}
            className="d-flex align-items-center"
          >
            <Icon icon="mdi:account-plus" className="me-2" />
            Add Employee
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-3">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Icon icon="mdi:magnify" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table className="table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold text-muted small">
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none text-muted"
                      onClick={() => handleSort('name')}
                    >
                      Employee
                      <Icon icon={sortField === 'name' && sortDirection === 'desc' ? 'mdi:chevron-down' : 'mdi:chevron-up'} className="ms-1" />
                    </Button>
                  </th>
                  <th className="fw-semibold text-muted small">Status</th>
                  <th className="fw-semibold text-muted small">Meetings</th>
                  <th className="fw-semibold text-muted small">Category</th>
                  <th className="fw-semibold text-muted small">Contact</th>
                  <th className="fw-semibold text-muted small text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle me-3"
                          style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}
                        >
                          {getEmployeeInitials(employee.name)}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{employee.name}</h6>
                          <small className="text-muted">{employee.role}</small>
                          <br />
                          <small className="text-muted">Reports to: {employee.reportingTo}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge 
                        bg={employee.status === 'Active' ? 'success' : 'secondary'}
                        className="px-2 py-1"
                      >
                        {employee.status}
                      </Badge>
                    </td>
                    <td>
                      <span className="fw-semibold">{employee.allMeetings}</span>
                    </td>
                    <td>
                      <small className="text-muted">{employee.mostVisitedCategory}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Icon icon="mdi:phone" className="text-muted me-1" />
                        <small className="text-muted">{employee.phone}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditEmployee(employee.id)}
                        >
                          <Icon icon="mdi:pencil" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Icon icon="mdi:delete" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {filteredAndSortedEmployees.length === 0 && (
              <div className="text-center py-5">
                <Icon icon="mdi:account-search" className="text-muted" width="64" height="64" />
                <h6 className="mt-3 text-muted">No employees found</h6>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first employee'}
                </p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal 
        show={showAddDialog} 
        onHide={handleCloseAddDialog}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddEmployeeForm
            onClose={handleCloseAddDialog}
            employeeId={editingEmployeeId}
            onSave={() => {
              // Refresh the employee list after adding/editing
              fetchEmployees();
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Employees;
