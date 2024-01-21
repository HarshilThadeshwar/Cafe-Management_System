import React, { useState, useEffect } from "react";
import { useNavigate, Link} from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import TextField from "@mui/material/TextField";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import InputGroup from "react-bootstrap/InputGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";
import checkToken from "./checkToken";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

const Login = () => {
  const navigate = useNavigate();

  const [validated, setValidated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isDisabled, setIsDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [marginTop, setMarginTop] = useState("3rem");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForgotPasswordEmail("");
  };

  useEffect(() => {
    const verifyToken = async () => {
      const isValidToken = await checkToken();
      if (isValidToken) {
        navigate("/dashboard");
      }
    };

    verifyToken();
  }, [navigate]);

  useEffect(() => {
    if (forgotPasswordEmail === "") {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [forgotPasswordEmail]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (email === "" || password === "") {
        setValidated(true);
        setMarginTop("2rem");
      } else {
        axios
          .post("http://localhost:8080/user/login", {
            email,
            password,
          })
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
            setEmail("");
            setPassword("");
            setValidated(false);
          });
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const forgotPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`http://localhost:8080/user/forgotPassword`, {
        forgotPasswordEmail,
      })
      .then((response) => {
        if (response.status === 200) {
          setSnackbarSeverity("success");
          setSnackbarMessage(response.data.message);
          setOpen(false);
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
        setLoading(false);
        setOpen(false);
        setForgotPasswordEmail("");
        setSnackbarOpen(true);
      });
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background:
        "linear-gradient(to right, rgb(219 253 178 / 70%), rgb(183 241 186 / 70%))",
      fontFamily: "Poppins, sans-serif",
    },
    form: {
      background: "#fff",
      borderRadius: "10px",
      padding: "20px",
      width: "700px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1px",
      height: "500px",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    input: {
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      fontSize: "1rem",
      padding: "0.7rem",
      borderRadius: "0 7px 7px 0",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      backgroundColor: "green",
      border: "none",
      color: "#fff",
      padding: "10px 20px",
      fontSize: "18px",
      borderRadius: "8px",
      marginTop: "0.5rem",
    },
    error: {
      marginLeft: "3.3rem",
      fontSize: "15px",
      marginTop: "10px",
    },
    inputGroup: {
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <div style={styles.container}>
      <Form
        onSubmit={handleSubmit}
        style={styles.form}
        noValidate
        validated={validated}
      >
        <h2 style={{ color: "green", fontWeight: "bold" }}>CafeZone.</h2>
        <Form.Text
          style={{
            fontSize: "17px",
            color: "#777777",
            fontWeight: "500",
          }}
        >
          Doesn't have an account yet ?{" "}
          <Link
            to="/signup"
            style={{ color: "#319751", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </Form.Text>
        <Col md={6} style={{ width: "100%" }}>
          <Form.Group
            controlId="validationCustomE-mail"
            style={{ marginTop: marginTop }}
          >
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend" style={styles.inputGroup}>
                <EmailIcon />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="e-mail"
                aria-describedby="inputGroupPrepend"
                required
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" style={styles.error}>
                E-mail is required
              </Form.Control.Feedback>
              <Form.Control.Feedback style={styles.error}>
                Looks Good!
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group
            controlId="validationCustomPassword"
            style={{ marginTop: marginTop }}
          >
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend" style={styles.inputGroup}>
                <KeyIcon />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="password"
                aria-describedby="inputGroupPrepend"
                required
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" style={styles.error}>
                Password is required
              </Form.Control.Feedback>
              <Form.Control.Feedback style={styles.error}>
                Looks Good!
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
        <p
          style={{
            color: "red",
            fontWeight: "600",
            fontSize: "17px",
            fontFamily: "Poppins, sans-serif",
            letterSpacing: "1px",
            marginTop: "25px",
            cursor: "pointer",
          }}
          onClick={handleClickOpen}
        >
          Forget Your Password?
        </p>
        <Button type="submit" style={styles.button}>
          Log in
        </Button>
        {loading ? (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
            onClick={handleClose}
          >
            <CircularProgress color="secondary" />
          </Backdrop>
        ) : (
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: "red", marginBottom: "1.5rem" }}>
                Please enter your email address here. We will send email address
                and password for Login.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={forgotPassword} disabled={isDisabled}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Form>
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
  );
};

export default Login;
