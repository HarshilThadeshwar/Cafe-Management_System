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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TablePagination from "@mui/material/TablePagination";
import Sidebar from "../components/Sidebar";
import axios from "axios";
const drawerWidth = 240;
import Switch from "@mui/material/Switch";

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

const User = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const [userid, setUserId] = useState("");
  const [user, setUser] = useState([]);
  const [page, setPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [totalrecord, setTotalRecord] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const count = parseInt(totalrecord);
  const token = sessionStorage.getItem("token");

  const getUserDetails = useCallback(
    async (pages, rowsPerPage) => {
      try {
        
        if (!token) return false;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `http://localhost:8080/user/query?pageNumber=${
            pages + 1
          }&pageSize=${rowsPerPage}&filter=${search}&sortOrder=${sortOrder}`,
          { headers }
        );

        const data = response.data;
        setUser(data.data);
        setTotalRecord(data.total);
        console.log(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [search, sortOrder]
  );

  useEffect(() => {
    getUserDetails(0, rowsPerPage);
  }, [getUserDetails]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getUserDetails(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    const newPageCount = Math.ceil(count / newRowsPerPage);
    const newLastPage = Math.max(0, newPageCount - 1);

    const currentPage = Math.min(page, newLastPage);
    setRowsPerPage(newRowsPerPage);

    if (page === newLastPage) {
      getUserDetails(currentPage, newRowsPerPage);
      setPage(currentPage);
    } else {
      getUserDetails(0, newRowsPerPage);
      setPage(0);
    }
  };

  // Handle sorting
  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "true" ? "false" : "true";
    //   const updatedUser = user.map((userItem) =>
    //   userItem.id === id ? { ...userItem, status: newStatus } : userItem
    // );
      axios
        .patch(
          `http://localhost:8080/user/updateStatus`,
          {
            id,
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
            // setUser(updatedUser);
            getUserDetails(page, rowsPerPage);
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
                // backgroundColor: "#25476a",
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
                Manage User
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
                  width: "75%",
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
            </Box>
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
                        Name
                        {sortOrder === "asc" ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">E-mail</StyledTableCell>
                      <StyledTableCell align="center">Contact Number</StyledTableCell>
                      <StyledTableCell align="center" colSpan={3}>
                        Action
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={3}>
                          <h5>No Record Found</h5>
                        </TableCell>
                      </TableRow>
                    ) : (
                      user.map((user) => (
                        <StyledTableRow key={user.id}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {user.name}
                          </StyledTableCell>
                          <StyledTableCell align="center">{user.email}</StyledTableCell>
                          <StyledTableCell align="center">
                            {user.contactnumber}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ width: "10%" }}>
                            {user.status === "true" ? (
                              <Switch
                                {...label}
                                defaultChecked
                                onClick={() =>
                                  handleUpdateStatus(
                                    user.id,
                                    user.status
                                  )
                                }
                              />
                            ) : (
                              <Switch
                                {...label}
                                onClick={() =>
                                  handleUpdateStatus(
                                    user.id,
                                    user.status
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

export default User;
