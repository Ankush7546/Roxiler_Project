import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import StoreList from './pages/StoreList';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

function Shell({ children }) {
  return (<><Navbar />{children}</>);
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<Home />} />

          <Route path="/stores" element={
            <ProtectedRoute roles={['USER']}><Shell><StoreList /></Shell></ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute roles={['OWNER']}><Shell><OwnerDashboard /></Shell></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><Shell><AdminDashboard /></Shell></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><Shell><Account /></Shell></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
