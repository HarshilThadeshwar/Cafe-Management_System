import React, { useEffect, useState } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Toolbar,
  List,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Slide,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TablePagination from "@mui/material/TablePagination";
import FormControl from "@mui/material/FormControl";
import Sidebar from "../components/Sidebar";
import axios from "axios";

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Order = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactnumber, setContactNumber] = useState("");
  const [paymentmethod, setPaymentMethod] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productname, setProductName] = useState("");
  const [bill, setBill] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [totalAmount, setTotalAmount] = useState(0);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const resetProductDetails = () => {
    setSelectedProduct("");
    setPrice("");
    setQuantity("");
  };

  useEffect(() => {
    if (
      name === "" ||
      email === "" ||
      contactnumber === "" ||
      paymentmethod === "" ||
      selectedProduct === "" ||
      selectedCategory === "" ||
      price === "" ||
      quantity === ""
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [
    name,
    email,
    selectedProduct,
    paymentmethod,
    contactnumber,
    selectedCategory,
    price,
    quantity,
  ]);

  const token = sessionStorage.getItem("token");
  const getCategory = async () => {
    try {
      if (!token) return false;
      const response = await axios.get("http://localhost:8080/category/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setCategory(data);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };
  useEffect(() => {
    getCategory();
    resetProductDetails();
  }, []);

  const handleCategoryChange = async (event) => {
    try {
      const selectedCategoryId = event.target.value;
      setSelectedCategory(selectedCategoryId);
      if (!token) return false;
      const response = await axios.get(
        `http://localhost:8080/product/getByCategory/${selectedCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        setProduct(data);
      } else {
        setProduct([]);
      }
      resetProductDetails();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.response.data.message);
        setSnackbarOpen(true);
      }
      setProduct([]);
      return false;
    }
  };

  const GetProductById = async (event) => {
    try {
      const selectedProductId = event.target.value;
      setSelectedProduct(selectedProductId);
      if (!token) return false;
      const response = await axios.get(
        `http://localhost:8080/product/getById/${selectedProductId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setPrice(data.price);
      setQuantity(1);
      setProductName(data.name);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.response.data.message);
        setSnackbarOpen(true);
      }
      setProduct([]);
      return false;
    }
  };



  const getCategoryName = (categoryId) => {
    const selectedCategory = category.find((c) => c.id === categoryId);
    return selectedCategory ? selectedCategory.name : "";
  };

  const handleAddToBill = () => {
    const CategoryName = getCategoryName(selectedCategory);

    const isDuplicate = bill.some((item) => item.productid === selectedProduct);

    if (isDuplicate) {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Product already added to the bill.");
      setSnackbarOpen(true);
    } else {
      const newItem = {
        productid: selectedProduct,
        name: productname,
        price,
        total: price * quantity,
        category: CategoryName,
        quantity,
      };

      setBill((prevBill) => [...prevBill, newItem]);
      setTotalAmount((prevTotal) => prevTotal + newItem.total);
      console.log(bill);
    }
  };


  const handleGenerateBill = async (e) => {
    e.preventDefault();
  
    try {
      const newProduct = {
        name,
        email,
        contactnumber,
        paymentmethod,
        total: totalAmount,
        productdetails: JSON.stringify(bill),
      };

      const response = await axios.post(
        "http://localhost:8080/bill/generateReport",
        newProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const newBill = {
          name,
          email,
          contactnumber,
          paymentmethod,
          total: totalAmount,
          productdetails: JSON.stringify(bill),
          uuid: response.data.uuid
        };
        const responsedata = await axios.post(
          `http://localhost:8080/bill/getPdf`,
          newBill,
          {
            responseType: "arraybuffer",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        setSnackbarSeverity("success");
        setSnackbarMessage("Pdf Downloaded.");
  
        // Use the uuid from the first response for the filename
        const blob = new Blob([responsedata.data], { type: "application/pdf" });
        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = `${response.data.uuid}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (error) {
      if (error.response) {
        setSnackbarSeverity("error");
        setSnackbarMessage(error.response.data.message);
      } else {
        console.error("Error:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Please try again!");
      }
    } finally {
      setSnackbarOpen(true);
      setName("");
      setEmail("");
      setContactNumber("");
      setPaymentMethod("");
      setSelectedCategory("");
      setSelectedProduct("");
      setPrice("");
      setQuantity("");
      setBill([]);
      setTotalAmount(0);
    }
  };
  
  const handleDelete = (index) => {
    // Create a copy of the current bill array
    const updatedBill = [...bill];
    // Remove the item at the specified index
    updatedBill.splice(index, 1);
    // Update the bill state with the modified array
    setBill(updatedBill);
    setTotalAmount(0)
  };

  // const handleContactNumberChange = (e) => {
  //   setContactNumber(e.target.value);
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:8080/bill/getByContact/${contactnumber}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       const userData = response.data;
  //       setName(userData.name);
  //       setEmail(userData.email);
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //     }
  //   };

  //   // Fetch data when contactNumber changes
  //   fetchData();
  // }, [contactnumber]);

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
                sx={{ flexGrow: 1, fontSize: "1.7rem", fontFamily: "fantasy" }}
              >
                Manage Order
              </Typography>
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
                onClick={handleBack}
              >
                Go to Dashboard
              </Button>
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
                flexGrow: 1,
                marginTop: "6rem",
                position: "relative",
                padding: "20px",
              }}
            >
              <Box>
                <Button
                  sx={{ position: "absolute", right: "1.6rem", top: "-2rem" }}
                  onClick={(e) => handleGenerateBill(e)}
                  color="secondary"
                  variant="contained"
                  disabled={bill.length === 0}
                >
                  Order & Get Bill
                </Button>
                <Typography
                  sx={{
                    position: "absolute",
                    top: "-1rem",
                    left: "1.3rem",
                    fontSize: "25px",
                    fontFamily: "monospace",
                  }}
                >
                  Customer Details:
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                  marginTop: "1rem",
                }}
              >
                <TextField
                  id="productname"
                  name="productname"
                  value={name}
                  autoComplete="product-name"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  label="Name"
                  variant="filled"
                />
                <TextField
                  id="price"
                  name="price"
                  type="email"
                  value={email}
                  autoComplete="price"
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  label="E-mail"
                  variant="filled"
                />
                <TextField
                  id="contactnumber"
                  name="contactnumber"
                  type="text"
                  value={contactnumber}
                  autoComplete="contactnumber"
                  onChange={(e) => setContactNumber(e.target.value)}
                  // onChange={handleContactNumberChange}
                  fullWidth
                  label="Contact Number"
                  variant="filled"
                />
                <FormControl variant="filled" fullWidth>
                  <InputLabel id="select-paymentmethod-label">
                    Payment Method
                  </InputLabel>
                  <Select
                    labelId="select-paymentmethod-label"
                    id="select-paymentmethod"
                    label="Payment Method"
                    value={paymentmethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                marginTop: "5rem",
                position: "relative",
                padding: "20px",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    position: "absolute",
                    top: "-1rem",
                    left: "1.3rem",
                    fontSize: "25px",
                    fontFamily: "monospace",
                  }}
                >
                  Select Products:
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                  marginTop: "1rem",
                }}
              >
                <FormControl variant="filled" fullWidth>
                  <InputLabel id="select-category-label">Category</InputLabel>
                  <Select
                    labelId="select-category-label"
                    id="select-category"
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {category.map((category, index) => (
                      <MenuItem key={index} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  variant="filled"
                  fullWidth
                  disabled={!selectedCategory}
                >
                  <InputLabel id="select-product-label">Product</InputLabel>
                  <Select
                    labelId="select-product-label"
                    id="select-product"
                    label="Product"
                    value={selectedProduct}
                    onChange={GetProductById}
                  >
                    {product.map((product, index) => (
                      <MenuItem key={index} value={product.productid}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  id="price"
                  name="price"
                  value={price}
                  autoComplete="product-price"
                  fullWidth
                  label="Price"
                  variant="filled"
                  disabled={!selectedProduct}
                />
                <TextField
                  id="quantity"
                  name="quantity"
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  autoComplete="quantity"
                  fullWidth
                  label="Quantity"
                  variant="filled"
                  disabled={!selectedProduct}
                />
                <TextField
                  id="total"
                  name="total"
                  type="text"
                  value={price * quantity}
                  autoComplete="total"
                  fullWidth
                  label="Total"
                  disabled={!selectedProduct}
                  variant="filled"
                />
              </Box>
              <Box>
                <Button
                  sx={{ position: "absolute", bottom: "-3rem", left: "1.3rem" }}
                  color="secondary"
                  variant="contained"
                  disabled={isDisabled}
                  onClick={handleAddToBill}
                >
                  Add 
                </Button>
                <Button
                  sx={{
                    position: "absolute",
                    bottom: "-3rem",
                    right: "1.5rem",
                  }}
                  color="secondary"
                  variant="contained"
                >
                  Total Amount : {totalAmount}
                </Button>
              </Box>
            </Box>
            <Box sx={{ m: "0 auto", mt: "6rem", width: "98%" }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Name</StyledTableCell>
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell>Price</StyledTableCell>
                      <StyledTableCell>Quantity</StyledTableCell>
                      <StyledTableCell>Total</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bill.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={6}>
                          <h5>No Record Found</h5>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bill.map((bill, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell component="th" scope="row">
                            {bill.name}
                          </StyledTableCell>
                          <StyledTableCell>{bill.category}</StyledTableCell>
                          <StyledTableCell>&#8377;{bill.price}</StyledTableCell>
                          <StyledTableCell>{bill.quantity}</StyledTableCell>
                          <StyledTableCell>&#8377;{bill.total}</StyledTableCell>
                          <StyledTableCell align="center">
                            <DeleteIcon
                              onClick={() => handleDelete(index)}
                              sx={{ color: "green", cursor: "pointer" }}
                            />
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
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

export default Order;
