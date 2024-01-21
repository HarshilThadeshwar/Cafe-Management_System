const express = require('express');
const pool = require('../connection');
const router = express.Router();
var auth = require("../services/authentication");

// router.get('/details',auth.authenticateToken,(req,res,next) => {
//     var categoryCount;
//     var productCount;
//     var billCount;
//     pool.query("SELECT count(id) as categoryCount from category",(err,result) => {
//         if(!err){
//             categoryCount = result.rows[0].categorycount;
//         }
//         else{
//             return res.status(500).json(err);
//         }
//     });

//     pool.query("SELECT count(productid) as productCount from product",(err,result) => {
//         if(!err){
//             productCount = result.rows[0].productcount;
//         }
//         else{
//             return res.status(500).json(err);
//         }
//     });

//     pool.query("SELECT count(id) as billCount from bill",(err,result) => {
//         if(!err){
//             billCount = result.rows[0].billcount;
//             var data = {
//                 category: categoryCount,
//                 product: productCount,
//                 bill: billCount
//             };
//             return res.status(200).json(data);
//         }
//         else{
//             return res.status(500).json(err);
//         }
//     })
// });


router.get('/details', auth.authenticateToken, async (req, res, next) => {
    try {
        const categoryQuery = pool.query("SELECT count(id) as categoryCount from category");
        const productQuery = pool.query("SELECT count(productid) as productCount from product");
        const billQuery = pool.query("SELECT count(id) as billCount from bill");

        const [categoryResult, productResult, billResult] = await Promise.all([categoryQuery, productQuery, billQuery]);

        const categoryCount = categoryResult.rows[0].categorycount;
        const productCount = productResult.rows[0].productcount;
        const billCount = billResult.rows[0].billcount;

        const data = {
            category: categoryCount,
            product: productCount,
            bill: billCount
        };

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;