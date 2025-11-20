import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, NavItem, NavLink, Collapse } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { fetchUserPermissions, generateMenuItems, type UserPermissions, type MenuItemConfig } from '../../services/permissionService';

const VerticalNavigationBar: React.FC = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [menuItems, setMenuItems] = useState<{
    mainMenu: MenuItemConfig[];
    expensesMenu: MenuItemConfig[];
    accountMenu: MenuItemConfig[];
    companyMenu: MenuItemConfig[];
  }>({
    mainMenu: [],
    expensesMenu: [],
    accountMenu: [],
    companyMenu: []
  });

  // Get user data and permissions on component mount
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
            mainMenu: generatedMenus.mainMenu,
            expensesMenu: generatedMenus.expensesMenu,
            accountMenu: generatedMenus.accountMenu,
            companyMenu: generatedMenus.companyMenu
          });
        } else {
          // Fetch permissions from backend
          fetchUserPermissions().then((permissions) => {
            if (permissions) {
              setUserPermissions(permissions);
              const generatedMenus = generateMenuItems(permissions.permissions, user.role);
              setMenuItems({
                mainMenu: generatedMenus.mainMenu,
                expensesMenu: generatedMenus.expensesMenu,
                accountMenu: generatedMenus.accountMenu,
                companyMenu: generatedMenus.companyMenu
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

  // Icon mapping for menu items
  const getIconForMenuItem = (permission: string) => {
    const iconMap: Record<string, string> = {
      'dashboard': 'mdi:view-dashboard',
      'projects': 'mdi:briefcase',
      'clients': 'mdi:account-tie',
      'meetings': 'mdi:calendar',
      'team': 'mdi:account-group',
      'expenses_view': 'mdi:currency-usd',
      'expenses_create': 'mdi:plus-circle',
      'expenses_review': 'mdi:eye',
      'expenses_reports': 'mdi:chart-bar',
      'expenses_settings': 'mdi:cog',
      'expenses_manage': 'mdi:category',
      'profile': 'mdi:account',
      'my_leaves': 'mdi:calendar',
      'team_leave': 'mdi:calendar-account',
      'leave_settings': 'mdi:calendar-cog',
      'company_profile': 'mdi:office-building',
      'attendance': 'mdi:clock-outline',
      'employees': 'mdi:account-supervisor',
      'categories': 'mdi:shape',
      'department': 'mdi:account-multiple-outline',
      'branches': 'mdi:map-marker',
      'holiday': 'mdi:calendar-star',
      'billing': 'mdi:credit-card'
    };
    
    return iconMap[permission] || 'mdi:view-dashboard';
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    return path ? location.pathname === path : false;
  };

  const isExpanded = (menuId: string) => {
    return expandedMenus.includes(menuId);
  };

  const renderMenuItem = (item: MenuItemConfig, index: number) => {
    const isItemActive = isActive(item.path);
    const iconName = getIconForMenuItem(item.permission);

    return (
      <div 
        key={`${item.permission}-${index}`} 
        className={`side-nav-item ${isItemActive ? 'active' : ''}`}
        style={{
          padding: '0 10px',
          marginBottom: '2px'
        }}
      >
        <Link
          to={item.path}
          className={`side-nav-link ${isItemActive ? 'active' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: isItemActive ? '#1f2937' : '#4b5563',
            backgroundColor: isItemActive ? 'rgba(107, 114, 128, 0.12)' : 'transparent',
            border: isItemActive ? '1px solid rgba(107, 114, 128, 0.25)' : '1px solid transparent',
            fontWeight: isItemActive ? '600' : '500',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            transform: isItemActive ? 'translateX(2px)' : 'none',
            boxShadow: isItemActive ? '0 4px 15px rgba(107, 114, 128, 0.18)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isItemActive) {
              e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.15)';
              e.currentTarget.style.transform = 'translateX(3px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isItemActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          <div 
            className="menu-icon"
            style={{
              fontSize: '18px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isItemActive ? '#188ae2' : '#6b7280'
            }}
          >
            <Icon icon={iconName} />
          </div>
          <span 
            className="menu-text"
            style={{
              flex: 1,
              fontSize: '0.875rem'
            }}
          >
            {item.text}
          </span>
          <div 
            className="badge ms-auto"
            style={{
              backgroundColor: 'transparent',
              color: 'transparent'
            }}
          >
            {/* Badge can be added here if needed */}
          </div>
        </Link>
      </div>
    );
  };

  const renderMenuSection = (title: string, items: MenuItemConfig[], sectionKey: string) => {
    if (items.length === 0) return null;

    return (
      <div 
        key={sectionKey} 
        className="menu-section"
        style={{
          marginBottom: '24px'
        }}
      >
        <div 
          className="side-nav-title"
          style={{
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#374151',
            fontWeight: '600',
            fontSize: '0.7rem',
            padding: '16px 20px',
            margin: '8px 0 4px 0',
            opacity: '0.8',
            position: 'relative'
          }}
        >
          {title}
        </div>
        <div 
          className="sub-menu"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            paddingLeft: 0,
            marginTop: '4px'
          }}
        >
          {items.map((item, index) => renderMenuItem(item, index))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="sidenav-menu"
      style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
        padding: '20px 0'
      }}
    >
      <div 
        className="side-nav"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: 0,
          listStyle: 'none'
        }}
      >
        {/* Main Menu Section */}
        {renderMenuSection('MAIN MENU', menuItems.mainMenu, 'main')}
        
        {/* Expenses Menu Section */}
        {renderMenuSection('EXPENSES', menuItems.expensesMenu, 'expenses')}
        
        {/* Company Menu Section */}
        {renderMenuSection('COMPANY', menuItems.companyMenu, 'company')}
        
        {/* Account Menu Section */}
        {renderMenuSection('MY ACCOUNT', menuItems.accountMenu, 'account')}
      </div>
    </div>
  );
};

export default VerticalNavigationBar;