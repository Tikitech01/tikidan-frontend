import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  
  Dashboard as DashboardIcon,
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Header */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          background: '#f8fafc',
          color: '#2c3e50',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
            }}
          />
          <Box sx={{ mt: 1, ml: -0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 0.9, color: '#2c3e50', mb: -0.5 }}>
              Tiki Tar Danosa
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', color: '#64748b' }}>
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
          background: '#ffffff',
          direction: 'rtl',
          '& > *': {
            direction: 'ltr',
          },
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f3f4',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(156, 163, 175, 0.4)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(156, 163, 175, 0.6)',
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
                color: '#64748b',
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
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.04)} 100%)`,
                        borderLeft: `3px solid ${item.color}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(item.color, 0.12)} 0%, ${alpha(item.color, 0.06)} 100%)`,
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: (location.pathname === item.path || 
                               (location.pathname === '/' && (item.path === '/reports' || item.path === '/dashboard')) ||
                               (location.pathname === '/dashboard' && item.path === '/dashboard') ||
                               (location.pathname === '/reports' && item.path === '/reports')) ? item.color : '#64748b',
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
                               (location.pathname === '/reports' && item.path === '/reports')) ? item.color : '#475569',
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
                color: '#64748b',
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
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.04)} 100%)`,
                        borderLeft: `3px solid ${item.color}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(item.color, 0.12)} 0%, ${alpha(item.color, 0.06)} 100%)`,
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : '#64748b', minWidth: 24 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : '#475569' }}
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
                color: '#64748b',
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
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.04)} 100%)`,
                        borderLeft: `3px solid ${item.color}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(item.color, 0.12)} 0%, ${alpha(item.color, 0.06)} 100%)`,
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : '#64748b', minWidth: 24 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : '#475569' }}
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
                color: '#64748b',
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
                        background: `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.04)} 100%)`,
                        borderLeft: `3px solid ${item.color}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(item.color, 0.12)} 0%, ${alpha(item.color, 0.06)} 100%)`,
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: location.pathname === item.path ? item.color : '#64748b', minWidth: 24 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: location.pathname === item.path ? 600 : 400, color: location.pathname === item.path ? item.color : '#475569' }}
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
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e2e8f0',
          color: '#2c3e50',
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
                backgroundColor: '#ffffff',
                borderRadius: '25px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
              '& .MuiInputBase-input': {
                color: '#2c3e50',
                fontSize: '0.775rem',
                '&::placeholder': {
                  color: '#64748b',
                  opacity: 1,
                },
              },
              minWidth: 450,
              width: '40rem',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748b' }} />
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
                backgroundColor: '#f1f5f9',
              },
              transition: 'background-color 0.2s ease',
            }}
          >
            {/* User Avatar */}
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#e2e8f0',
                border: '2px solid #cbd5e1',
              }}
            >
              <Person sx={{ color: '#475569', fontSize: '1.2rem' }} />
            </Avatar>
            
            {/* User Name */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#2c3e50',
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
                  color: '#64748b',
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
            borderRight: '1px solid #e2e8f0',
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
          backgroundColor: '#fafbfc',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;