import "./App.css";
import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Authentication from "./auth/Authentication";
import Category from "./Pages/Category";
import Product from "./Pages/Product";
import Order from "./Pages/Order";
import Viewbill from "./Pages/Viewbill";
import User from "./Pages/User";
import ProtectedRoute from "./auth/ProtectedRoute";
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";
import { jwtDecode } from "jwt-decode";

function App() {
  const NotFound = () => {
    return <Navigate to="/" />;
  };

  // const [role, setRole] = useState([]);
  // const token = sessionStorage.getItem("token");
  // const decodedToken = jwtDecode(token);

  // useEffect(() => {
  //   setRole(decodedToken.role);
  // }, [decodedToken.role]);

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route  exact path="/dashboard" element={<ProtectedRoute Component={Dashboard} />} />
        <Route  exact path="/category" element={<ProtectedRoute Component={Category} />} />
        <Route  exact path="/product" element={<ProtectedRoute Component={Product} />} />
        <Route  exact path="/order" element={<ProtectedRoute Component={Order} />} />
        <Route exact path="/bill" element={<ProtectedRoute Component={Viewbill} />} />
        <Route  exact path="/user" element={<ProtectedRoute Component={User} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
