const db=require("../routes/db")
// db.loadGoods("goods.json")
db.handleData();
db.createDatabase();
db.createUsers();
db.createOrders();
db.closeConnection();
 