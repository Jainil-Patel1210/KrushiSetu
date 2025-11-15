import React,{useEffect} from "react";
import { useNavigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = false;
    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login');
        }
    },[]);

    return (
        children
    )
}

export default ProtectedRoute;