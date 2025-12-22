import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Signup_And_Login/api";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const access = localStorage.getItem("access");

      if (access) {
        setIsAuth(true);
        setLoading(false);
        return;
      }

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) throw new Error("No refresh token");

        const res = await api.post("/token/refresh/", {
          refresh: refresh,
        });

        localStorage.setItem("access", res.data.access);
        setIsAuth(true);
      } catch (err) {
        localStorage.clear();
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuth) {
      navigate("/login");
    }
  }, [loading, isAuth, navigate]);

  if (loading) return null;

  return isAuth ? children : null;
}

export default ProtectedRoute;
