let goods_key=["emModType=7&emReqType=2&emInnerModReqType=9&iPageSize=8&strId=4","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=36","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=39","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=40","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=37","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=38","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=35","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=625","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=136","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=402","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=155","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=475","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=232","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=248","emModType=7&emReqType=2&emInnerModReqType=6&iPageSize=8&strId=255"];
let ip_key=["emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=43","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=44","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=315","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=85","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=87","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=89","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=407","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=180","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=198","emModType=8&emReqType=2&emInnerModReqType=5&iPageSize=8&strId=252"]

const urlencode = require('urlencode'),
    http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    eventproxy = require('eventproxy'),
    fs = require('fs'),
    path = require('path');

let ep = new eventproxy();
let host = "http://mall.video.qq.com/"
let pre_path = "cgi/ip_cat?async=1&datakey="
let page_end = "&context=pageNum%3D"
let seq_end = "&context=seqNum%3D"
let IpUrl = "http://mall.video.qq.com/ip_products.modlist?pagelet=1&_async=1&strPageContext=pageNum%3D1"
let proUrl = "http://mall.video.qq.com/detail?proId="
let ip_cat = []//存放ip分类标签url的数组
let ip_goods = []//存放ip分类下商品的url的数组
let ipId = [] //ip分类的id
let proId=[] //商品ID

for (let i=0;i<ip_key.length;i++){
    ip_cat.push(host+pre_path+urlencode(ip_key[i])+seq_end)//拼接url并进行编码
    // console.log(ip_cat[i])
}

for (let i=0;i<goods_key.length;i++){``
    ip_goods.push(host+pre_path+urlencode(goods_key[i])+page_end+1)//拼接url并进行编码
    // console.log(ip_goods[i])
}
function getProId(){
    for (let i=0;i<ip_goods.length;i++){
        //对ip_goods的每一个url元素发送get请求数据
        superagent.get(ip_goods[i]).set('Referer','http://mall.video.qq.com')
        .then(function(res){
            if (JSON.parse(res.text).data.module_result.iErrCode==0){
                // console.log(ip_goods[i])
                let data=JSON.parse(res.text).data.module_result.stModuleData.strJsData
                for (let j=0;j<data.vecProductInfo.length;j++){
                    let proId=data.vecProductInfo[j].strProductId
                    getProdDetail(proId)
                }
                let goodsUrl=ip_goods[i].slice(0,ip_goods[i].length-1)+2
                nextGoodsUrl(goodsUrl)
            }
        })
        .catch(function (reason) {
            console.log('getProId失败：' + reason);
        });
    }
}
function nextGoodsUrl(url){
    superagent.get(url).set('Referer','http://mall.video.qq.com')
    .then(function(res){
        if (JSON.parse(res.text).data.module_result.iErrCode==0){
            let data=JSON.parse(res.text).data.module_result.stModuleData.strJsData
            for (let j=0;j<data.vecProductInfo.length;j++){
                let proId=data.vecProductInfo[j].strProductId
                getProdDetail(proId)
            }
            let times=url.charAt(url.length-1)
            url=url.slice(0,url.length-1)+(parseInt(times)+1)
            nextGoodsUrl(url)
        }
    })
    .catch(function (reason) {
        console.log('nextGoodsUrl失败：' + reason);
    });
}

function getIpId(){
    for (let i=0;i<ip_cat.length;i++){
        //对ip_cat的每一个url元素发送get请求数据
        superagent.get(ip_cat[i]).set('Referer','http://mall.video.qq.com')
        .then(function(res){
            if (JSON.parse(res.text).data.module_result.iErrCode==0){
                // console.log(ip_cat[i])
                let data=JSON.parse(res.text).data.module_result.stModuleData.strJsData
                let ip_num=data.vecIPInfo.length
                for (let j=0;j<ip_num;j++){
                    let currentId=data.vecIPInfo[j].strIPId
                    getIdUrl(IpUrl,currentId)//去获取这个ipid的页面
                }
                //url的下个页面,seq_num+ip_num
                let seq_num=0;//初始值
                nextUrl(i,ip_num,seq_num)          
            }
        })
        .catch(function (reason) {
            console.log('getIpId失败：' + reason);
        });
    }
}
function nextUrl(num,ip_num,seq_num){
    let seq=seq_num
    seq+=ip_num
    //获取下个页面
    superagent.get(ip_cat[num]+seq).set('Referer','http://mall.video.qq.com')
    .then(function(res){
        if (JSON.parse(res.text).data.module_result.iErrCode==0){
            let data=JSON.parse(res.text).data.module_result.stModuleData.strJsData
            //ip_num重新赋值
            ip_num=data.vecIPInfo.length
            if (ip_num){
                for (let j=0;j<ip_num;j++){
                    let currentId=data.vecIPInfo[j].strIPId
                    getIdUrl(IpUrl,currentId)
                }
                nextUrl(num,ip_num,seq) 
            }
        }
    })
    .catch(function (reason) {
        console.log('nextUrl失败：' + reason);
    });
}

