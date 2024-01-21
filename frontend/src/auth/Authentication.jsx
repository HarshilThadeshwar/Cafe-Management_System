import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";
import "./Authentication.css";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import checkToken from "./checkToken";

const Authentication = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contactnumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginemail, setLoginEmail] = useState("");
  const [loginpassword, setLoginPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [open, setOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); 

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForgotPasswordEmail("")
  };
 
  useEffect(() => {
    const verifyToken = async () => {
      const isValidToken = await checkToken();
      if (isValidToken) {
        navigate("/dashboard"); // Redirect to dashboard if token is present
      }
    };

    verifyToken();
  }, [navigate])

  const toggleView = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (
      name === "" ||
      contactnumber === "" ||
      email === "" ||
      password === "" ||
      loginemail === "" ||
      loginpassword === "" ||
      forgotPasswordEmail === ""
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [name, contactnumber, email, password, loginemail, loginpassword, forgotPasswordEmail]);

  const forgotPassword = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:8080/user/forgotPassword`, { forgotPasswordEmail })
      .then((response) => {
        if (response.status === 200) {
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data.message);
          console.log(response.data)
          setOpen(false)
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
        setOpen(false);
        setForgotPasswordEmail(""); 
        setSnackbarOpen(true);
      });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/user/signup", {
        name,
        email,
        contactnumber,
        password,
      })
      .then((response) => {
        if (response.status === 200) {
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data.message);
        }
      })
      .catch((error) => {
        if (error.response) {
          setSnackbarSeverity("error");
          setSnackbarMessage(error.response.data.message);
        }
      })
      .finally(() => {
        setSnackbarOpen(true);
        setName("");
        setContactNumber("");
        setEmail("");
        setPassword("");
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8080/user/login", { loginemail, loginpassword })
      .then((response) => {
        if (response.status === 200) {
          const token = response.data.token;
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data.message);
          setTimeout(() => navigate("/dashboard"), 2000);
          sessionStorage.setItem("token", token);
          setSnackbarOpen(true);
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
        setLoginEmail("");
        setLoginPassword("");
      });
};

  return ( 
  <React.Fragment>
    <div className="body">
      <div id="container" className={`container ${isLogin ? "" : "active"}`}>
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registeration</span>
            <input
              type="text"
              placeholder="Name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              placeholder="ContactNumber"
              value={contactnumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button  disabled={isDisabled}>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email password</span>
            <input
              type="email"
              placeholder="Email"
              autoFocus
              autoComplete="off"
              value={loginemail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="off"
              value={loginpassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <a href="#" onClick={handleClickOpen} style={{color: "red"}}>
              Forget Your Password?
            </a>
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{color: 'red'}}>
                  Please enter your email address here. We will send email address and password for Login.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="standard"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="contained">Cancel</Button>
                <Button onClick={forgotPassword} variant="contained" disabled={isDisabled}>Submit</Button>
              </DialogActions>
            </Dialog>
            <button>Sign In</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div
              className={`toggle-panel toggle-left ${isLogin ? "active" : ""}`}
            >
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login" onClick={toggleView}>
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>
                Register with your personal details to use all of site features
              </p>
              <button className="hidden" id="register" onClick={toggleView}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
    </div>
    </React.Fragment>
  );
};

export default Authentication;
