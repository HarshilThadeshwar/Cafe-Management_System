import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import checkToken from "./checkToken";

const ProtectedRoute = (props) => {
  const navigate = useNavigate();
  const { Component } = props;
  const [loading, setLoading] = useState(true);
   
  useEffect(() => {
    const verifyToken = async () => {
      const isValidToken = await checkToken();
      if (!isValidToken) {
        navigate('/');
      }
      setLoading(false);
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return <Component />;
};

export default ProtectedRoute;
