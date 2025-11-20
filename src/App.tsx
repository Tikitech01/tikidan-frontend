import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerticalLayout from './components/layout/VerticalLayout';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Meetings from './pages/Meetings';
import PlaceholderPage from './pages/PlaceholderPage';
import { hasRouteAccess, fetchUserPermissions } from './services/permissionService';
import './App.css';

// Protected Route Component - Checks both authentication and permissions
const ProtectedRoute = ({ children, requiredPermission, redirectTo = '/reports' }: { 
  children: React.ReactNode; 
  requiredPermission?: string;
  redirectTo?: string;
}) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If permission is required, check user permissions
  if (requiredPermission && userData) {
    const user = JSON.parse(userData);
    const userPermissions = user.permissions || [];
    
    // Super admin with full access
    if (userPermissions.includes('*')) {
      return <>{children}</>;
    }
    
    // Check specific permission
    if (!userPermissions.includes(requiredPermission)) {
      console.log(`Access denied for permission: ${requiredPermission}`);
      return <Navigate to={redirectTo} replace />;
    }
  }
  
  return <>{children}</>;
};

// Route-specific permission checker
const PermissionRoute = ({ 
  element, 
  requiredPermission, 
  fallbackRoute = '/reports' 
}: { 
  element: React.ReactNode; 
  requiredPermission: string;
  fallbackRoute?: string;
}) => {
  return (
    <ProtectedRoute requiredPermission={requiredPermission} redirectTo={fallbackRoute}>
      {element}
    </ProtectedRoute>
  );
};

// Reports/Dashboard Route Component - Handles role-based routing
const ReportsRoute = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    // Non-admin users should be redirected to dashboard
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <Reports />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes - All route protection is handled by backend middleware */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <VerticalLayout>
                <Routes>
                  {/* Main Menu - Role-based routing */}
                  <Route path="/reports" element={<ReportsRoute />} />
                  <Route path="/dashboard" element={<Reports />} />
                  
                  {/* Main Menu Routes with Permissions */}
                  <Route 
                    path="/team" 
                    element={
                      <PermissionRoute 
                        element={<Team />} 
                        requiredPermission="team" 
                      />
                    } 
                  />
                  <Route 
                    path="/projects" 
                    element={
                      <PermissionRoute 
                        element={<Projects />} 
                        requiredPermission="projects" 
                      />
                    } 
                  />
                  <Route 
                    path="/clients" 
                    element={
                      <PermissionRoute 
                        element={<Clients />} 
                        requiredPermission="clients" 
                      />
                    } 
                  />
                  <Route 
                    path="/meetings" 
                    element={
                      <PermissionRoute 
                        element={<Meetings />} 
                        requiredPermission="meetings" 
                      />
                    } 
                  />
                  
                  {/* Expenses Menu Routes with Permissions */}
                  <Route 
                    path="/expenses" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_view" 
                      />
                    } 
                  />
                  <Route 
                    path="/review-expenses" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_review" 
                      />
                    } 
                  />
                  <Route 
                    path="/approved-expenses" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_review" 
                      />
                    } 
                  />
                  <Route 
                    path="/rejected-expenses" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_review" 
                      />
                    } 
                  />
                  <Route 
                    path="/expenses-report" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_reports" 
                      />
                    } 
                  />
                  <Route 
                    path="/payment-pending" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_review" 
                      />
                    } 
                  />
                  <Route 
                    path="/expense-paid" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_review" 
                      />
                    } 
                  />
                  <Route 
                    path="/manage-categories" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_manage" 
                      />
                    } 
                  />
                  <Route 
                    path="/expense-settings" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="expenses_settings" 
                      />
                    } 
                  />
                  
                  {/* Company Menu Routes with Permissions */}
                  <Route 
                    path="/attendance" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="attendance" 
                      />
                    } 
                  />
                  <Route 
                    path="/employees" 
                    element={
                      <PermissionRoute 
                        element={<Employees />} 
                        requiredPermission="employees" 
                      />
                    } 
                  />
                  <Route 
                    path="/categories" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="categories" 
                      />
                    } 
                  />
                  <Route 
                    path="/department" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="department" 
                      />
                    } 
                  />
                  <Route 
                    path="/branches" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="branches" 
                      />
                    } 
                  />
                  <Route 
                    path="/holiday" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="holiday" 
                      />
                    } 
                  />
                  <Route 
                    path="/billing" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="billing" 
                      />
                    } 
                  />
                  <Route 
                    path="/company-profile" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="company_profile" 
                      />
                    } 
                  />
                  
                  {/* My Account Menu Routes with Permissions */}
                  <Route 
                    path="/profile" 
                    element={
                      <PermissionRoute 
                        element={<Profile />} 
                        requiredPermission="profile" 
                      />
                    } 
                  />
                  <Route 
                    path="/my-leave" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="my_leaves" 
                      />
                    } 
                  />
                  <Route 
                    path="/team-leave" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="team_leave" 
                      />
                    } 
                  />
                  <Route 
                    path="/leave-settings" 
                    element={
                      <PermissionRoute 
                        element={<PlaceholderPage />} 
                        requiredPermission="leave_settings" 
                      />
                    } 
                  />
                  
                  {/* Catch all - redirect to reports */}
                  <Route path="*" element={<Navigate to="/reports" replace />} />
                </Routes>
              </VerticalLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
