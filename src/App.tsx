import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Radio } from './pages/Radio';
import { Resources } from './pages/Resources';
import { Members } from './pages/Members';
import { Feedback } from './pages/Feedback';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { Dashboard } from './pages/Dashboard';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Notes } from './pages/Notes';
import { DraftSpace } from './pages/DraftSpace';
import { Join } from './pages/Join';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnimatePresence, motion } from 'motion/react';

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
              <Route path="/radio" element={<PageWrapper><Radio /></PageWrapper>} />
              <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
              <Route path="/join" element={<PageWrapper><Join /></PageWrapper>} />
              <Route path="/members" element={<ProtectedRoute><PageWrapper><Members /></PageWrapper></ProtectedRoute>} />
              <Route path="/feedback" element={<PageWrapper><Feedback /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
              <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
              <Route path="/update-password" element={<PageWrapper><UpdatePassword /></PageWrapper>} />
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="founder"><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute requiredRole="founder"><PageWrapper><Notes /></PageWrapper></ProtectedRoute>} />
              <Route path="/draft" element={<ProtectedRoute requiredRole="founder"><PageWrapper><DraftSpace /></PageWrapper></ProtectedRoute>} />
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
