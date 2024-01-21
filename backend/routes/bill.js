const express = require("express");
const pool = require("../connection");
const router = express.Router();
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
var fs = require("fs");
var uuid = require("uuid");
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/generateReport", auth.authenticateToken, (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;
  var productDetailsReport = JSON.parse(orderDetails.productdetails);

  pool.query(
    "INSERT INTO bill (name,uuid,email,contactnumber,paymentmethod,total,productdetails,createdby) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [
      orderDetails.name,
      generatedUuid,
      orderDetails.email,
      orderDetails.contactnumber,
      orderDetails.paymentmethod,
      orderDetails.total,
      orderDetails.productdetails,
      res.locals.email,
    ],
    (err, result) => {
      if (!err) {
        ejs.renderFile(
          path.join(__dirname, "", "report.ejs"),
          {
            productdetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactnumber: orderDetails.contactnumber,
            paymentmethod: orderDetails.paymentmethod,
            total: orderDetails.total,
          },
          (err, result) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              pdf
                .create(result)
                .toFile(
                  "./upload/" + generatedUuid + ".pdf",
                  function (err, data) {
                    if (err) {
                      console.log(err);
                      return res.status(500).json(err);
                    } else {
                      return res
                        .status(200)
                        .json({
                          uuid: generatedUuid,
                          message: "Product Details Added",
                        });
                    }
                  }
                );
            }
          }
        );
      } else {
        res.status(500).json(err);
      }
    }
  );
});

router.post("/getPdf", auth.authenticateToken, function (req, res) {
  const orderDetails = req.body;
  const pdfPath = "./upload/" + orderDetails.uuid + ".pdf";
  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    var productDetailsReport = JSON.parse(orderDetails.productdetails);
    ejs.renderFile(
      path.join(__dirname, "", "report.ejs"),
      {
        productdetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactnumber: orderDetails.contactnumber,
        paymentmethod: orderDetails.paymentmethod,
        total: orderDetails.total,
      },
      (err, result) => {
        if (err) {
          return res.status(500).json({message: 'Error Creating PDF'});
        } else {
          pdf
            .create(result)
            .toFile(
              "./upload/" + orderDetails.uuid + ".pdf",
              function (err, data) {
                if (err) {
                  console.log(err);
                  return res.status(500).json(err);
                } else {
                  res.contentType("application/pdf");
                  fs.createReadStream(pdfPath).pipe(res);
                }
              }
            );
        }
      }
    );
  }
});

router.get("/getBills", auth.authenticateToken, (req, res, next) => {
  pool.query("SELECT * FROM bill ORDER BY id DESC", (err, result) => {
    if (!err) {
      return res.status(200).json(result.rows);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/query", auth.authenticateToken, async (req, res, next) => {
  try {
    const sortOrder = req.query.sortOrder || "asc";
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const pageSize = parseInt(req.query.pageSize);
    const filter = req.query.filter || "";
    const offset = (pageNumber - 1) * pageSize;

    const query = `
    SELECT * FROM bill 
    WHERE name ILIKE $1 OR email ILIKE $1 OR contactnumber ILIKE $1
    ORDER BY name ${sortOrder === "desc" ? "DESC" : "ASC"}
    LIMIT $3 OFFSET $2
      `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM bill
      WHERE name ILIKE $1 OR email ILIKE $1 OR contactnumber ILIKE $1
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

router.delete("/delete/:id", auth.authenticateToken, (req, res, next) => {
  const id = req.params.id;
  pool.query("DELETE FROM bill WHERE id = $1", [id], (err, result) => {
    if (!err) {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Bill id does not found" });
      }
      return res.status(200).json({ message: "Bill Deleted Successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get('/getByContact/:contactnumber',auth.authenticateToken,checkRole.checkRole,(req,res,next) => {
  const contactnumber = req.params.contactnumber;
  pool.query("SELECT id,name,email FROM bill WHERE contactnumber = $1",[contactnumber],(err,result) => {
    if(!err){
       if(result.rowCount == 0){
         return res.status(500).json({message: 'Contact number does exists!'})
       }
       else{
        return res.status(200).json(result.rows[0])
       }
    }
    else{
      return res.status(400).json(err)
    }
  })
})

module.exports = router;

// [{\"productid\": 1, \"name\": \"Margreta\", \"price\": 99, \"total\": 99, \"category\": \"Pizza\", \"quantity\": \"1\"}]"
