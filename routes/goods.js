const express = require('express');
const router = express.Router();
const db=require('./db')
/* GET home page. */
router.get('/', function(req, res, next) {
  // res.send('localHandler({"result":"这是服务端传来的消息"})')//jsonp
  res.render('index', { title: 'Express' });
});
router.get('/category',async function(req,res){
  let params=req.query
  console.log(params)
  let data=await db.getIpContent(params)
  res.send(data)
  return
})
router.get('/category/ip_list',async function(req,res){
  let data=await db.getIplist()
  let ipList=[]
  for (let i=0;i<data.length;i++){
    ipList.push(data[i].ip)
  }
  res.send(ipList)
  return
})
router.get('/page',async function(req,res){
  let params=req.query
  let arr=Object.values(params)
  // console.log(arr)
  let body=[]
  for (let i=0;i<arr.length;i++){
    let data=await db.getGoods(arr[i])
    body.push(data)
  }
  res.send(body)
  return
})
router.get('/details',async function(req,res){
  let params=req.query
  // console.log(params)
  let data=await db.getGoods(params.proId)
  res.send(data)
  return
})
router.get('/list',async function(req,res){
  let goodsList=Object.values(req.query)
  console.log(goodsList)
  let data=await db.getGoodsList(goodsList)
  res.send(data)
})

module.exports = router;
