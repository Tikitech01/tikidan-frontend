import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import AddEmployeeForm from '../components/AddEmployeeForm';
import { getApiUrl } from '../services/api';

// Types
interface Employee {
  id: string;
  name: string;
  role: string;
  reportingTo: string;
  status: 'Active' | 'Inactive' | 'Suspended by Admin';
  suspensionReason?: string;
  allMeetings: number;
  mostVisitedCategory: string;
  phone: string;
}

const Employees: React.FC = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | undefined>(undefined);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  // Transfer dialog state
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [employeeToTransfer, setEmployeeToTransfer] = useState<Employee | null>(null);
  const [clientsToTransfer, setClientsToTransfer] = useState<any[]>([]);
  const [selectedNewEmployeeId, setSelectedNewEmployeeId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Helper: fetch clients for an employee
  const fetchClientsForEmployee = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];
      // Use a dedicated endpoint to get clients by employee
      const clientsResponse = await fetch(`${getApiUrl()}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await clientsResponse.json();
      if (data.success && Array.isArray(data.data)) {
        console.log('DEBUG: employeeId for filter:', employeeId);
        console.log('DEBUG: All client createdBy values:', data.data.map((c: any) => c.createdBy));
        return data.data.filter((client: any) => client.createdBy === employeeId);
      }
      return [];
    } catch {
      return [];
    }
  };

  // API call to suspend employee
  const suspendEmployeeApi = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/auth/employees/${id}/unsuspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: 'Suspended by Admin' } : emp));
      } else {
        alert('Failed to suspend employee: ' + data.message);
      }
    } catch (error) {
      alert('Error suspending employee. Please try again.');
    }
  };

  // API call to delete employee
  const deleteEmployeeApi = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${getApiUrl()}/auth/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmployees(employees.filter(emp => emp.id !== id));
      } else {
        alert('Failed to delete employee: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting employee. Please try again.');
    }
  };

  // Fetch employees from backend
  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.employee-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openDropdownId]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${getApiUrl()}/auth/employees`, {
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
              status: emp.status || 'Active', // Map backend status or default to active
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
      
      // Handle string comparison
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
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

        console.log('DEBUG: handleDeleteEmployee called for', id);
        const clients = await fetchClientsForEmployee(id);
        alert(`DEBUG: Found ${clients.length} clients for employee ${id}`);
        setTransferLoading(false);
        if (clients.length > 0) {
          // Show transfer dialog
          const emp = employees.find(e => e.id === id) || null;
          setEmployeeToTransfer(emp);
          setClientsToTransfer(clients);
          setShowTransferDialog(true);
        } else {
          // No clients, proceed to delete
          await deleteEmployeeApi(id);
        }

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

  const handleSuspendEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to suspend this employee?')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/auth/employees/${id}/suspend`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        console.log('DEBUG: handleSuspendEmployee called for', id);
        const clients = await fetchClientsForEmployee(id);
        alert(`DEBUG: Found ${clients.length} clients for employee ${id}`);
        setTransferLoading(false);
        if (clients.length > 0) {
          // Show transfer dialog
          const emp = employees.find(e => e.id === id) || null;
          setEmployeeToTransfer(emp);
          setClientsToTransfer(clients);
          setShowTransferDialog(true);
        } else {
          // No clients, proceed to suspend
          await suspendEmployeeApi(id);
        }

        if (response.ok && data.success) {
          // Update employee status in local state
          setEmployees(employees.map(emp => 
            emp.id === id ? { ...emp, status: 'Suspended by Admin' } : emp
          ));
        } else {
          console.error('Failed to suspend employee:', data.message);
          alert('Failed to suspend employee: ' + data.message);
        }
      } catch (error) {
        console.error('Error suspending employee:', error);
        alert('Error suspending employee. Please try again.');
      }
    }
  };

  const handleUnsuspendEmployee = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${getApiUrl()}/auth/employees/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update employee status in local state
        setEmployees(employees.map(emp => 
          emp.id === id ? { ...emp, status: 'Active' } : emp
        ));
      } else {
        console.error('Failed to unsuspend employee:', data.message);
        alert('Failed to unsuspend employee: ' + data.message);
      }
    } catch (error) {
      console.error('Error unsuspending employee:', error);
      alert('Error unsuspending employee. Please try again.');
    }
  };



  return (
    <>
      {/* Custom CSS to hide dropdown arrow */}
      <style>
        {`
          .no-arrow::after {
            display: none !important;
          }
        `}
      </style>
      {/* Full Width Employee Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">EMPLOYEES</h1>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0">
          <Row className="align-items-center">
            <Col lg={4} md={6} className="mb-3 mb-lg-0">
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
            <Col lg={8} md={6} className="text-lg-end">
              <Button 
                variant="primary" 
                onClick={handleAddEmployee}
                className="d-flex align-items-center ms-lg-auto"
              >
                <Icon icon="mdi:account-plus" className="me-2" />
                Add Employee
              </Button>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>

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
                          {employee.name
                            .split(' ')
                            .map(word => word.charAt(0))
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
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
                        bg={
                          employee.status === 'Active' ? 'success' : 
                          employee.status === 'Suspended by Admin' ? 'warning' : 'secondary'
                        }
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
                      <div className="d-flex justify-content-center">
                        <Dropdown 
                          show={openDropdownId === employee.id} 
                          onToggle={(isOpen) => {
                            setOpenDropdownId(isOpen ? employee.id : null);
                          }}
                          className="employee-dropdown"
                        >
                          <Dropdown.Toggle
                            variant="link"
                            className="text-muted p-0 border-0 no-arrow"
                            style={{ boxShadow: 'none' }}
                          >
                            <Icon icon="mdi:dots-vertical" width="20" height="20" />
                          </Dropdown.Toggle>

                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => {
                              handleEditEmployee(employee.id);
                              setOpenDropdownId(null);
                            }}>
                              <Icon icon="mdi:pencil" className="me-2" />
                              Edit
                            </Dropdown.Item>
                            {employee.status === 'Suspended by Admin' ? (
                              <Dropdown.Item onClick={() => {
                                handleUnsuspendEmployee(employee.id);
                                setOpenDropdownId(null);
                              }}>
                                <Icon icon="mdi:account-check" className="me-2" />
                                Activate
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item onClick={() => {
                                handleSuspendEmployee(employee.id);
                                setOpenDropdownId(null);
                              }}>
                                <Icon icon="mdi:account-off" className="me-2" />
                                Suspend
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => {
                                handleDeleteEmployee(employee.id);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Icon icon="mdi:delete" className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
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

      {/* Transfer Clients Modal */}
      <Modal show={showTransferDialog} onHide={() => setShowTransferDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Clients Before Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {transferLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <p>
                Employee <b>{employeeToTransfer?.name}</b> has <b>{clientsToTransfer.length}</b> client(s). Please select another employee to transfer these clients before proceeding.
              </p>
              <Form.Group>
                <Form.Label>Select New Employee</Form.Label>
                <Form.Select value={selectedNewEmployeeId} onChange={e => setSelectedNewEmployeeId(e.target.value)}>
                  <option value="">-- Select Employee --</option>
                  {employees.filter(e => e.id !== employeeToTransfer?.id).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="mt-3">
                <Button variant="primary" disabled={!selectedNewEmployeeId || transferLoading} onClick={async () => {
                  // Transfer clients and then suspend/delete
                  if (!employeeToTransfer || !selectedNewEmployeeId) return;
                  setTransferLoading(true);
                  try {
                    const token = localStorage.getItem('token');
                    for (const client of clientsToTransfer) {
                      await fetch(`${getApiUrl()}/clients/${client.id}/transfer`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ toEmployeeId: selectedNewEmployeeId })
                      });
                    }
                    // After transfer, suspend or delete
                    if (employeeToTransfer.status === 'Suspended by Admin') {
                      await deleteEmployeeApi(employeeToTransfer.id);
                    } else {
                      await suspendEmployeeApi(employeeToTransfer.id);
                    }
                    setShowTransferDialog(false);
                    setEmployeeToTransfer(null);
                    setClientsToTransfer([]);
                    setSelectedNewEmployeeId('');
                    fetchEmployees();
                    alert('Clients transferred and action completed.');
                  } catch (error) {
                    alert('Error transferring clients. Please try again.');
                  }
                  setTransferLoading(false);
                }}>
                  Transfer & Continue
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => setShowTransferDialog(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Employees;
