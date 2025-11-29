import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RateReview from "./Components/User_Profile/RateReview.jsx";

import Homepage from "../src/Components/HomePage/Homepage.jsx";
import Authentication from "./Components/Signup_And_Login/Authentication.jsx";
import Sidebar from "./Components/User_Profile/Sidebar.jsx";
import ApplySubsidy from "./Components/User_Profile/ApplySubsidy.jsx";
import Officer_Sidebar from "./Components/Officer_profile/Officer_Sidebar.jsx";
import Subsidy_Provider_Sidebar from "./Components/Subsidy_Provider/Subsidy_Provider_Sidebar.jsx";
import ChangePassword from "./Components/User_Profile/ChangePassword.jsx";
import LearnMore from "./Components/HomePage/LearnMore.jsx";
import NewsDetail from "./Components/HomePage/NewsDetail.jsx";
import Subsidy_List from "./Components/User_Profile/Subsidy_List.jsx";
import ProtectedRoute from "./Components/HomePage/ProtectedRoute.js";
import ViewDetails from "./Components/User_Profile/ViewDetails.jsx";
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
        <Route path="/apply/:id" element={
          <ProtectedRoute><ApplySubsidy /></ProtectedRoute>} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/officer_sidebar" element={<Officer_Sidebar />} />
        <Route path="/sub" element={<Subsidy_Provider_Sidebar />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/subsidy-list" element={<Subsidy_List />} />
        <Route path="/viewdetails/:id" element={<ViewDetails />} />
        <Route path="/rate-review/:id" element={<RateReview />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <AppWrapper />
);