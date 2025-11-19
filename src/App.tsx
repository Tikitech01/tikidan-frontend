import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Meetings from './pages/Meetings';
import PlaceholderPage from './pages/PlaceholderPage';
import './App.css';

// Protected Route Component - Only checks for authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
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
              <Layout>
                <Routes>
                  {/* Main Menu */}
                  <Route path="/reports" element={<ReportsRoute />} />
                  <Route path="/dashboard" element={<Reports />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/meetings" element={<Meetings />} />
                  
                  {/* Expenses Menu - All protected by backend middleware */}
                  <Route path="/expenses" element={<PlaceholderPage />} />
                  <Route path="/review-expenses" element={<PlaceholderPage />} />
                  <Route path="/approved-expenses" element={<PlaceholderPage />} />
                  <Route path="/rejected-expenses" element={<PlaceholderPage />} />
                  <Route path="/expenses-report" element={<PlaceholderPage />} />
                  <Route path="/payment-pending" element={<PlaceholderPage />} />
                  <Route path="/expense-paid" element={<PlaceholderPage />} />
                  <Route path="/manage-categories" element={<PlaceholderPage />} />
                  <Route path="/expense-settings" element={<PlaceholderPage />} />
                  
                  {/* Company Menu */}
                  <Route path="/attendance" element={<PlaceholderPage />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/categories" element={<PlaceholderPage />} />
                  <Route path="/department" element={<PlaceholderPage />} />
                  <Route path="/branches" element={<PlaceholderPage />} />
                  <Route path="/holiday" element={<PlaceholderPage />} />
                  <Route path="/billing" element={<PlaceholderPage />} />
                  <Route path="/company-profile" element={<PlaceholderPage />} />
                  
                  {/* My Account Menu */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-leave" element={<PlaceholderPage />} />
                  <Route path="/team-leave" element={<PlaceholderPage />} />
                  <Route path="/leave-settings" element={<PlaceholderPage />} />
                  
                  {/* Catch all - redirect to reports */}
                  <Route path="*" element={<Navigate to="/reports" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
