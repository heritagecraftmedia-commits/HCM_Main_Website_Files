import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Resources } from './pages/Resources';
import { Members } from './pages/Members';
import { Feedback } from './pages/Feedback';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { DashboardRouter } from './pages/DashboardRouter';
import { FounderDashboard } from './pages/FounderDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Notes } from './pages/Notes';
import { DraftSpace } from './pages/DraftSpace';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnimatePresence, motion } from 'motion/react';
import Academy from './pages/Academy';
import Services from './pages/Services';
import FreeResources from './pages/FreeResources';
import GetStarted from './pages/GetStarted';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/academy" element={<PageWrapper><Academy /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
              <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
              <Route path="/free-resources" element={<PageWrapper><FreeResources /></PageWrapper>} />
              <Route path="/get-started" element={<PageWrapper><GetStarted /></PageWrapper>} />
              <Route path="/members" element={<ProtectedRoute><PageWrapper><Members /></PageWrapper></ProtectedRoute>} />
              <Route path="/feedback" element={<PageWrapper><Feedback /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
              <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
              <Route path="/update-password" element={<PageWrapper><UpdatePassword /></PageWrapper>} />
              <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><DashboardRouter /></PageWrapper></ProtectedRoute>} />
              <Route path="/founder-dashboard" element={<ProtectedRoute allowedRoles={['founder', 'admin']}><PageWrapper><FounderDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/staffdashboard" element={<ProtectedRoute allowedRoles={['founder', 'admin', 'staff']}><PageWrapper><StaffDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/studentdashboard" element={<ProtectedRoute allowedRoles={['founder', 'admin', 'staff', 'student', 'client']}><PageWrapper><StudentDashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute allowedRoles={['founder', 'admin']}><PageWrapper><Notes /></PageWrapper></ProtectedRoute>} />
              <Route path="/draft" element={<ProtectedRoute allowedRoles={['founder', 'admin']}><PageWrapper><DraftSpace /></PageWrapper></ProtectedRoute>} />
              <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
