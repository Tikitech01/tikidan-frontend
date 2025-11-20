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
      <NavItem key={`${item.permission}-${index}`} className="nav-item">
        <NavLink
          as={Link}
          to={item.path}
          className={`nav-link ${isItemActive ? 'active' : ''}`}
        >
          <Icon icon={iconName} className="nav-icon me-2" />
          <span className="nav-text">{item.text}</span>
        </NavLink>
      </NavItem>
    );
  };

  const renderMenuSection = (title: string, items: MenuItemConfig[], sectionKey: string) => {
    if (items.length === 0) return null;

    return (
      <div key={sectionKey} className="mb-3">
        <div className="nav-section-title">
          {title}
        </div>
        <Nav className="nav-pills flex-column">
          {items.map((item, index) => renderMenuItem(item, index))}
        </Nav>
      </div>
    );
  };

  return (
    <div className="sidebar sidebar-vertical">
      <div className="sidebar-inner">
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