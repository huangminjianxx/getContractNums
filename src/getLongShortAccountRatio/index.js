//获取合约多空持仓比
const axios = require('axios');
const {HttpsProxyAgent} = require('https-proxy-agent');
const config = {
    httpsAgent: new HttpsProxyAgent('http://127.0.0.1:7890'),
    headers:{
        "X-MBX-APIKEY": '',
    },
}
const moment = require('moment');
const fs = require("fs")
let lastTime = ''
const main = async () => {
    try {
        const priceApiUrl = `https://fapi.binance.com/fapi/v1/openInterest?symbol=INJUSDT`
        const listArr = await axios.get(priceApiUrl,config);
        console.log('======',listArr.data)
        if(String(listArr.data.time) !== lastTime){
            lastTime = String(listArr.data.time)
            const str = `${JSON.stringify(listArr.data)}====\n\r`
            fs.appendFile("record.txt",str,(err) => {
        
            })
        }
    } catch (error) {
        
    }
   
}
setInterval(main,60000)
   
