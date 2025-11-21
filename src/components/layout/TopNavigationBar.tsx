import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';

const TopNavigationBar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showProfileDropdown]);

  // Format role display
  const getRoleDisplay = (role: string, department: string) => {
    if (!role) return 'User';
    
    const formatRoleName = (roleName: string) => {
      return roleName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    };
    
    const formattedRole = formatRoleName(role);
    if (!department) return formattedRole;
    return `${formattedRole} - ${department}`;
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Logout success
      console.log('Logged out successfully');
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still redirect to login
      navigate('/login');
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here (e.g., navigate to search results page)
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Ensure header stays static (no fixed positioning)
  useEffect(() => {
    const ensureStaticHeader = () => {
      const navbar = document.querySelector('.topnavbar') as HTMLElement;
      if (navbar) {
        navbar.style.position = 'relative';
        navbar.style.top = 'auto';
        navbar.style.left = 'auto';
        navbar.style.right = 'auto';
        navbar.style.zIndex = 'auto';
        navbar.style.width = '100%';
        navbar.style.height = '64px';
      }
    };

    ensureStaticHeader();
    const timeoutId = setTimeout(ensureStaticHeader, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Navbar 
      className="topnavbar navbar-expand-lg navbar-light" 
      expand="lg"
      style={{
        position: 'relative',
        zIndex: 1050
      }}
    >
      <Container fluid className="px-3">
        {/* Mobile menu toggle */}
        <Navbar.Toggle aria-controls="topnavbar-nav" className="me-3" />

        <Navbar.Collapse id="topnavbar-nav">
          {/* Left section - Logo and Search */}
          <div className="d-flex align-items-center flex-grow-1" style={{ marginLeft: '75px', marginTop: '-8px' }}>
            {/* Company Branding */}
            <div className="d-flex align-items-center" style={{ marginRight: '75px' }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  marginRight: 10
                }}
              />
              <div className="d-none d-md-block">
                <div style={{
                  fontWeight: 700,
                  fontSize: '1.0rem',
                  lineHeight: 1.2,
                  color: '#ffffff',
                  marginBottom: 2
                }}>
                  Tiki Tar Danosa
                </div>
                <div style={{
                  opacity: 0.7,
                  fontSize: '0.7rem',
                  color: '#e2e8f0',
                  lineHeight: 1
                }}>
                  India Pvt Ltd
                </div>
              </div>
            </div>

            {/* Search bar with improved styling - smaller size */}
            <div className="search-container flex-grow-1 d-none d-md-block" style={{ 
              maxWidth: '280px',
              minWidth: '200px'
            }}>
              <form onSubmit={handleSearch}>
                <div className="position-relative">
                  <Icon 
                    icon="mdi:magnify" 
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#d4d7dbff',
                      zIndex: 1,
                      fontSize: '16px'
                    }} 
                  />
                  <input 
                    type="text" 
                    className="form-control search-input" 
                    placeholder="Search employees or clients..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{
                      borderRadius: '7px',
                      border: '2px solid #4a5568',
                      backgroundColor: '#575e6dff',
                      color: '#ffffff',
                      fontWeight: '400',
                      padding: '0.45rem 1rem 0.45rem 2.5rem',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4a5568';
                      e.target.style.boxShadow = '0 0 0 3px rgba(74, 85, 104, 0.15)';
                      e.target.style.backgroundColor = '#2d3748';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4a5568';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      e.target.style.backgroundColor = '#343B4A';
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Mobile Search Bar - Only visible when collapsed */}
          <div className="d-md-none px-3 mt-3">
            <div className="search-container">
              <form onSubmit={handleSearch}>
                <div className="position-relative">
                  <Icon 
                    icon="mdi:magnify" 
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      zIndex: 1,
                      fontSize: '16px'
                    }} 
                  />
                  <input 
                    type="text" 
                    className="form-control search-input" 
                    placeholder="Search employees or clients..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{
                      borderRadius: '25px',
                      border: '2px solid #4a5568',
                      backgroundColor: '#343B4A',
                      color: '#ffffff !important',
                      fontWeight: '400',
                      padding: '0.45rem 1rem 0.45rem 2.5rem',
                      fontSize: '0.875rem',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4a5568';
                      e.target.style.boxShadow = '0 0 0 3px rgba(74, 85, 104, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4a5568';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right side items */}
          <Nav className="align-items-center">
            {/* Notifications */}
            <Nav.Item className="me-3">
              <div className="dropdown">
                <button
                  className="btn btn-link btn-sm position-relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ color: '#ffffff' }}
                >
                  <Icon icon="mdi:bell-outline" width="20" height="20" style={{ color: '#ffffff' }} />
                  <span className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill">
                  </span>
                </button>
                {showNotifications && (
                  <div 
                    className="dropdown-menu dropdown-menu-end show" 
                    style={{
                      width: '300px',
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 9999,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <div className="dropdown-header" style={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      fontFamily: 'var(--greeva-font-sans-serif)'
                    }}>
                      Notifications
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item-text" style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}>
                      <small>New project assigned</small>
                    </div>
                    <div className="dropdown-item-text" style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}>
                      <small>Meeting reminder</small>
                    </div>
                    <div className="dropdown-item-text" style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}>
                      <small>Report generated</small>
                    </div>
                  </div>
                )}
              </div>
            </Nav.Item>

            {/* User Profile Section */}
            <div className="d-flex align-items-center gap-3" style={{ backgroundColor: '#4a5568', height: '64px', margin: '-10px 8px 4px 8px', padding: '0 20px', borderRadius: '2px' }}>
              {/* User Info Display */}
              <div className="d-flex align-items-center gap-2">
                {/* User Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#4a5568',
                    border: '2px solid #a0aec0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon="mdi:account" style={{ color: '#ffffff', fontSize: '1.2rem' }} />
                </div>
                
                {/* User Info */}
                <div className="d-flex flex-column align-items-start">
                  <span style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                    margin: 0
                  }}>
                    {currentUser?.name || 'Admin User'}
                  </span>
                  <span style={{
                    color: '#cbd5e0',
                    fontSize: '0.7rem',
                    lineHeight: 1,
                    textTransform: 'capitalize',
                    margin: 0
                  }}>
                    {getRoleDisplay(currentUser?.role, currentUser?.department)}
                  </span>
                </div>
              </div>

              {/* Menu Button */}
              <div className="dropdown profile-dropdown">
                <button 
                  className="btn btn-link btn-sm p-0" 
                  type="button" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ color: '#ffffff' }}
                >
                  <Icon icon="mdi:chevron-down" style={{ color: '#ffffff' }} />
                </button>
                {showProfileDropdown && (
                  <div 
                    className="dropdown-menu dropdown-menu-end show"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 9999,
                      minWidth: '180px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                      fontFamily: 'var(--greeva-font-sans-serif)'
                    }}
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <Link 
                      className="dropdown-item d-flex align-items-center" 
                      to="/profile"
                      style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}
                    >
                      <Icon icon="mdi:account" className="me-2" /> Profile
                    </Link>
                    <button 
                      className="dropdown-item d-flex align-items-center" 
                      type="button"
                      style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}
                    >
                      <Icon icon="mdi:cog" className="me-2" /> Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item d-flex align-items-center" 
                      type="button" 
                      onClick={handleLogout}
                      style={{ fontFamily: 'var(--greeva-font-sans-serif)' }}
                    >
                      <Icon icon="mdi:logout" className="me-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavigationBar;