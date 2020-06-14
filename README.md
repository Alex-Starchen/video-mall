# video-mall
Node.js+vue.js+mysql开发电商系统

1、爬虫工具superagent+cheerio获取商品数据
运行crawler.js文件后提取的数据存入product.json
运行rewrite_data.js文件转换为json格式存入goods.json

2、在mysql创建数据库mall，运行init.js创建商品、用户、订单表并导入数据

3、npm run start从app.js启动后台