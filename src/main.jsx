import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Homepage from '../src/Components/HomePage/Homepage.jsx';
import Signup from '../src/Components/Signup_And_Login/Signup.jsx';
import Sidebar from './Components/User_Profile/Sidebar.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Signup />} />
      <Route path="/sidebar" element={<Sidebar />} />
    </>
  )
);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);