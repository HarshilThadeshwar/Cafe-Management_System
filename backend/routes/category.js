const express = require("express");
const pool = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

// router.post(
//   "/add",
//   auth.authenticateToken,
//   checkRole.checkRole,
//   (req, res, next) => {
//     let { name } = req.body;
//     pool.query(
//       "INSERT INTO category (name) VALUES ($1) RETURNING * ",
//       [name],
//       (err, result) => {
//         if (!err) {
//           const category = result.rows[0];

//           if (category.name === name) {
//             return res
//               .status(401)
//               .json({ message: "Category Already Exists!" });
//           } else {
//             return res
//               .status(200)
//               .json({ message: "Category Added Successfully" });
//           }
//         } else {
//           return res.status(500).json(err);
//         }
//       }
//     );
//   }
// );

router.post(
  "/add",
  auth.authenticateToken,
  checkRole.checkRole,
  async (req, res, next) => {
    try {
      const { name } = req.body;

      // Check if the category already exists
      const existingCategory = await pool.query(
        "SELECT * FROM category WHERE name = $1",
        [name]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(401).json({ message: "Category Already Exists!" });
      }

      // If the category doesn't exist, proceed to insert
      const result = await pool.query(
        "INSERT INTO category (name) VALUES ($1) RETURNING * ",
        [name]
      );

      return res.status(200).json({ message: "Category Added Successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);


router.get("/get", auth.authenticateToken, (req, res, next) => {
  const query = `SELECT * FROM category ORDER BY name`;

  pool.query(query, (err, result) => {
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
    const filter = req.query.filter || "";
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const pageSize = parseInt(req.query.pageSize);

    const offset = (pageNumber - 1) * pageSize;

    const query = `
        SELECT * FROM category 
        WHERE name ILIKE $1
        ORDER BY name ${sortOrder === "asc" ? "ASC" : "DESC"}
        LIMIT $2 OFFSET $3
      `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM category
        WHERE name ILIKE $1
      `;

    const dataPromise = pool.query(query, [`%${filter}%`, pageSize, offset]);
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

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res, next) => {
    let { id, name } = req.body;
    pool.query(
      "UPDATE category SET name = $2 WHERE id = $1",
      [id, name],
      (err, result) => {
        if (!err) {
          if (result.rowCount == 0) {
            return res
              .status(404)
              .json({ message: "Category id does not found" });
          }
          return res
            .status(200)
            .json({ message: "Category Updated Successfully" });
        } else {
          return res.status(500).json(err);
        }
      }
    );
  }
);

module.exports = router;
