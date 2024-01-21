import React, { useEffect, useState, useCallback } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Toolbar,
  List,
  Typography,
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
  InputBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
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

const Viewbill = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [bill, setBill] = useState([]);
  const [billdata, setBillData] = useState({});
  const [billid, setBillId] = useState("");
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

  const handleClose = () => {
    setDeleteDialog(false);
    setViewModalOpen(false);
  };

  // Delete Confirmation
  const handleDeleteConfirmation = (bill) => {
    setDeleteDialog(true);
    setBillId(bill.id);
  };

  const handleOpenViewModal = (bill) => {
    setBillData(bill);
    setViewModalOpen(true);
  };

  const getBillDetails = useCallback(
    async (pages, rowsPerPage) => {
      try {
        if (!token) return false;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `http://localhost:8080/bill/query?pageNumber=${
            pages + 1
          }&pageSize=${rowsPerPage}&filter=${search}&sortOrder=${sortOrder}`,
          { headers }
        );

        const data = response.data;
        setBill(data.data);
        setTotalRecord(data.total);
        setBillData(data.data)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [search, sortOrder]
  );

  useEffect(() => {
    getBillDetails(0, rowsPerPage);
  }, [getBillDetails]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getBillDetails(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value);
    const newPageCount = Math.ceil(count / newRowsPerPage);
    const newLastPage = Math.max(0, newPageCount - 1);

    const currentPage = Math.min(page, newLastPage);
    setRowsPerPage(newRowsPerPage);

    if (page === newLastPage) {
      getBillDetails(currentPage, newRowsPerPage);
      setPage(currentPage);
    } else {
      getBillDetails(0, newRowsPerPage);
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

  const handleDeleteBill = async (id) => {
    try {
      axios
        .delete(`http://localhost:8080/bill/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setSnackbarSeverity("success");
            setSnackbarMessage(response.data.message);
            getBillDetails(0, rowsPerPage);
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

  const DownloadPdf = async (billdata) => {
    try {
      const Pdf = {
        productdetails: JSON.stringify(billdata.productdetails),
        name: billdata.name,
        email: billdata.email,
        contactnumber: billdata.contactnumber,
        paymentmethod: billdata.paymentmethod,
        total: billdata.total,
        uuid: billdata.uuid
      };

      const response = await axios.post(
        `http://localhost:8080/bill/getPdf`,
        Pdf,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = `${billdata.uuid}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setSnackbarSeverity("success");
      setSnackbarMessage("Pdf Downloaded");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to download PDF");
      setSnackbarOpen(true);
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
                View Bill
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
            <Dialog
              open={viewModalOpen}
              fullScreen
              onClose={handleClose}
              TransitionComponent={Transition}
            >
              <DialogTitle>
                Bill Details
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                  sx={{ position: "absolute", right: 25, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name: {billdata.name}</TableCell>
                        <TableCell align="right">
                          Email: {billdata.email}
                        </TableCell>
                        <TableCell align="right">
                          Contact Number: {billdata.contactnumber}
                        </TableCell>
                        <TableCell align="right">
                          Payment Method: {billdata.paymentmethod}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </TableContainer>

                <TableContainer component={Paper} sx={{ marginTop: "2rem" }}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name: </TableCell>
                        <TableCell>Category:</TableCell>
                        <TableCell>Quantity:</TableCell>
                        <TableCell>Price:</TableCell>
                        <TableCell>Total:</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billdata &&
                        billdata.productdetails &&
                        billdata.productdetails.map((bill, index) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              {bill.name}
                            </TableCell>
                            <TableCell>{bill.category}</TableCell>
                            <TableCell>{bill.quantity}</TableCell>
                            <TableCell>&#8377;{bill.price}</TableCell>
                            <TableCell>&#8377;{bill.total}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <h5 style={{marginTop: '2rem'}}>Sub Total:  &#8377;{billdata.total}</h5>
              </DialogContent>
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
                Are you sure you want to delete this Bill?
              </DialogContent>
              <DialogActions>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => handleDeleteBill(billid)}
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
                        Name
                        {sortOrder === "asc" ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </StyledTableCell>
                      <StyledTableCell>E-mail</StyledTableCell>
                      <StyledTableCell>Contact Number</StyledTableCell>
                      <StyledTableCell>Payment Method</StyledTableCell>
                      <StyledTableCell>Total</StyledTableCell>
                      <StyledTableCell align="center" colSpan={3}>
                        Action
                      </StyledTableCell>
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
                          <StyledTableCell
                            component="th"
                            scope="row"
                            align="center"
                          >
                            {bill.name}
                          </StyledTableCell>
                          <StyledTableCell>{bill.email}</StyledTableCell>
                          <StyledTableCell>
                            {bill.contactnumber}
                          </StyledTableCell>
                          <StyledTableCell>
                            {bill.paymentmethod}
                          </StyledTableCell>
                          <StyledTableCell>&#8377;{bill.total}</StyledTableCell>
                          <StyledTableCell align="center">
                            <RemoveRedEyeIcon
                              sx={{ color: "blue", cursor: "pointer" }}
                              onClick={() => handleOpenViewModal(bill)}
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <DeleteIcon
                              sx={{ color: "red", cursor: "pointer" }}
                              onClick={() => handleDeleteConfirmation(bill)}
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <DownloadIcon
                              onClick={() => DownloadPdf(bill)}
                              sx={{ color: "black", cursor: "pointer" }}
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

export default Viewbill;
