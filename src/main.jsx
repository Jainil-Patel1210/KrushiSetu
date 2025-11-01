import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Homepage from '../src/Components/HomePage/Homepage.jsx';
import Authentication from './Components/Signup_And_Login/Authentication.jsx';
import Sidebar from './Components/User_Profile/Sidebar.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Authentication />} />
      <Route path="/sidebar" element={<Sidebar />} />
    </>
  )
);


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>
);