import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import FieldsManage from "./pages/FieldsManage";
import AgentDashboard from "./pages/AgentDashboard";
import FieldDetail from "./pages/FieldDetail";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/agent"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/fields" element={
        <ProtectedRoute role="ADMIN"><FieldsManage /></ProtectedRoute>
      } />
      <Route path="/admin/fields/:id" element={
        <ProtectedRoute role="ADMIN"><FieldDetail /></ProtectedRoute>
      } />

      {/* Agent */}
      <Route path="/agent" element={
        <ProtectedRoute role="AGENT"><AgentDashboard /></ProtectedRoute>
      } />
      <Route path="/agent/fields/:id" element={
        <ProtectedRoute role="AGENT"><FieldDetail /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
