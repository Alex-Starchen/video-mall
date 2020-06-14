const express = require('express');
const router = express.Router();
const db=require('./db')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create',async function(req,res,next){
    let order=req.body
    let result=Object.assign({},order)
    let id=await db.addOrder(order)
    console.log(id)
    result.orderId=id
    res.send(result)
})
router.post('/delete',async function(req,res,next){
  let orderId=req.body.orderId
  let userId=req.body.userId
  //删除users表的订单
  let result=await db.delOrder(orderId)
  res.send(result)
})
module.exports = router;