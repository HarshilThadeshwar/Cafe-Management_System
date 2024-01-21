const express = require("express");
const pool = require("../connection");
const router = express.Router();
const secretKey = "secretKey";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, res) => {
  const user = req.body;
  try {
    pool.query(
      "SELECT email,password,role,status FROM users WHERE email = $1",
      [user.email],
      (err, result) => {
        if (!err) {
          if (result.rowCount > 0) {
            return res.status(400).json({ message: "Email Already Exist!" });
          } else {
            const insertQuery = `INSERT INTO users(name, contactnumber, email, password, status, role) VALUES('${user.name}', '${user.contactnumber}', '${user.email}', '${user.password}' ,'false','user') RETURNING * `;
            pool.query(insertQuery, (err, result) => {
              if (!err) {
                return res.status(200).json({
                  message: "Successfully Registered",
                  result: result.rows[0],
                });
              } else {
                return res.status(500).json(err);
              }
            });
          }
        } else {
          return res.status(500).json(err);
        }
      }
    );
  } catch {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  pool.query(
    "SELECT email, password, role, status FROM users WHERE email = $1",
    [email],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong.Please try again later" });
      }

      if (result.rowCount === 0) {
        return res
          .status(401)
          .json({ message: "Unathorized User" });
      }

      const user = result.rows[0];

      if (user.password !== password) {
        return res
          .status(401)
          .json({ message: "Incorrect Password" });
      }

      if (user.status === "false") {
        return res.status(401).json({ message: "Wait for Admin Approval" });
      }

      const response = { email: user.email, role: user.role };
      // const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
      //   expiresIn: "2h",
      // });
      const accessToken = jwt.sign(response, secretKey, {
        expiresIn: "2h",
      });
      return res.status(200).json({ message: "Login Successful. Redirecting...", token: accessToken });
    }
  );
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  // host: 'smtp.ethereal.email',
  // port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const { forgotPasswordEmail } = req.body;

  pool.query(
    "SELECT email, password FROM users WHERE email = $1",
    [forgotPasswordEmail],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error retrieving user information" });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "E-mail does not exist!" });
      }

      const user = result.rows[0];

      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password by Cafe Management System",
        html: `
        <p><b>Your Login details for Cafe Management System</b><br>
           <b>Email: </b>${user.email}<br>
           <b>Password: </b>${user.password}<br>
           <a href="http://localhost:5173/">Click here to login</a>
        </p>
      `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Error sending email" });
        }

        console.log("Email sent:", info.response);
        res
          .status(200)
          .json({ message: "Password sent successfully to your email." });
      });
    }
  );
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  pool.query(
    "SELECT id,name,email,contactnumber,status FROM users WHERE role = 'user'",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.status(200).json(result.rows);
      }
    }
  );
});

router.get("/query", auth.authenticateToken, async (req, res, next) => {
  try {
    const sortOrder = req.query.sortOrder || "asc";
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const pageSize = parseInt(req.query.pageSize);
    const filter = req.query.filter || "";
    const offset = (pageNumber - 1) * pageSize;

    const query = `
    SELECT id,name,email,contactnumber,status FROM users WHERE role = 'user' AND
    (name ILIKE $1 OR email ILIKE $1 OR contactnumber ILIKE $1) 
    ORDER BY id ${sortOrder === "desc" ? "DESC" : "ASC"}
    LIMIT $3 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users WHERE role = 'user' AND (name ILIKE $1 OR email ILIKE $1 OR contactnumber ILIKE $1)
      `;

    const dataPromise = pool.query(query, [`%${filter}%`,offset, pageSize]);
    const countPromise = pool.query(countQuery, [`%${filter}%`]);

    const [dataResult, countResult] = await Promise.all([
      dataPromise,
      countPromise,
    ]);

    const totalCount = countResult.rows[0].total;
    const data = dataResult.rows;

    return res.status(200).json({ data, total: totalCount });
  } catch (err) {
    return res.status(500).json(err.message || "Internal Server Error");
  }
});
router.patch("/updateStatus",auth.authenticateToken,checkRole.checkRole,(req, res) => {
    let user = req.body;
    pool.query(
      "UPDATE users SET status = $1 WHERE id = $2",
      [user.status, user.id],
      (err, result) => {
        if (!err) {
          if (result.rowCount === 0) {
            return res.status(404).json({ message: "User id does not exist" });
          }
          return res.status(200).json({ message: "User Updated Succesfully" });
        } else {
          return res.status(500).json(err);
        }
      }
    );
  }
);

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword",auth.authenticateToken, (req, res) => {
  const {oldPassword, newPassword} = req.body;
  const email = res.locals.email;
  console.log(email)
  pool.query(
    "SELECT * FROM users where email = $1 and password = $2",
    [email, oldPassword],
    (err, result) => {
      // var user = result.rows[0]
      if (!err) {
        if (result.rowCount === 0) {
          return res.status(400).json({ message: "Incorrect Old Password" });
        } 
        else if (result.rows[0].password == oldPassword) {
          pool.query(
            "UPDATE users SET password = $1 WHERE email = $2",
            [newPassword, email],
            (err, result) => {
              if (!err) {
                return res
                  .status(200)
                  .json({ message: "Password Updated Successfully." });
              } else {
                return res.status(500).json(err);
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ message: "Something went wrong. Pleases try again later" });
        }
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

module.exports = router;
