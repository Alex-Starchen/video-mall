const db=require("../routes/db")
//创建goods表
db.createDatabase();
db.createUsers();
db.createOrders();
//导入数据
db.loadGoods("goods.json")
db.closeConnection();
 