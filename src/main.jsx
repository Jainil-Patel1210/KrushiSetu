import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Homepage from "../src/Components/HomePage/Homepage.jsx";
import Authentication from "./Components/Signup_And_Login/Authentication.jsx";
import Sidebar from "./Components/User_Profile/Sidebar.jsx";
import ApplySubsidy from "./Components/User_Profile/ApplySubsidy.jsx";
import Officer_Sidebar from "./Components/Officer_profile/Officer_Sidebar.jsx";
import Subsidy_Provider_Sidebar from "./Components/Subsidy_Provider/Subsidy_Provider_Sidebar.jsx";
import ChangePassword from "./Components/User_Profile/ChangePassword.jsx";
import LearnMore from "./Components/HomePage/LearnMore.jsx";
import NewsDetail from "./Components/HomePage/NewsDetail.jsx";
import api from "./Components/Signup_And_Login/api.js";
import Subsidy_List from "./Components/User_Profile/Subsidy_List.jsx";
import ProtectedRoute from "./Components/HomePage/ProtectedRoute.js";

function AppWrapper() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await api.post("/token/refresh/");
        console.log("🔄 Token refreshed silently");
      } catch (err) {
        console.warn("⚠️ Token refresh failed or session expired");
      }
    }, 4 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Homepage />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/apply/:id" element={
          <ProtectedRoute><ApplySubsidy /></ProtectedRoute>} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/sidebar" element={
          <ProtectedRoute><Sidebar /></ProtectedRoute>} />
        <Route path="/officer_sidebar" element={
          <ProtectedRoute><Officer_Sidebar /></ProtectedRoute>} />
        <Route path="/sub" element={
          <ProtectedRoute><Subsidy_Provider_Sidebar /></ProtectedRoute>} />
        <Route path="/change-password" element={
          <ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/subsidy-list" element={
          <ProtectedRoute><Subsidy_List /></ProtectedRoute>} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AppWrapper />
  // </StrictMode>
);