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
import Subsidy_List from "./Components/User_Profile/Subsidy_List.jsx";
import LearnMore from "./Components/HomePage/LearnMore.jsx";
import NewsDetail from "./Components/HomePage/NewsDetail.jsx";
import api from "./Components/Signup_And_Login/api.js";

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
        <Route path="/apply/:id" element={<ApplySubsidy />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/officer_sidebar" element={<Officer_Sidebar />} />
        <Route path="/sub" element={<Subsidy_Provider_Sidebar />} />
        <Route path="/change-password" element={<ChangePassword />} />
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
