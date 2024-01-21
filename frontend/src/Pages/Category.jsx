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
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TablePagination from "@mui/material/TablePagination";
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

const Category = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const [name, setName] = useState("");
  const [categoryid, setCategoryId] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogTitle, setDialogTitle] = useState("Add Category");
  const [openDialog, setOpenDialog] = useState(false);
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
  };

  const resetFields = () => {
    setName("");
  };

  useEffect(() => {
    if (name === "") {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [name]);

  // ADD Button
  const handleAdd = (mode) => {
    setDialogTitle(mode === "add" ? "Add Category" : "Edit Category");
    setOpenDialog(true);
    resetFields();
  };

  // Edit Button
  const handleEdit = (category, mode) => {
    setDialogTitle(mode === "edit" ? "Edit Category" : "Add Category");
    setOpenDialog(true);
    setName(category.name);
    setCategoryId(category.id);
  };

  const getCategory = useCallback(
    async (pages, rowsPerPage) => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return false;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `http://localhost:8080/category/query?pageNumber=${
            pages + 1
          }&pageSize=${rowsPerPage}&filter=${search}&sortOrder=${sortOrder}`,
          { headers }
        );

        const data = response.data;
        setCategory(data.data);
        setTotalRecord(data.total);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [search, sortOrder]
  );

  useEffect(() => {
    getCategory(0, rowsPerPage);
  }, [getCategory]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getCategory(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    const newPageCount = Math.ceil(count / newRowsPerPage);
    const newLastPage = Math.max(0, newPageCount - 1);

    const currentPage = Math.min(page, newLastPage);
    setRowsPerPage(newRowsPerPage);

    if (page === newLastPage) {
      getCategory(currentPage, newRowsPerPage);
      setPage(currentPage);
    } else {
      getCategory(0, newRowsPerPage);
      setPage(0);
    }
  };

  // Handle sorting
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const token = sessionStorage.getItem("token");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const newCategory = {
        name
      }
      axios
        .post(
          "http://localhost:8080/category/add", newCategory,
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
            newCategory.id = response.id;
            setCategory([...category, newCategory]);  
          }
        })
        .catch((error) => {
          if (error.response) {
            setSnackbarSeverity("error");
            setSnackbarMessage(error.response.data.message);
            setOpenDialog(false);
          }
        })
        .finally(() => {
          setSnackbarOpen(true);
          setName("");
        });
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const handleUpdateCategory = async (e, id) => {
    e.preventDefault();
    try {
      axios
        .patch(
          `http://localhost:8080/category/update`,
          {
            id,
            name,
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
            const updatedCategories = category.map((category) =>
              category.id === id ? { ...category, name } : category
            );
            setCategory(updatedCategories);
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
                Manage Category
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
                Add Category
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    width: "30rem",
                  }}
                >
                  <div style={{ paddingTop: "10px" }}>
                    <TextField
                      id="name"
                      name="name"
                      autoFocus
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value.charAt(0).toUpperCase() +
                            e.target.value.slice(1)
                        )
                      }
                      fullWidth
                      label="Name"
                      variant="outlined"
                    />
                  </div>
                </div>
              </DialogContent>
              <DialogActions sx={{ margin: "auto", marginBottom: "2rem" }}>
                {dialogTitle !== "Add Category" ? (
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ marginRight: "1rem" }}
                    disabled={isDisabled}
                    onClick={(e) => handleUpdateCategory(e, categoryid)}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ marginRight: "1rem" }}
                    disabled={isDisabled}
                    onClick={(e) => handleAddCategory(e)}
                  >
                    Submit
                  </Button>
                )}
                <Button type="reset" onClick={resetFields} variant="contained">
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
                        Category Name
                        {sortOrder === "asc" ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {category.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={3}>
                          <h5>No Record Found</h5>
                        </TableCell>
                      </TableRow>
                    ) : (
                      category.map((category, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {category.name}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <EditIcon
                              onClick={() => handleEdit(category, "edit")}
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

export default Category;
