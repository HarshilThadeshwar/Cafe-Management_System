import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import { jwtDecode } from "jwt-decode";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const defaultTheme = createTheme();


const Dashboard = () => {
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    sessionStorage.clear();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const [dashboard, setDashboard] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogopen, setDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");


  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [oldPassword, newPassword, confirmPassword]);

  const getDetails = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return false;

      const response = await axios.get(
        "http://localhost:8080/dashboard/details",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDashboard(response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const token = sessionStorage.getItem("token");
  let decodedToken = jwtDecode(token);

  useEffect(() => {
    setEmail(decodedToken.email);
    setRole(decodedToken.role);
  }, [decodedToken.email, decodedToken.role]);

  const ViewCategory = () => {
    if (role === "admin") {
      navigate("/category");
    } else {
      navigate("/dashboard");
      setSnackbarSeverity("warning");
      setSnackbarMessage("You are not authorized person to access this page ");
      setSnackbarOpen(true);
    }
  };

  const ViewProduct = () => {
    if (role === "admin") {
      navigate("/product");
    } else {
      navigate("/dashboard");
      setSnackbarSeverity("warning");
      setSnackbarMessage("You are not authorized person to access this page ");
      setSnackbarOpen(true);
    }
  };

  const ViewBill = () => {
    navigate("/bill");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (newPassword !== confirmPassword) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Incorrect Confirm Password!");
        setSnackbarOpen(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setDialogOpen(false);
      } else {
        axios
          .post(
            "http://localhost:8080/user/changePassword",
            {
              oldPassword,
              newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => {
            if (response.status === 200) {
              setSnackbarSeverity("success");
              setSnackbarMessage(response.data.message);
              setSnackbarOpen(true);
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setDialogOpen(false);
              setAnchorEl(null);
            }
          })
          .catch((error) => {
            if (error.response) {
              let message = "Something went wrong. Please try again later";
              if (error.response.data && error.response.data.message) {
                message = error.response.data.message;
              }
              setSnackbarSeverity("error");
              setSnackbarMessage(message);
              setSnackbarOpen(true);
            }
          })
          .finally(() => {
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setDialogOpen(false);
            setAnchorEl(null);
          });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <React.Fragment>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px",
                backgroundColor: "#8bc34a",
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{
                  flexGrow: 1,
                  fontSize: "1.7rem",
                  fontFamily: "fantasy",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LocalCafeIcon sx={{ marginRight: "0.5rem" }} />
                Cafe Dashboard
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountCircleIcon
                  sx={{
                    marginRight: "5px",
                    fontSize: "35px",
                    cursor: "pointer",
                  }}
                  onClick={handleMenuOpen}
                />
                <div>
                  <Typography
                    sx={{
                      fontFamily: "sans-serif",
                      fontSize: "1rem",
                      marginRight: "1.4rem",
                      color: "black",
                      textDecoration: "underline",
                    }}
                  >
                    {email}
                  </Typography>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontFamily: "fantasy",
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                      onClick={handleClickOpen}
                    >
                      <PasswordOutlinedIcon sx={{ fontSize: "20px" }} />
                      <Typography>Change Password</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={handleMenuClose}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontFamily: "fantasy",
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                    >
                      <SettingsIcon sx={{ fontSize: "20px" }} />
                      <Typography>Settings</Typography>
                    </MenuItem>
                  </Menu>
                </div>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#c9d6ff",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "#c9d6ff",
                    },
                    fontFamily: "fantasy",
                  }}
                  onClick={handleLogout}
                  startIcon={<ExitToAppIcon />}
                >
                  Logout
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              <Sidebar />
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Box
              sx={{
                marginTop: "5rem",
                marginLeft: "17rem",
                display: "flex",
                flexDirection: "row",
                gap: "5rem",
              }}
            >
              <Card
                sx={{
                  width: "300px",
                  height: "250px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                  },
                }}
                variant="outlined"
              >
                <CardContent sx={{ flex: "1", textAlign: "center" }}>
                  <RestaurantMenuIcon
                    sx={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#8bc34a",
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontFamily: "unset" }}
                  >
                    Total Category:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "30px",
                      marginTop: "20px",
                      fontFamily: "unset",
                    }}
                  >
                    {dashboard.category}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ backgroundColor: "#8bc34a" }}
                    onClick={() => ViewCategory()}
                  >
                    View Category
                  </Button>
                </CardActions>
              </Card>

              <Card
                sx={{
                  width: "300px",
                  height: "250px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                  },
                }}
                variant="outlined"
              >
                <CardContent sx={{ flex: "1", textAlign: "center" }}>
                  <StorefrontIcon
                    sx={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#8bc34a",
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontFamily: "unset" }}
                  >
                    Total Product:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "30px",
                      marginTop: "20px",
                      fontFamily: "unset",
                    }}
                  >
                    {dashboard.product}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ backgroundColor: "#8bc34a" }}
                    onClick={() => ViewProduct()}
                  >
                    View Product
                  </Button>
                </CardActions>
              </Card>

              <Card
                sx={{
                  width: "300px",
                  height: "250px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                  },
                }}
                variant="outlined"
              >
                <CardContent sx={{ flex: "1", textAlign: "center" }}>
                  <ReceiptLongOutlinedIcon
                    sx={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#8bc34a",
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontFamily: "unset" }}
                  >
                    Total Bill:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "30px",
                      marginTop: "20px",
                      fontFamily: "unset",
                    }}
                  >
                    {dashboard.bill}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ backgroundColor: "#8bc34a" }}
                    onClick={() => ViewBill()}
                  >
                    View Bill
                  </Button>
                </CardActions>
              </Card>
            </Box>

            <Dialog open={dialogopen} onClose={handleClose}>
              <DialogTitle
                style={{
                  textAlign: "center",
                  backgroundColor: "#8bc34a",
                  marginBottom: "2rem",
                  color: "#fff",
                }}
              >
                Change Password
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  id="oldPassword"
                  label="Old Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField
                  margin="dense"
                  id="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  margin="dense"
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="contained">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={isDisabled}
                  onClick={(e) => handleChangePassword(e)}
                  color="success"
                >
                  Change
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default Dashboard;
