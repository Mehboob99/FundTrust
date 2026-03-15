import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast  from './components/Toast'
import Home         from './pages/Home'
import Projects     from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Transparency from './pages/Transparency'
import About        from './pages/About'
import Contact      from './pages/Contact'
import Login        from './pages/Login'
import Register     from './pages/Register'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard   from './pages/NgoDashboard'
import AddProject     from './pages/AddProject'
import ManageProjects from './pages/ManageProjects'
import UploadProof    from './pages/UploadProof'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Toast />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/projects"     element={<Projects />} />
          <Route path="/project/:id"  element={<ProjectDetail />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/about"        element={<About />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/donor/dashboard" element={<ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>} />
          <Route path="/ngo/dashboard"   element={<ProtectedRoute role="ngo"><NgoDashboard /></ProtectedRoute>} />
          <Route path="/ngo/add-project" element={<ProtectedRoute role="ngo"><AddProject /></ProtectedRoute>} />
          <Route path="/ngo/edit-project/:id" element={<ProtectedRoute role="ngo"><AddProject /></ProtectedRoute>} />
          <Route path="/ngo/manage-projects"  element={<ProtectedRoute role="ngo"><ManageProjects /></ProtectedRoute>} />
          <Route path="/ngo/upload-proof/:id" element={<ProtectedRoute role="ngo"><UploadProof /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
