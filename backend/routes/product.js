const express = require('express');
const pool = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken,checkRole.checkRole,(req,res) => {
     let {name, categoryid, description,price }= req.body;
     pool.query("INSERT INTO product (name,categoryid,description,price,status) VALUES ($1,$2,$3,$4,'true') RETURNING *",[name,categoryid,description,price],(err,result) => {
        if(!err){
            return res.status(200).json({message: "Product Added Successfully.", result: result.rows[0]});
        }
        else{
            return res.status(500).json(err);
        }
     })
});

router.get('/get', auth.authenticateToken,(req,res,next) => {
    pool.query(`SELECT p.productid, p.name, p.description, p.price, p.status, p.categoryid, c.id as categoryid, c.name as categoryname FROM 
        product as p INNER JOIN category as c ON p.categoryid = c.id`, (err,result) => {
          if(!err){
             return res.status(200).json(result.rows);
          }
          else{
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
        SELECT 
          p.productid, 
          p.name, 
          p.description,
          p.price, 
          p.status, 
          c.id as categoryid, 
          c.name as categoryname 
        FROM 
          product as p 
        INNER JOIN 
          category as c ON p.categoryid = c.id
        WHERE 
          (p.name::text ILIKE $3 OR p.price::text ILIKE $3 OR c.name::text ILIKE $3) 
        ORDER BY 
           p.name ${sortOrder === "asc" ? "ASC" : "DESC"}
        LIMIT $2 OFFSET $1
      `;
  
      const countQuery = `
      SELECT COUNT(*) AS total
      FROM product as p
      INNER JOIN category as c ON p.categoryid = c.id
      WHERE (p.name::text ILIKE $1 OR p.price::text ILIKE $1 OR c.name::text ILIKE $1)
      `;
  
      const dataPromise = pool.query(query, [ offset,pageSize,`%${filter}%`]);
      const countPromise = pool.query(countQuery, [`%${filter}%`]);
  
      const [dataResult, countResult] = await Promise.all([dataPromise, countPromise]);
  
      const totalCount = countResult.rows[0].total;
      const data = dataResult.rows;
  
      return res.status(200).json({ data, total: totalCount });
    } catch (err) {
      return res.status(500).json(err.message || "Internal Server Error");
    }
});

router.get('/getByCategory/:id', auth.authenticateToken,(req,res,next) => {
    const id = req.params.id;
    pool.query(`SELECT productid,name FROM product WHERE categoryid = $1 AND status = 'true'`,[id], (err,result) => {
          if(!err){
             if(result.rowCount === 0){
                return res.status(404).json({ message: "No Record Found" });
             }
             return res.status(200).json(result.rows);
          }
          else{
             return res.status(500).json(err);
          }
     });
});

router.get('/getById/:id', auth.authenticateToken,(req,res,next) => {
    const id = req.params.id;
    pool.query(`SELECT productid,name,description,price FROM product WHERE productid = $1 `,[id], (err,result) => {
          if(!err){
             return res.status(200).json(result.rows[0]);
          }
          else{
             return res.status(500).json(err);
          }
     });
});

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next) => {
    let { id ,name, categoryid, description, price } = req.body;
    pool.query("UPDATE product SET name = $2, categoryid = $3 , description = $4, price= $5 WHERE productid = $1",[id,name,categoryid,description,price],(err,result) => {
        if(!err){
            if(result.rowCount == 0){
               return res.status(404).json({message: "Product id does not found"});
            }
            return res.status(200).json({message: "Product Updated Successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id',auth.authenticateToken,checkRole.checkRole,(req,res,next) => {
    const id = req.params.id;
    pool.query("DELETE FROM product WHERE productid = $1",[id],(err,result) => {
        if(!err){
            if(result.rowCount == 0){
               return res.status(404).json({message: "Product id does not found"});
            }
            return res.status(200).json({message: "Product Deleted Successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    });
});


router.patch('/updateStatus',auth.authenticateToken,checkRole.checkRole,(req,res,next) => {
    let {productid, status} = req.body;
    pool.query("UPDATE product SET status = $2 WHERE productid = $1",[productid,status],(err,result) => {
        if(!err){
            if(result.rowCount === 0){
                return res.status(404).json({message: "Product id does not found"});
            }
            return res.status(200).json({message: "Product Status Updated Successfully"});
        }
    });
});



module.exports = router;