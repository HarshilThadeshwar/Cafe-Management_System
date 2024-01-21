import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import GroupIcon from '@mui/icons-material/Group';
import { Link, useLocation } from "react-router-dom";
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("");
  const [role, setRole] = useState('');
  const token = sessionStorage.getItem("token");
  let decodedToken = jwtDecode(token);

  useEffect(() => {
    setRole(decodedToken.role);
  }, [decodedToken.role]);


  const adminPages = [
    { path: "/dashboard", icon: <DashboardIcon />, text: "Dashboard" },
    { path: "/category", icon: <RestaurantMenuIcon />, text: "Manage Category" },
    { path: "/product", icon: <StorefrontIcon />, text: "Manage Product" },
    { path: "/order", icon: <AddShoppingCartOutlinedIcon />, text: "Manage Order" },
    { path: "/bill", icon: <ReceiptLongOutlinedIcon />, text: "View Bill" },
    { path: "/user", icon: <GroupIcon />, text: "Manage User" },
  ];

  const userPages = [
    { path: "/dashboard", icon: <DashboardIcon />, text: "Dashboard" },
    { path: "/order", icon: <AddShoppingCartOutlinedIcon />, text: "Manage Order" },
    { path: "/bill", icon: <ReceiptLongOutlinedIcon />, text: "View Bill" },
  ];

  const pagesToShow = role === 'admin' ? adminPages : userPages;

  const handleButtonClick = (page) => {
    setActivePage(page);
  };

  return (
    <React.Fragment>
      {pagesToShow.map((page, index) => (
        <ListItemButton
          key={index}
          component={Link}
          to={page.path}
          onClick={() => handleButtonClick(page.text.toLowerCase())}
          className={location.pathname === page.path ? "active" : ""}
          id='btn1'
        >
          <ListItemIcon>
            {React.cloneElement(page.icon, {
              className: location.pathname === page.path ? "active" : "",
              id: 'btn1'
            })}
          </ListItemIcon>
          <ListItemText primary={page.text} />
        </ListItemButton>
      ))}
    </React.Fragment>
  );
};

export default Sidebar;
