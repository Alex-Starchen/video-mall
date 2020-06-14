var mysql= require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Czx123456',
  database : 'mall'
});
connection.connect(function(error){
  if (error){
    throw error
  }
  console.log("数据库连接成功")
});
function selectProduct(params){
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
async function foo(){
    let data=await selectProduct({ip:'426'})
    console.log(data)
}
foo()