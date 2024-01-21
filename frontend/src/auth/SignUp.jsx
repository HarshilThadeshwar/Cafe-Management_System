import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import KeyIcon from "@mui/icons-material/Key";
import InputGroup from "react-bootstrap/InputGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";
import checkToken from "./checkToken";


const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contactnumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isDisabled, setIsDisabled] = useState(true);

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
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhoneNumber = /^\d{10,13}$/.test(contactnumber);
    if (
      name === "" ||
      contactnumber === "" ||
      email === "" ||
      password === "" ||
      !isValidEmail ||
      !isValidPhoneNumber
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [name, contactnumber, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isValidPhoneNumber = /^\d{10}$/.test(contactnumber);

      if (!isValidEmail) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Invalid email format");
        setSnackbarOpen(true)
        return;
      }

      if (!isValidPhoneNumber) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Max length is 13 numbers");
        setSnackbarOpen(true)
        return;

      } else {
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
              setTimeout(() => navigate('/'),2000);
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
      }
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
      height: "700px",
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
      marginTop: "3rem",
    },
    disabledButton: {
      width: "100%",
      backgroundColor: "gray",
      border: "none",
      color: "#fff",
      padding: "10px 20px",
      fontSize: "18px",
      borderRadius: "8px",
      marginTop: "3rem",
      cursor: "not-allowed",
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
      <Form onSubmit={(e) => handleSubmit(e)} style={styles.form}>
        <h2 style={{ color: "green", fontWeight: "bold" }}>CafeZone.</h2>
        <p
          style={{
            color: "#3d4152",
            fontWeight: "600",
            fontSize: "17px",
            fontFamily: "Poppins, sans-serif",
            letterSpacing: "1px",
          }}
        >
          Sign up your account
        </p>
        <Col md={6} style={{ width: "100%" }}>
          <Form.Group
            controlId="validationCustomUsername"
            style={{ marginTop: "2rem" }}
          >
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend" style={styles.inputGroup}>
                <PersonIcon />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="username"
                required
                aria-describedby="inputGroupPrepend"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group
            controlId="validationCustomContactNumber"
            style={{ marginTop: "3rem" }}
          >
            <InputGroup>
              <InputGroup.Text id="inputGroupPrepend" style={styles.inputGroup}>
                <LocalPhoneIcon />
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="contact number"
                required
                style={styles.input}
                value={contactnumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6} style={{ width: "100%" }}>
          <Form.Group
            controlId="validationCustomE-mail"
            style={{ marginTop: "3rem" }}
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
            </InputGroup>
          </Form.Group>
          <Form.Group
            controlId="validationCustomPassword"
            style={{ marginTop: "3rem" }}
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
            </InputGroup>
          </Form.Group>
        </Col>
        <Button
          type="submit"
          style={isDisabled ? styles.disabledButton : styles.button}
          disabled={isDisabled}
        >
          Sign Up
        </Button>
        <Form.Text
          style={{
            fontSize: "17px",
            color: "#777777",
            fontWeight: "500",
            lineHeight: "3rem",
          }}
        >
          Already have an account?{" "}
          <Link to="/" style={{ color: "#319751", textDecoration: 'none' }}>
            Sign in
          </Link>
        </Form.Text>
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

export default SignUp;
