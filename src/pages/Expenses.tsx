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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Container,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { getApiUrl } from '../services/api';

interface Expense {
  _id: string;
  employeeId: { _id: string; name: string };
  category: string;
  amount: number;
  currency: string;
  description: string;
  receipt?: string;
  date: string;
  location?: string;
  client?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: { _id: string; name: string };
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseStats {
  approvedCount: number;
  pendingCount: number;
  totalApprovedAmount: number;
  totalPendingAmount: number;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExpenseStats>({
    approvedCount: 0,
    pendingCount: 0,
    totalApprovedAmount: 0,
    totalPendingAmount: 0,
  });

  // Filter states
  const [filterStatus, setFilterStatus] = useState('Select All');
  const [filterCategory, setFilterCategory] = useState('Select All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    client: '',
    receipt: '',
  });

  const categories = ['Travel', 'Meals', 'Accommodation', 'Equipment', 'Office Supplies', 'Other'];
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Paid'];

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [expenses, filterStatus, filterCategory, filterStartDate, filterEndDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/expenses/stats/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Filter by status
    if (filterStatus !== 'Select All') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Filter by category
    if (filterCategory !== 'Select All') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => new Date(e.date) <= endDate);
    }

    setFilteredExpenses(filtered);
    setCurrentPage(0);
  };

  const handleAddExpense = async () => {
    if (!formData.category || !formData.amount || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingExpenseId ? 'PUT' : 'POST';
      const url = editingExpenseId
        ? `${getApiUrl()}/expenses/${editingExpenseId}`
        : `${getApiUrl()}/expenses`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          location: formData.location || null,
          client: formData.client || null,
          receipt: formData.receipt || null,
        })
      });

      if (response.ok) {
        alert(editingExpenseId ? 'Expense updated successfully' : 'Expense created successfully');
        setShowAddDialog(false);
        setEditingExpenseId(null);
        resetForm();
        fetchExpenses();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
      location: expense.location || '',
      client: expense.client || '',
      receipt: expense.receipt || '',
    });
    setEditingExpenseId(expense._id);
    setShowAddDialog(true);
  };

  const handleDeleteExpense = async () => {
    if (!deleteTargetId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/expenses/${deleteTargetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Expense deleted successfully');
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
        fetchExpenses();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      client: '',
      receipt: '',
    });
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingExpenseId(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      case 'Rejected':
        return '#ef4444';
      case 'Paid':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#d1fae5';
      case 'Pending':
        return '#fef3c7';
      case 'Rejected':
        return '#fee2e2';
      case 'Paid':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  const paginatedExpenses = filteredExpenses.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  return (
    <>
      {/* Full Width Expenses Management Bar */}
      <div className="employee-management-bar">
        <div className="employee-management-content">
          <h1 className="employee-management-title">EXPENSES</h1>
        </div>
      </div>

      <Container maxWidth={false} sx={{ mt: 1, mb: 3, px: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>

      {/* Filter Section */}
      <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 2 }}>
          {/* Add button with yellow circle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <IconButton
              onClick={() => setShowAddDialog(true)}
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

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {/* Expense Status Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                Expense Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="Select All">Select All</MenuItem>
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Expense Category Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                Expense Category
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="Select All">Select All</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Start Date Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                From Date
              </Typography>
              <TextField
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* End Date Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                To Date
              </Typography>
              <TextField
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Clear Filters */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFilterStatus('Select All');
                  setFilterCategory('Select All');
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                sx={{
                  color: '#6b7280',
                  borderColor: '#d1d5db',
                  '&:hover': { borderColor: '#9ca3af' }
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {/* Total Approved */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon icon="mdi:check-circle" width={24} style={{ color: '#10b981' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Approved
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                ₹{stats.totalApprovedAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                {stats.approvedCount} expenses
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Total Pending */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon icon="mdi:clock-outline" width={24} style={{ color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Pending
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                ₹{stats.totalPendingAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                {stats.pendingCount} expenses
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon icon="mdi:bank-transfer" width={24} style={{ color: '#3b82f6' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Paid
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                View Details
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Payment status
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Expenses Table Section */}
      <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Table Header with Rows Per Page */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={rowsPerPage.toString()}
                  onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Showing {filteredExpenses.length > 0 ? currentPage * rowsPerPage + 1 : 0} to {Math.min((currentPage + 1) * rowsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
              </Typography>
            </Box>
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.875rem' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedExpenses.length > 0 ? (
                      paginatedExpenses.map((expense) => (
                        <TableRow key={expense._id} hover>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                            <Chip
                              label={expense.category}
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor: '#f3f4f6',
                                color: '#4f46e5',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#1f2937' }}>
                            {expense.description}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {expense.location || '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }} align="right">
                            ₹{expense.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            <Chip
                              label={expense.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusBgColor(expense.status),
                                color: getStatusColor(expense.status),
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5}>
                              {expense.status === 'Pending' && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditExpense(expense)}
                                    title="Edit"
                                    sx={{ color: '#3b82f6' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setDeleteTargetId(expense._id);
                                      setShowDeleteConfirm(true);
                                    }}
                                    title="Delete"
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                              {expense.receipt && (
                                <IconButton
                                  size="small"
                                  href={expense.receipt}
                                  target="_blank"
                                  title="Download Receipt"
                                  sx={{ color: '#6b7280' }}
                                >
                                  <FileDownloadIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#6b7280' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Icon icon="mdi:inbox" width={48} style={{ color: '#d1d5db' }} />
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              No expenses found in the selected date range
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {Math.ceil(filteredExpenses.length / rowsPerPage) > 1 && (
                <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <Icon icon="mdi:chevron-left" />
                  </IconButton>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    Page {currentPage + 1} of {Math.ceil(filteredExpenses.length / rowsPerPage)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(filteredExpenses.length / rowsPerPage) - 1, currentPage + 1))}
                    disabled={currentPage >= Math.ceil(filteredExpenses.length / rowsPerPage) - 1}
                  >
                    <Icon icon="mdi:chevron-right" />
                  </IconButton>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1f2937' }}>
          {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Category */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Category *
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                displayEmpty
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Amount */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Amount (₹) *
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              size="small"
              inputProps={{ min: '0', step: '0.01' }}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Description *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter expense description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="small"
              multiline
              rows={3}
            />
          </Box>

          {/* Date */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Date *
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Location */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Location
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              size="small"
            />
          </Box>

          {/* Client */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Client
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter client name"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              size="small"
            />
          </Box>

          {/* Receipt URL */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
              Receipt URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://example.com/receipt"
              value={formData.receipt}
              onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddExpense}
            variant="contained"
            sx={{
              backgroundColor: '#4f46e5',
              color: '#fff',
              '&:hover': { backgroundColor: '#4338ca' }
            }}
          >
            {editingExpenseId ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1f2937' }}>
          Delete Expense?
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowDeleteConfirm(false)} sx={{ color: '#6b7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteExpense}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              color: '#fff',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </>
  );
};

export default Expenses;
