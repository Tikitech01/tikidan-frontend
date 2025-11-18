import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Reports />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/clients" element={<Clients />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
