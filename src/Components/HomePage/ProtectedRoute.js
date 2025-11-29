import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../Signup_And_Login/api.js";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      // Quick local check first
      const token = localStorage.getItem('access');
      if (token) {
        if (!mounted) return;
        setAuthed(true);
        setChecking(false);
        return;
      }

      try {
        await api.post('/token/refresh/');
        if (!mounted) return;
        setAuthed(true);
      } catch (err) {
        if (!mounted) return;
        setAuthed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    verify();

    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    if (!checking && !authed) {
      navigate('/login', { state: { redirectTo: window.location.pathname } });
    }
  }, [checking, authed, navigate]);

  if (checking) return null;

  return authed ? children : null;
}

export default ProtectedRoute;