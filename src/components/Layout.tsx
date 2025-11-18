import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Person,
  CalendarMonth,
  GroupWork,
  Settings,
  Logout,
  Search,
  Business,
  Schedule,
  Badge,
  Category,
  BusinessCenter,
  LocationOn,
  Event,
  Receipt,
  AccountBalance,
  AttachMoney,
  RateReview,
  CheckCircle,
  Cancel,
  Assessment,
  HourglassEmpty,
  Payment,
  ManageAccounts,
} from '@mui/icons-material';

const drawerWidth = 200;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Get current user data from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close menu
    handleMenuClose();
    
    // Navigate to login page
    navigate('/login');
    
    console.log('Logged out successfully');
  };

  const menuItems = [
    { text: 'Reports', icon: <DashboardIcon fontSize="small" />, path: '/reports', color: '#2196f3' },
    { text: 'Team', icon: <GroupIcon fontSize="small" />, path: '/team', color: '#2196f3' },
    { text: 'Projects', icon: <WorkIcon fontSize="small" />, path: '/projects', color: '#2196f3' },
    { text: 'Clients', icon: <PeopleIcon fontSize="small" />, path: '/clients', color: '#2196f3' },
  ];

  const expensesMenuItems = [
    { text: 'Expenses', icon: <AttachMoney fontSize="small" />, path: '/expenses', color: '#2196f3' },
    { text: 'Review Expenses', icon: <RateReview fontSize="small" />, path: '/review-expenses', color: '#2196f3' },
    { text: 'Approved Expenses', icon: <CheckCircle fontSize="small" />, path: '/approved-expenses', color: '#2196f3' },
    { text: 'Rejected Expenses', icon: <Cancel fontSize="small" />, path: '/rejected-expenses', color: '#2196f3' },
    { text: 'Expenses Report', icon: <Assessment fontSize="small" />, path: '/expenses-report', color: '#2196f3' },
    { text: 'Payment Pending', icon: <HourglassEmpty fontSize="small" />, path: '/payment-pending', color: '#2196f3' },
    { text: 'Expense Paid', icon: <Payment fontSize="small" />, path: '/expense-paid', color: '#2196f3' },
    { text: 'Manage Categories', icon: <Category fontSize="small" />, path: '/manage-categories', color: '#2196f3' },
    { text: 'Expense Settings', icon: <ManageAccounts fontSize="small" />, path: '/expense-settings', color: '#2196f3' },
  ];

  const accountMenuItems = [
    { text: 'Profile', icon: <Person fontSize="small" />, path: '/profile', color: '#2196f3' },
    { text: 'My Leave', icon: <CalendarMonth fontSize="small" />, path: '/my-leave', color: '#2196f3' },
    { text: 'Team Leave', icon: <GroupWork fontSize="small" />, path: '/team-leave', color: '#2196f3' },
    { text: 'Leave Settings', icon: <Settings fontSize="small" />, path: '/leave-settings', color: '#2196f3' },
  ];

  // Filter company menu items based on user role
  const companyMenuItems = [
    { text: 'Company', icon: <Business fontSize="small" />, path: '/company', color: '#2196f3', adminOnly: false },
    { text: 'Attendance', icon: <Schedule fontSize="small" />, path: '/attendance', color: '#2196f3', adminOnly: false },
    { text: 'Employees', icon: <Badge fontSize="small" />, path: '/employees', color: '#2196f3', adminOnly: true },
    { text: 'Categories', icon: <Category fontSize="small" />, path: '/categories', color: '#2196f3', adminOnly: false },
    { text: 'Department', icon: <GroupWork fontSize="small" />, path: '/department', color: '#2196f3', adminOnly: false },
    { text: 'Branches', icon: <LocationOn fontSize="small" />, path: '/branches', color: '#2196f3', adminOnly: false },
    { text: 'Holiday', icon: <Event fontSize="small" />, path: '/holiday', color: '#2196f3', adminOnly: false },
    { text: 'Billing', icon: <Receipt fontSize="small" />, path: '/billing', color: '#2196f3', adminOnly: false },
    { text: 'Company Profile', icon: <AccountBalance fontSize="small" />, path: '/company-profile', color: '#2196f3', adminOnly: false },
  ].filter(item => !item.adminOnly || currentUser?.role === 'admin');

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#2a2a2a' }}>
      {/* Header */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          background: '#1a1a1a',
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
            }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.1, color: 'white' }}>
              Tiki Tar Danosa
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              India Pvt Ltd
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Content Area - All Menu Sections */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          background: '#2a2a2a',
          direction: 'rtl',
          '& > *': {
            direction: 'ltr',
          },
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
      >
        {/* Main Menu Section */}
        <Box sx={{ px: 0.5, py: 0.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              mb: 0.15,
              ml: 1,
            }}
          >
            MAIN MENU
          </Typography>
          <List sx={{ p: 0 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.02 }}>
                <ListItemButton
                  selected={location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.2,
                    px: 0.8,
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.2)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                      borderLeft: `3px solid ${item.color}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.25)} 0%, ${alpha(item.color, 0.15)} 100%)`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: (location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')) ? item.color : 'rgba(255, 255, 255, 0.7)',
                      minWidth: 24,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      fontWeight: (location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')) ? 600 : 400,
                      color: (location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')) ? item.color : 'rgba(255, 255, 255, 0.9)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Expenses Menu Section */}
        <Box sx={{ px: 0.5, py: 0.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              mb: 0.15,
              ml: 1,
            }}
          >
            EXPENSES
          </Typography>
          <List sx={{ p: 0 }}>
            {expensesMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.02 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.2,
                    px: 0.8,
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.2)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                      borderLeft: `3px solid ${item.color}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.25)} 0%, ${alpha(item.color, 0.15)} 100%)`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Company Menu Section */}
        <Box sx={{ px: 0.5, py: 0.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              mb: 0.15,
              ml: 1,
            }}
          >
            COMPANY
          </Typography>
          <List sx={{ p: 0 }}>
            {companyMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.02 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.2,
                    px: 0.8,
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.2)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                      borderLeft: `3px solid ${item.color}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.25)} 0%, ${alpha(item.color, 0.15)} 100%)`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* My Account Menu Section - Now inside scrollable area */}
        <Box sx={{ px: 0.5, py: 0.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: 0.5,
              mb: 0.15,
              ml: 1,
            }}
          >
            MY ACCOUNT
          </Typography>
          <List sx={{ p: 0 }}>
            {accountMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.02 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 0.2,
                    px: 0.8,
                    backgroundColor: 'transparent',
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.2)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                      borderLeft: `3px solid ${item.color}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.25)} 0%, ${alpha(item.color, 0.15)} 100%)`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(42, 42, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          height: '64px',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', height: '64px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' } }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flexGrow: -0.5 }} />
          
          <TextField
            variant="outlined"
            size="small"
            placeholder="Type Employee or Client Name"
            sx={{
              mx: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '25px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '0.775rem',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
              minWidth: 450,
              width: '40rem',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ flexGrow: 1.5 }} />
          
          {/* User Profile Section */}
          <Box
            onClick={handleAvatarClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              borderRadius: '8px',
              px: 1.5,
              py: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              transition: 'background-color 0.2s ease',
            }}
          >
            {/* User Avatar */}
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Person sx={{ color: 'white', fontSize: '1.2rem' }} />
            </Avatar>
            
            {/* User Name */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  lineHeight: 1.2,
                }}
              >
                {currentUser?.name || 'Admin User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  textTransform: 'capitalize',
                }}
              >
                {currentUser?.role ? currentUser.role.replace(/_/g, ' ') : 'User'}
              </Typography>
            </Box>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                },
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'transparent',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pt: '72px',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;