//初始化
//连接数据库
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'czx123456',
  database : 'mall'
});
connection.connect(function(error){
  if (error){
    throw error
  }
  console.log("数据库连接成功")
});

//创建商品表
function createDatabase(){
  let createTable = `create table if not exists goods(
    id int not null auto_increment primary key,
    name varchar(50) not null,
    productId varchar(10) not null,
    price varchar(20) not null,
    ip char(3) not null,
    pic json not null,
    details json not null,
    sku json not null
  )`
  connection.query(createTable,(error,results,fields)=>{
    if (error) throw error;
    console.log(results)
  })
}

//创建用户表
function createUsers(){
  let sql=`create table if not exists users(
    userId int not null auto_increment primary key,
    account varchar(50) not null,
    password varchar(50) not null,
    name varchar(50) not null,
    phone varchar(20) null,
    photo varchar(100) null default 'http://pic.51yuansu.com/pic3/cover/01/69/80/595f67c2239cb_610.jpg',
    addressList json null,
    cartList json null,
    orderList json null
  )`
  connection.query(sql,(error,results,fields)=>{
    if (error) throw error;
    console.log(results)
  })
}

//创建订单表
function createOrders(){
  let sql=`create table if not exists orders(
    orderId int not null auto_increment primary key,
    payTime varchar(20) not null,
    status int not null,
    productList json not null,
    productNumber int not null,
    goodsPrice int not null, 
    postages int not null,
    payPrice int not null,
    userId varchar(20) not null,
    userAddress json not null
  )`
  connection.query(sql,(error,results,fields)=>{
    if (error) throw error;
    console.log(results)
  })
}
// createUsers()
// createOrders()
//添加用户
function addUser(user){
  let sql=`insert into users(account,password,name,phone) values('${user.account}','${user.password}','${user.name}','${user.phone}')`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        resolve(results)  
    })
})
}

//获取用户
function getUser(user){
  let sql=`select * from users where account='${user.account}' and password='${user.password}' `
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
      if (error){
          throw error;
      }
      resolve(results)  
    })
  })
}

//更新用户数据
function updateUser(userInfo){
  let userId=userInfo.userId
  let photo=userInfo.photo
  let addressList=userInfo.addressList
  let cartList=userInfo.cartList
  let orderList=userInfo.orderList
  // console.log(orderList)
  let sql=`update users set
  photo='${photo}',
  addressList='${addressList}',
  cartList='${cartList}',
  orderList='${orderList}'
  where userId='${userId}'
  `
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
      if(error){
        throw error;
      }
      console.log("userId:"+userId+" has been updated")
      resolve(results)
    })
  })
}

//检查账号是否重复
function checkRepeat(user){
  let sql=`select userId,account from users where account='${user.account}'`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
      if(error){
        throw error;
      }
      resolve(results)
    })
  })
}

//JSON格式数据导入数据库
function loadGoods(file){
  let fs=require('fs');
  let data = fs.readFileSync(file)//读取file爬的json数据
  let result = JSON.parse(data);
  for (let i=0;i<result.length;i++){
    let product=result[i]
    let pic=JSON.stringify(product.pic)
    let details=JSON.stringify(product.details)
    let sku=JSON.stringify(product.sku)
    let addGoods=`insert into goods(productId,name,price,ip,pic,details,sku) values('${product.id}','${product.name}','${product.price}','${product.ip}','${pic}','${details}','${sku}');`
    connection.query(addGoods,(error,results)=>{
      if (error){
        throw error;
      }
      console.log(results.insertId)
    })  
  }
}

//数据处理
function handleData(){
  // 根据productId数据去重
  let removeRepeat="delete from goods where id not in (select id from (select min(id) as id from goods group by productId)a);"
  // 去重之后重新排列主键
  let removeId="alter table goods drop id"
  let addId="alter table goods add id int not null primary key auto_increment first;"
  connection.query(removeRepeat,(error,results)=>{
    if (error){
        throw error;
      }
      console.log(results)
  })
  connection.query(removeId,(error,results)=>{
    if (error){
        throw error;
      }
      console.log(results)
  })
  connection.query(addId,(error,results)=>{
    if (error){
        throw error;
      }
      console.log(results)
  })
}

//获取ip分类的商品
function getIpContent(params){
    let select=`select * from goods where ip=${params.ip} order by productId`
    return new Promise((resolve,reject)=>{
        connection.query(select,function(error,results){
            if (error){
                throw error;
            }
            resolve(results)  
        })
    })
}

//获取ip列表
function getIplist(){
  let sql="select ip,count(ip) from goods group by ip order by count(ip);"
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        resolve(results)  
    })
  })
}

//获取商品信息
function getGoods(id){
  let sql=`select * from goods where productId=${id}`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        resolve(results[0])  
    })
  })
}

//获取多个商品信息
function getGoodsList(goodsList){
  if(goodsList.length==0){
    return
  }
  let list=[]
  for(let i=0;i<goodsList.length;i++){
    list[i]="productId="+goodsList[i]
  }
  list=list.join(' or ')
  // console.log(list)
  let sql=`select * from goods where ${list}`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        resolve(results)  
    })
  })  
}

//添加订单
function addOrder(order){
  let sql=`insert into orders(payTime,status,productList,productNumber,goodsPrice,postages,payPrice,userId,userAddress) values(
    '${order.payTime}',
    '${order.status}',
    '${order.productList}',
    '${order.productNumber}',
    '${order.goodsPrice}',
    '${order.postages}',
    '${order.payPrice}',
    '${order.userId}',
    '${order.userAddress}'
    )`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        let sql=`SELECT LAST_INSERT_ID()`
        connection.query(sql,function(error,results){
          if(error){
            throw error;
          }
          resolve(Object.values(results[0])[0])
        })
    })
  })
}

//删除订单
function delOrder(orderId){
  let sql=`delete from orders where orderId='${orderId}'`
  return new Promise((resolve,reject)=>{
    connection.query(sql,function(error,results){
        if (error){
            throw error;
        }
        resolve(results)  
    })
  })  
}
//关闭连接
function closeConnection(){
  connection.end()
  console.log("Connection closed")
}
// createDatabase()
// loadGoods("goods.json")

module.exports={
    createDatabase,
    createUsers,
    createOrders,
    addUser,
    getUser,
    updateUser,
    checkRepeat,
    loadGoods,
    handleData,
    getIpContent,
    getIplist,
    getGoods,
    getGoodsList,
    addOrder,
    delOrder,
    closeConnection
}