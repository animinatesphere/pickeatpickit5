import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { decodeJwtToken } from "../services/backendAuthService";
import { clearAdminSession, confirmAdminSession } from "../services/api";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const confirmSession = async () => {
      try {
        if (localStorage.getItem("refreshToken")) {
          await confirmAdminSession();
        }
      } catch {
        // A network failure may still leave a valid access token to use.
      }

      const token = localStorage.getItem("authToken");
      const payload = token ? decodeJwtToken(token) : null;
      const expired = Boolean(payload?.exp && payload.exp * 1000 <= Date.now());
      const valid = Boolean(token && (payload?.role === "admin" || payload?.admin_role) && !expired);

      if (!valid) clearAdminSession();
      if (active) {
        setAuthorized(valid);
        setChecking(false);
      }
    };

    confirmSession();
    return () => { active = false; };
  }, []);

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>;
  }

  if (!authorized) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
}
