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
    // Add logout logic here
    console.log('Logging out...');
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Reports', icon: <DashboardIcon fontSize="small" />, path: '/reports', color: '#1976d2' },
    { text: 'Team', icon: <GroupIcon fontSize="small" />, path: '/team', color: '#9c27b0' },
    { text: 'Projects', icon: <WorkIcon fontSize="small" />, path: '/projects', color: '#ff9800' },
    { text: 'Clients', icon: <PeopleIcon fontSize="small" />, path: '/clients', color: '#4caf50' },
  ];

  const accountMenuItems = [
    { text: 'Profile', icon: <Person fontSize="small" />, path: '/profile' },
    { text: 'My Leave', icon: <CalendarMonth fontSize="small" />, path: '/my-leave' },
    { text: 'Team Leave', icon: <GroupWork fontSize="small" />, path: '/team-leave' },
    { text: 'Leave Settings', icon: <Settings fontSize="small" />, path: '/leave-settings' },
  ];

  const companyMenuItems = [
    { text: 'Company', icon: <Business fontSize="small" />, path: '/company' },
    { text: 'Attendance', icon: <Schedule fontSize="small" />, path: '/attendance' },
    { text: 'Employees', icon: <Badge fontSize="small" />, path: '/employees' },
    { text: 'Categories', icon: <Category fontSize="small" />, path: '/categories' },
    { text: 'Department', icon: <GroupWork fontSize="small" />, path: '/department' },
    { text: 'Branches', icon: <LocationOn fontSize="small" />, path: '/branches' },
    { text: 'Holiday', icon: <Event fontSize="small" />, path: '/holiday' },
    { text: 'Billing', icon: <Receipt fontSize="small" />, path: '/billing' },
    { text: 'Company Profile', icon: <AccountBalance fontSize="small" />, path: '/company-profile' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          background: `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`,
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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

      {/* Content Area - Main Menu + Company */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {/* Main Menu Section */}
        <Box
          sx={{
            p: 0.5,
            background: 'linear-gradient(180deg, #2a2a2a 0%, #333333 100%)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.5rem',
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
                      fontSize: '0.65rem',
                      fontWeight: (location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')) ? 600 : 400,
                      color: (location.pathname === item.path || (location.pathname === '/' && item.path === '/reports')) ? item.color : 'rgba(255, 255, 255, 0.9)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Company Menu Section */}
        <Box
          sx={{
            p: 0.5,
            background: 'linear-gradient(180deg, #2a2a2a 0%, #333333 100%)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.5rem',
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
                      background: `linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)`,
                      borderLeft: `3px solid #2196f3`,
                      '&:hover': {
                        background: `linear-gradient(135deg, rgba(33, 150, 243, 0.25) 0%, rgba(33, 150, 243, 0.15) 100%)`,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? '#2196f3' : 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.65rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? '#2196f3' : 'rgba(255, 255, 255, 0.9)' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Footer - My Account - Fixed at bottom */}
      <Box
        sx={{
          flexGrow: 0,
          p: 0.5,
          background: 'linear-gradient(180deg, #2a2a2a 0%, #333333 100%)',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.5rem',
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
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  py: 0.2,
                  px: 0.8,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', minWidth: 24 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.65rem', fontWeight: 400, color: 'rgba(255, 255, 255, 0.9)' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
          
          {/* User Profile with Dropdown */}
          <IconButton
            onClick={handleAvatarClick}
            sx={{
              p: 0,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              A
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 150,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
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