var express = require('express');
var router = express.Router();
const db=require('./db')
/* GET users listing. */

router.post('/userInfo',async function(req,res,next){
  let result={}
  if(req.session.loginUser){
    let user={
      'account': req.session.loginUser,
      'password': req.session.userPwd
    }
    result.status=0
    result.data=await db.getUser(user)
    delete result.data[0].password
  }else{
    result.status=1
  }
  res.send(result)
  return
})
router.post('/update',async function(req,res,next){
  let userInfo=req.body
  // console.log(userInfo.addressList)
  let result=await db.updateUser(userInfo)
  res.send(result)
})

module.exports = router;
