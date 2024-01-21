import React, { useEffect, useState, useCallback } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  InputBase,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TablePagination from "@mui/material/TablePagination";
import FormControl from "@mui/material/FormControl";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Switch from "@mui/material/Switch";

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

const label = { inputProps: { "aria-label": "Switch demo" } };

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

const Product = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const [productid, setProductId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryid, setCategoryId] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogTitle, setDialogTitle] = useState("Add Product");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [product, setProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [page, setPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [totalrecord, setTotalRecord] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const count = parseInt(totalrecord);

  const handleClose = () => {
    setOpenDialog(false);
    setDeleteDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const resetFields = () => {
    setName("");
    setCategoryId("");
    setPrice("");
    setDescription("");
  };

  useEffect(() => {
    if (
      name === "" ||
      description === "" ||
      categoryid === "" ||
      price === ""
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [name, description, categoryid, price]);

  // ADD Button
  const handleAdd = (mode) => {
    setDialogTitle(mode === "add" ? "Add Product" : "Edit Product");
    setOpenDialog(true);
    resetFields();
  };

  // Edit Button
  const handleEdit = (product, mode) => {
    setDialogTitle(mode === "edit" ? "Edit Product" : "Add Product");
    setOpenDialog(true);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.categoryid);
    setProductId(product.productid);
  };

  // Delete Confirmation

  const handleDeleteConfirmation = (product) => {
    setDeleteDialog(true);
    setProductId(product.productid);
  };

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
  }, []);

  const getProduct = useCallback(
    async (pages, rowsPerPage) => {
      try {
        if (!token) return false;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `http://localhost:8080/product/query?pageNumber=${
            pages + 1
          }&pageSize=${rowsPerPage}&filter=${search}&sortOrder=${sortOrder}`,
          { headers }
        );

        const data = response.data;
        setProduct(data.data);
        setTotalRecord(data.total);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [search, sortOrder]
  );

  useEffect(() => {
    getProduct(0, rowsPerPage);
  }, [getProduct]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getProduct(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    const newPageCount = Math.ceil(count / newRowsPerPage);
    const newLastPage = Math.max(0, newPageCount - 1);

    const currentPage = Math.min(page, newLastPage);
    setRowsPerPage(newRowsPerPage);

    if (page === newLastPage) {
      getProduct(currentPage, newRowsPerPage);
      setPage(currentPage);
    } else {
      getProduct(0, newRowsPerPage);
      setPage(0);
    }
  };

  // Handle sorting
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getCategoryName = (categoryId) => {
    const selectedCategory = category.find((c) => c.id === categoryId);
    return selectedCategory ? selectedCategory.name : "";
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const CategoryName = getCategoryName(categoryid);
      const newProduct = {
        name,
        categoryid,
        categoryname: CategoryName,
        description,
        price,
      };
      axios
        .post("http://localhost:8080/product/add", newProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setSnackbarSeverity("success");
            setSnackbarMessage(response.data.message);
            setOpenDialog(false);
            newProduct.productid = response.productid;
            setProduct([...product, newProduct]);
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
          setDescription("");
          setCategoryId("");
          setPrice("");
        });
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleUpdateStatus = async (productid, currentStatus) => {
    try {
      const newStatus = currentStatus === "true" ? "false" : "true";
      axios
        .patch(
          `http://localhost:8080/product/updateStatus`,
          {
            productid,
            status: newStatus,
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
            const updatedProductList = product.map((prod) =>
              prod.productid === productid
                ? { ...prod, status: newStatus }
                : prod
            );
            setProduct(updatedProductList);
            // getProduct(page, rowsPerPage);
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
        });
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleUpdateProduct = async (e, id) => {
    e.preventDefault();
    try {
      const CategoryName = getCategoryName(categoryid);
      axios
        .patch(
          `http://localhost:8080/product/update`,
          {
            id,
            name,
            categoryid,
            description,
            price,
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
            setOpenDialog(false);
            const updatedProduct = product.map((product) =>
              product.productid === id
                ? {
                    ...product,
                    name,
                    categoryid,
                    categoryname: CategoryName,
                    description,
                    price,
                  }
                : product
            );
            setProduct(updatedProduct);
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
        });
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      axios
        .delete(`http://localhost:8080/product/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setSnackbarSeverity("success");
            setSnackbarMessage(response.data.message);
            getProduct(0, rowsPerPage);
            setDeleteDialog(false);
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
        });
    } catch (error) {
      console.error("Error :", error);
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
                sx={{ flexGrow: 1, fontSize: "1.7rem", fontFamily: "fantasy" }}
              >
                Manage Product
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
            <Box component="main" sx={{ position: "relative" }}>
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 400,
                  mt: "7rem",
                  ml: "13rem",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, height: "3rem" }}
                  placeholder="Search ..."
                  inputProps={{ "aria-label": "search google maps" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="search"
                />
              </Paper>
              <Button
                sx={{ position: "absolute", top: "1rem", right: "13.3rem" }}
                onClick={() => handleAdd("add")}
                color="secondary"
                variant="contained"
              >
                Add Product
              </Button>
            </Box>
            <Dialog
              open={openDialog}
              TransitionComponent={Transition}
              keepMounted
              aria-describedby="alert-dialog-slide-description"
              component="form"
            >
              <DialogTitle sx={{ margin: "auto", fontSize: "25px" }}>
                {dialogTitle}
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ marginLeft: "6rem" }}
                  onClick={handleClose}
                >
                  x
                </Button>
              </DialogTitle>
              <DialogContent>
                <div style={{ margin: "1rem 0" }}>
                  <TextField
                    id="productname"
                    name="productname"
                    value={name}
                    autoComplete="product-name"
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    label="Product Name"
                    variant="outlined"
                  />
                </div>
                <div
                  style={{
                    margin: "1rem 0",
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    id="price"
                    name="price"
                    type="number"
                    value={price}
                    autoComplete="price"
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                    label="Price"
                    variant="outlined"
                  />
                  <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="select-category-label">
                      Select Category
                    </InputLabel>
                    <Select
                      labelId="select-category-label"
                      id="select-category"
                      label="Select Category"
                      value={categoryid}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      {category.map((category, index) => (
                        <MenuItem key={index} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div style={{ margin: "1rem 0" }}>
                  <TextField
                    id="description"
                    name="description"
                    type="text"
                    value={description}
                    autoComplete="description"
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </div>
              </DialogContent>
              <DialogActions sx={{ margin: "auto", marginBottom: "2rem" }}>
                {dialogTitle !== "Add Product" ? (
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ marginRight: "1rem" }}
                    disabled={isDisabled}
                    onClick={(e) => handleUpdateProduct(e, productid)}
                  >
                    Update
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ marginRight: "1rem" }}
                      disabled={isDisabled}
                      onClick={(e) => handleAddProduct(e)}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ marginRight: "1rem" }}
                      onClick={resetFields}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>
            {/* Delete Confirm Box */}
            <Dialog
              open={deleteDialog}
              onClose={handleClose}
              TransitionComponent={Transition}
              keepMounted
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>Delete Confirmation</DialogTitle>
              <DialogContent>
                Are you sure you want to delete this Product?
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => handleDeleteProduct(productid)}
                >
                  Delete
                </Button>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => handleClose()}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Box sx={{ m: "0 auto", mt: "2rem", width: "75%" }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell
                        onClick={() => handleSort()}
                        sx={{ cursor: "pointer" }}
                        align="center"
                      >
                        Product
                        {sortOrder === "asc" ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </StyledTableCell>
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Price</StyledTableCell>
                      <StyledTableCell align="center" colSpan={3}>
                        Action
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={5}>
                          <h5>No Record Found</h5>
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.map((product, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {product.name}
                          </StyledTableCell>
                          <StyledTableCell>
                            {product.categoryname}
                          </StyledTableCell>
                          <StyledTableCell>
                            {product.description}
                          </StyledTableCell>
                          <StyledTableCell>&#8377;{product.price}</StyledTableCell>
                          <StyledTableCell align="center">
                            <EditIcon
                              onClick={() => handleEdit(product, "edit")}
                              sx={{ color: "green", cursor: "pointer" }}
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <DeleteIcon
                              sx={{ color: "red", cursor: "pointer" }}
                              onClick={() => handleDeleteConfirmation(product)}
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ width: "10%" }}>
                            {product.status === "true" ? (
                              <Switch
                                {...label}
                                defaultChecked
                                onClick={() =>
                                  handleUpdateStatus(
                                    product.productid,
                                    product.status
                                  )
                                }
                              />
                            ) : (
                              <Switch
                                {...label}
                                onClick={() =>
                                  handleUpdateStatus(
                                    product.productid,
                                    product.status
                                  )
                                }
                              />
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <TablePagination
              component="div"
              count={count || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15]}
              sx={{ mr: "12rem", mt: "3rem" }}
              className="abc"
            />
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

export default Product;
