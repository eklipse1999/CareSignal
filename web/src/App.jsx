import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CreateClinician from './pages/CreateClinician';
import ManageClinicians from './pages/ManageClinicians';
import Login from './pages/Login';
import PatientDetail from './pages/PatientDetail';
import PatientList from './pages/PatientList';
import AdminRoute from './components/AdminRoute';

export default function App() {
  const { isAuthenticated } = useAuth();
  return <Routes><Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/patients" element={<PatientList />} /><Route path="/patients/:patientId" element={<PatientDetail />} /><Route element={<AdminRoute />}><Route path="/admin/create-clinician" element={<CreateClinician />} /><Route path="/admin/manage-clinicians" element={<ManageClinicians />} /></Route></Route><Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} /></Routes>;
}
