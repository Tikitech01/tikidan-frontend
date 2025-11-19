import React, { useState, useEffect } from 'react';
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
import { fetchUserPermissions, generateMenuItems } from '../services/permissionService';
import type { UserPermissions, MenuItemConfig } from '../services/permissionService';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

// Icon mapping function
const getIconForMenuItem = (menuItem: string, color: string = '#2196f3') => {
  const iconMap: Record<string, React.ReactNode> = {
    'dashboard': <DashboardIcon fontSize="small" />,
    'projects': <WorkIcon fontSize="small" />,
    'clients': <PeopleIcon fontSize="small" />,
    'meetings': <CalendarMonth fontSize="small" />,
    'expenses_view': <AttachMoney fontSize="small" />,
    'expenses_create': <AttachMoney fontSize="small" />,
    'expenses_review': <RateReview fontSize="small" />,
    'expenses_manage': <Category fontSize="small" />,
    'expenses_settings': <Settings fontSize="small" />,
    'expenses_reports': <Assessment fontSize="small" />,
    'profile': <Person fontSize="small" />,
    'my_leaves': <CalendarMonth fontSize="small" />,
    'team': <GroupIcon fontSize="small" />,
    'company_profile': <Business fontSize="small" />,
    'attendance': <Schedule fontSize="small" />,
    'employees': <Badge fontSize="small" />,
    'categories': <Category fontSize="small" />,
    'department': <GroupWork fontSize="small" />,
    'branches': <LocationOn fontSize="small" />,
    'holiday': <Event fontSize="small" />,
    'billing': <Receipt fontSize="small" />
  };
  
  return iconMap[menuItem] || <DashboardIcon fontSize="small" />;
};

// Convert MenuItemConfig to display format
const formatMenuItem = (config: MenuItemConfig) => ({
  text: config.text,
  icon: getIconForMenuItem(config.permission, config.color),
  path: config.path,
  color: config.color
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // State for user data and permissions
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [menuItems, setMenuItems] = useState<{
    mainMenu: any[];
    expensesMenu: any[];
    accountMenu: any[];
    companyMenu: any[];
  }>({
    mainMenu: [],
    expensesMenu: [],
    accountMenu: [],
    companyMenu: []
  });

  // Fetch current user and permissions on component mount
  useEffect(() => {
    const initializeUser = () => {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // If user has permissions in localStorage, use them; otherwise fetch from backend
        if (user.permissions) {
          const generatedMenus = generateMenuItems(user.permissions, user.role);
          setMenuItems({
            mainMenu: generatedMenus.mainMenu.map(formatMenuItem),
            expensesMenu: generatedMenus.expensesMenu.map(formatMenuItem),
            accountMenu: generatedMenus.accountMenu.map(formatMenuItem),
            companyMenu: generatedMenus.companyMenu.map(formatMenuItem)
          });
        } else {
          // Fetch permissions from backend
          fetchUserPermissions().then((permissions) => {
            if (permissions) {
              setUserPermissions(permissions);
              const generatedMenus = generateMenuItems(permissions.permissions, user.role);
              setMenuItems({
                mainMenu: generatedMenus.mainMenu.map(formatMenuItem),
                expensesMenu: generatedMenus.expensesMenu.map(formatMenuItem),
                accountMenu: generatedMenus.accountMenu.map(formatMenuItem),
                companyMenu: generatedMenus.companyMenu.map(formatMenuItem)
              });
              
              // Update localStorage with permissions
              const updatedUser = { ...user, permissions: permissions.permissions };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          });
        }
      }
    };

    initializeUser();
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

  // Format role display (role-department or just role)
  const getRoleDisplay = (role: string, department: string) => {
    if (!role) return 'User';
    
    // Simple role name formatting for display
    const formatRoleName = (roleName: string) => {
      return roleName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    };
    
    const formattedRole = formatRoleName(role);
    
    // If no department is assigned, return just the role
    if (!department) return formattedRole;
    
    // If department exists, return "Role - Department" format
    return `${formattedRole} - ${department}`;
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
        {menuItems.mainMenu.length > 0 && (
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
              MEETING
            </Typography>
            <List sx={{ p: 0 }}>
              {menuItems.mainMenu.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.02 }}>
                  <ListItemButton
                    selected={location.pathname === item.path || 
                             (location.pathname === '/' && (item.path === '/reports' || item.path === '/dashboard')) ||
                             (location.pathname === '/dashboard' && item.path === '/dashboard') ||
                             (location.pathname === '/reports' && item.path === '/reports')}
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
                        color: (location.pathname === item.path || 
                               (location.pathname === '/' && (item.path === '/reports' || item.path === '/dashboard')) ||
                               (location.pathname === '/dashboard' && item.path === '/dashboard') ||
                               (location.pathname === '/reports' && item.path === '/reports')) ? item.color : 'rgba(255, 255, 255, 0.7)',
                        minWidth: 24,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.825rem',
                        fontWeight: (location.pathname === item.path || 
                                   (location.pathname === '/' && (item.path === '/reports' || item.path === '/dashboard')) ||
                                   (location.pathname === '/dashboard' && item.path === '/dashboard') ||
                                   (location.pathname === '/reports' && item.path === '/reports')) ? 600 : 400,
                        color: (location.pathname === item.path || 
                               (location.pathname === '/' && (item.path === '/reports' || item.path === '/dashboard')) ||
                               (location.pathname === '/dashboard' && item.path === '/dashboard') ||
                               (location.pathname === '/reports' && item.path === '/reports')) ? item.color : 'rgba(255, 255, 255, 0.9)',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Expenses Menu Section */}
        {menuItems.expensesMenu.length > 0 && (
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
              {menuItems.expensesMenu.map((item) => (
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
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Company Menu Section - Only show if there are items for the current user */}
        {menuItems.companyMenu.length > 0 && (
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
              {menuItems.companyMenu.map((item) => (
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
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* My Account Menu Section */}
        {menuItems.accountMenu.length > 0 && (
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
              {menuItems.accountMenu.map((item) => (
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
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : 'rgba(255, 255, 255, 0.9)' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
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
                {getRoleDisplay(currentUser?.role, currentUser?.department)}
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
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
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