import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Meetings from './pages/Meetings';
import Team from './pages/Team';
import Profile from './pages/Profile';
import './App.css';
import './styles/greeva-theme.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login route - no layout wrapper */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - wrapped with standard layout */}
          <Route path="/*" element={
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Projects />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/team" element={<Team />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Expense routes */}
              <Route path="/expenses" element={<Projects />} />
              <Route path="/expenses/new" element={<Projects />} />
              <Route path="/review-expenses" element={<Projects />} />
              <Route path="/expenses-report" element={<Projects />} />
              
              {/* Company routes */}
              <Route path="/employees" element={<Projects />} />
              <Route path="/company-profile" element={<Projects />} />
              <Route path="/attendance" element={<Projects />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;