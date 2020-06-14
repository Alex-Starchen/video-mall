const fs=require('fs')
const path=require('path')
fs.readFile('product.json',function(err,data){
    if(err){
        console.log(err)
    }
    let result=data.toString()
    result=result.substring(0,result.length-1)
    let str="["+result+"]"
    str=JSON.parse(str)
    let json=JSON.stringify(str,null,"\t")
    fs.writeFileSync("goods.json",json);
    console.log("finished")
})
