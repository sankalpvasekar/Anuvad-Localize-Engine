import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Player from './pages/Player';
import Admin from './pages/Admin';
import Layout from './components/Layout';

import { ProjectProvider } from './context/ProjectContext';

const PlatformLayout = () => (
  <ProjectProvider>
    <Layout>
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </Layout>
  </ProjectProvider>
);

function App() {
  return (
    <Router>
      <div className="app-noise" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Platform Routes (with Sidebar) */}
        <Route element={<PlatformLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/library" element={<Library />} />
          <Route path="/player" element={<Player />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
