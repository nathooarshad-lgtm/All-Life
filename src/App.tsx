import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import Hydration from './pages/Hydration';
import Fitness from './pages/Fitness';
import BodyStats from './pages/BodyStats';
import Sleep from './pages/Sleep';
import Mood from './pages/Mood';
import Tasks from './pages/Tasks';
import Coach from './pages/Coach';
import Settings from './pages/Settings';
import About from './pages/About';

function AppRoutes() {
  const { state } = useApp();
  const hasProfile = Boolean(state.profile);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={hasProfile ? '/dashboard' : '/welcome'} replace />} />
        <Route path="/welcome" element={hasProfile ? <Navigate to="/dashboard" replace /> : <Setup />} />
        <Route path="/setup" element={<Navigate to="/welcome" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/hydration" element={<Hydration />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/bodystats" element={<BodyStats />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router basename="/All-Life/">
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
