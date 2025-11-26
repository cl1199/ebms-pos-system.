import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function SupervisorRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "SUPERVISOR" && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}