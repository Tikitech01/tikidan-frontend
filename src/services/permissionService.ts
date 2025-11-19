// Permission service for fetching and managing user permissions

export interface UserPermissions {
  permissions: string[];
  role: string;
  displayName: string;
}

export interface MenuItemConfig {
  text: string;
  permission: string;
  path: string;
  color: string;
}

// Menu route mapping - connects backend menuAccess to frontend routes
export const MENU_ROUTE_MAPPING: Record<string, string> = {
  'dashboard': '/dashboard',
  'projects': '/projects',
  'clients': '/clients',
  'meetings': '/meetings',
  'team': '/team',
  
  // Individual expense permissions
  'expenses_view': '/expenses',
  'expenses_create': '/expenses',
  'expenses_review': '/review-expenses',
  'expenses_manage': '/manage-categories',
  'expenses_settings': '/expense-settings',
  'expenses_reports': '/expenses-report',
  
  'profile': '/profile',
  'my_leaves': '/my-leave',
  'team_leave': '/team-leave',
  'leave_settings': '/leave-settings',
  'company_profile': '/company-profile',
  'attendance': '/attendance',
  'employees': '/employees',
  'categories': '/categories',
  'department': '/department',
  'branches': '/branches',
  'holiday': '/holiday',
  'billing': '/billing'
};

// Menu item configurations
export const MENU_CONFIGURATIONS: Record<string, MenuItemConfig[]> = {
  mainMenu: [
    { text: 'Reports', permission: 'dashboard', path: '/reports', color: '#2196f3' },
    { text: 'Projects', permission: 'projects', path: '/projects', color: '#2196f3' },
    { text: 'Clients', permission: 'clients', path: '/clients', color: '#2196f3' },
    { text: 'Meetings', permission: 'meetings', path: '/meetings', color: '#2196f3' },
    { text: 'Team', permission: 'team', path: '/team', color: '#2196f3' }
  ],
  expensesMenu: [
    { text: 'Expenses', permission: 'expenses_view', path: '/expenses', color: '#2196f3' },
    { text: 'Review Expenses', permission: 'expenses_review', path: '/review-expenses', color: '#2196f3' },
    { text: 'Approved Expenses', permission: 'expenses_review', path: '/approved-expenses', color: '#2196f3' },
    { text: 'Rejected Expenses', permission: 'expenses_review', path: '/rejected-expenses', color: '#2196f3' },
    { text: 'Expenses Report', permission: 'expenses_reports', path: '/expenses-report', color: '#2196f3' },
    { text: 'Payment Pending', permission: 'expenses_review', path: '/payment-pending', color: '#2196f3' },
    { text: 'Expense Paid', permission: 'expenses_review', path: '/expense-paid', color: '#2196f3' },
    { text: 'Manage Categories', permission: 'expenses_manage', path: '/manage-categories', color: '#2196f3' },
    { text: 'Expense Settings', permission: 'expenses_settings', path: '/expense-settings', color: '#2196f3' }
  ],
  accountMenu: [
    { text: 'Profile', permission: 'profile', path: '/profile', color: '#2196f3' },
    { text: 'My Leave', permission: 'my_leaves', path: '/my-leave', color: '#2196f3' },
    { text: 'Team Leave', permission: 'team_leave', path: '/team-leave', color: '#2196f3' },
    { text: 'Leave Settings', permission: 'leave_settings', path: '/leave-settings', color: '#2196f3' }
  ],
  companyMenu: [
    { text: 'Company Profile', permission: 'company_profile', path: '/company-profile', color: '#2196f3' },
    { text: 'Attendance', permission: 'attendance', path: '/attendance', color: '#2196f3' },
    { text: 'Employees', permission: 'employees', path: '/employees', color: '#2196f3' },
    { text: 'Categories', permission: 'categories', path: '/categories', color: '#2196f3' },
    { text: 'Department', permission: 'department', path: '/department', color: '#2196f3' },
    { text: 'Branches', permission: 'branches', path: '/branches', color: '#2196f3' },
    { text: 'Holiday', permission: 'holiday', path: '/holiday', color: '#2196f3' },
    { text: 'Billing', permission: 'billing', path: '/billing', color: '#2196f3' }
  ]
};

// Fetch user permissions from backend
export const fetchUserPermissions = async (): Promise<UserPermissions | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch('http://localhost:5000/api/auth/user-permissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return null;
  }
};

// Generate menu items based on user permissions
export const generateMenuItems = (permissions: string[], userRole?: string) => {
  const hasFullAccess = permissions.includes('*');
  
  // Helper function to filter and map menu items
  const filterAndMapMenuItems = (menuConfigs: MenuItemConfig[]) => {
    return menuConfigs.filter(config => {
      if (hasFullAccess) return true;
      
      // Special handling for expenses menu items - check individual expense permissions
      if (config.permission.startsWith('expenses_')) {
        return permissions.includes(config.permission);
      }
      
      // Special handling for categories menu items (includes manage-categories)
      if (config.permission === 'categories') {
        // If user has categories permission, show both categories and manage-categories
        return permissions.includes('categories');
      }
      
      // Special handling for my_leaves menu items
      if (config.permission === 'my_leaves') {
        // If user has my_leaves permission, show all leave-related menu items
        return permissions.includes('my_leaves');
      }
      
      // Special handling for dashboard - non-admin users see "Dashboard" instead of "Reports"
      if (config.permission === 'dashboard' && userRole !== 'admin') {
        return permissions.includes('dashboard');
      }
      
      // Regular permission check
      return permissions.includes(config.permission);
    }).map(config => {
      // Modify dashboard config for non-admin users
      if (config.permission === 'dashboard' && userRole !== 'admin') {
        return {
          ...config,
          text: 'Dashboard',
          path: '/dashboard'
        };
      }
      return config;
    });
  };

  return {
    mainMenu: filterAndMapMenuItems(MENU_CONFIGURATIONS.mainMenu),
    expensesMenu: filterAndMapMenuItems(MENU_CONFIGURATIONS.expensesMenu),
    accountMenu: filterAndMapMenuItems(MENU_CONFIGURATIONS.accountMenu),
    companyMenu: filterAndMapMenuItems(MENU_CONFIGURATIONS.companyMenu)
  };
};

// Check if user has access to specific route
export const hasRouteAccess = (route: string, permissions: string[]): boolean => {
  if (permissions.includes('*')) return true;
  
  // Find the permission required for this route
  const requiredPermission = Object.entries(MENU_ROUTE_MAPPING)
    .find(([_, path]) => path === route)?.[0];
  
  if (!requiredPermission) return false;
  
  // Special handling for expense-related routes
  if (requiredPermission.startsWith('expenses_')) {
    return permissions.includes(requiredPermission);
  }
  
  return permissions.includes(requiredPermission);
};