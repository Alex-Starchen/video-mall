var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const db=require('./db')

//首页
router.get('/', function(req, res, next) {
  // res.send('localHandler({"result":"这是服务端传来的消息"})')//jsonp
  res.render('index', { title: 'Express' });
});

//注册
router.post('/register',async function(req,res,next){
  let params=req.body
  //对注册字段进行校验过滤
  let error=checkInput(params)
  if(error){
    res.send(error)
    return
  }
  //检测账号是否重复
  let repeat=await db.checkRepeat(params)
  if(repeat.length==0){
    params.password=encrypt(params.password,'userkey')//对密码进行对称加密
    let data=await db.addUser(params)//添加用户
    if(data){
      res.send({isSuccess:true})
      return
    }
  }else{
    res.send({errMessage:"Repeat account"})
    return
  }
})

//登录
router.post('/login',async function(req,res,next){
  let user=req.body
  //对用户密码进行加密再和数据库的加密数据进行匹配
  user.password=encrypt(user.password,'userkey')
  let result=await db.getUser(user)
  if(result.length!=0){
    //设置session的账号和密码
    req.session.loginUser = user.account;
    req.session.userPwd = user.password;
    // //给客户端设置cookie
    // res.cookie('sessionId',req.session.id)
    //把密码去掉然后返回用户信息
    let data=result[0]
    delete data.password
    res.json({ret_code: 0, ret_msg: '登录成功',data});  
    return         
  }else{
    res.json({ret_code: 1, ret_msg: '账号或密码错误'});
    return
  }
})


// 退出登录
router.get('/logout', function(req, res, next){
  // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
  // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
  // 然后去查找对应的 session 文件，报错
  // session-file-store 本身的bug  
  req.session.destroy(function(err) {
    if(err){
      res.json({ret_code: 2, ret_msg: '退出登录失败'});
      return;
    }
    res.clearCookie('userkey')
    res.json({ret_code: 0, ret_msg: '已退出登录'})
  });
});


//输入校验
function checkInput(user){
  let exc1=/^(_|[a-zA-Z])[\w]{4}/g
  let isAccount=exc1.test(user.account)
  let exc2=/^(?!([a-zA-Z]+|\d+)$)[a-zA-Z\d]{6,20}$/g
  let isPassword=exc2.test(user.password)
  let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/img,
      regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/img;
  let isName=Boolean
  if(regEn.test(user.name) || regCn.test(user.name)){
      isName=false
  }else{
      isName=true
  }
  let exc4=/\d{11}/g
  let isPhone=exc4.test(user.phone)
  let response={isAccount,isPassword,isName,isPhone}
  if(isAccount&&isPassword&&isName&&isPhone){
    return false
  }else{
    response.errMessage="Input Invalid"
    console.log(response)
    return response
  }
}

//加密
function encrypt(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

//解密
function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = router;
