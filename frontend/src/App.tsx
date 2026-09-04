import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import Interventions from './pages/Interventions';
import Attendance from './pages/Attendance';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Faculty from './pages/Faculty';
import Settings from './pages/Settings';
function ProtectedApp({ children }: { children: React.ReactNode }) { return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>; }
export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/" element={<ProtectedApp><Dashboard/></ProtectedApp>}/><Route path="/students" element={<ProtectedApp><Students/></ProtectedApp>}/><Route path="/students/:id" element={<ProtectedApp><StudentProfile/></ProtectedApp>}/><Route path="/attendance" element={<ProtectedApp><Attendance/></ProtectedApp>}/><Route path="/assessments" element={<ProtectedApp><Assessments/></ProtectedApp>}/><Route path="/risk" element={<ProtectedApp><RiskAnalysisPage/></ProtectedApp>}/><Route path="/interventions" element={<ProtectedApp><Interventions/></ProtectedApp>}/><Route path="/analytics" element={<ProtectedApp><Analytics/></ProtectedApp>}/><Route path="/alerts" element={<ProtectedApp><Alerts/></ProtectedApp>}/><Route path="/faculty" element={<ProtectedApp><Faculty/></ProtectedApp>}/><Route path="/settings" element={<ProtectedApp><Settings/></ProtectedApp>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