function getIdUrl(url,id){
    superagent.get(url+"&ipId="+id).set('Referer','http://mall.video.qq.com')
    .then((res)=>{
        let data=JSON.parse(res.text)
        let $ = cheerio.load(data.html)
        let prodIds=$('span')
        let dataId="data-id"
        if(prodIds[0]){
            for (let i=0;i<prodIds.length;i++){
                if (prodIds[i].attribs[dataId]){
                    let currentProductId=prodIds[i].attribs[dataId]
                    getProdDetail(currentProductId)
                    proId.push(currentProductId)
                }
            }
            let times=url.charAt(url.length-1)
            url=url.slice(0,url.length-1)+(parseInt(times)+1)
            getIdUrl(url,id)
        }
    })
    .catch(function (reason) {
        console.log('getIdUrl失败：' + reason);
    });
}

function getProdDetail(id){
    superagent.get(proUrl+id).set('Referer','http://mall.video.qq.com')
    .then((res)=>{
        let data=res.text
        let $ = cheerio.load(data)
        let prodName=$('.title')[0].childNodes[0].data//商品名
        let prodPrice=$('.price_cur')[0].children[1].childNodes[0].data//商品价格
        let script=$('script')
        let proInfo=""
        for (let i=0;i<script.length;i++){
            if(script[i].parent.attribs.id=="anchor_prodetail"){
                // console.log(script[i].childNodes[0].data)
                var proDetails=script[i].childNodes[0].data
                proDetails=JSON.parse(proDetails)
            }
            if(script[i].parent.attribs["r-component"]=="p-detail"||script[i].parent.attribs.class=="mod_page mod_page_detail"){
                var proInfoData=script[i].childNodes[0].data
                dataObj=JSON.parse(proInfoData)
                if(dataObj.proInfo==null){
                    continue;
                }else{
                    proInfo=JSON.parse(proInfoData)
                }
            }
        }
        let detailPic=proDetails.vecImgDesc
        let proPic=proInfo.proInfo.vecImgUrls//商品图片
        let proIp=proInfo.proInfo.vecIpList[0]//分类ID
        let proId=proInfo.proInfo.strProductId//商品ID
        let proSku=[]//商品款式
        let proObj=proInfo.proInfo.objSkus
        for (const key in proObj) {
            if (proObj.hasOwnProperty(key)) {
                const element = proObj[key];
                let skuNum=element.iQuantity
                let skuId=element.strSKUId
                let skuPic=element.strImgUrl
                let skuPrice=element.uiRealPrice
                let skuType=element.vecProps[0].vecPropValues[0]
                let sku={
                    skuId:skuId,
                    skuNum:skuNum,
                    skuPic:skuPic,
                    skuPrice:skuPrice,
                    skuType:skuType
                }
                proSku.push(sku)
            }
        }
        let product={
            name:prodName,
            price:prodPrice,
            ip:proIp,
            id:proId,
            pic:proPic,
            details:detailPic,
            sku:proSku
        }
        product=JSON.stringify(product)+","
        fs.appendFile("product.json",product,function(err){
            if(err){
                throw err;
            }
            let time=new Date().getTime()
            console.log(time)
        })
    })
    .catch(function (reason) {
        console.log('getProdDetail失败：' + reason);
    });
}
getProId()
getIpId()





// 商城cgi入口,商品用pageNum(1++),分类用seqNum(从0开始按8的倍数增长),设置iPageSize设置展示的内容数量
// data.module_result.iErrCode=0的时候有数据，stModuleData.strJsData.vecProductInfo[].strProdUrl
// http://mall.video.qq.com/cgi/ip_cat?async=1&datakey=emModType%3D7%26emReqType%3D2%26emInnerModReqType%3D9%26iPageSize%3D8%26strId%3D4&context=pageNum%3D0
// data.module_result.iErrcode=0, stModuleData.strJsData.vecIPInfo[].strIPId,   seqNum+=vecIPInfo.length
// http://mall.video.qq.com/cgi/ip_cat?async=1&datakey=emModType%3D8%26emReqType%3D2%26emInnerModReqType%3D5%26iPageSize%3D8%26strId%3D43&context=seqNum%3D0
// 商品详情页：
// http://mall.video.qq.com/detail?proId=10000081
// 分类下的商品页：
// http://mall.video.qq.com/ip_products?ipId=92
// 商品页,pageNum找data-id, \" 替换成 " ,
// html
// http://mall.video.qq.com/ip_products.modlist?pagelet=1&_async=1&strPageContext=pageNum%3D2&ipId=500
// http://mall.video.qq.com/ip_products.modlist?pagelet=1&_async=1&strPageContext=pageNum%3D3&ipId=92

// proInfo.vecImgUrls[]图片
// 