//获取合约多空持仓比
const path = require('path');
require('dotenv').config({ 
  path: path.join(__dirname, '../../', '.env') 
});
const axios = require('axios');
const {HttpsProxyAgent} = require('https-proxy-agent');
const config = {
    httpsAgent: new HttpsProxyAgent('http://127.0.0.1:7890'),
    headers:{
        "X-MBX-APIKEY": '',
    },
}
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://mrgneubpglkrwybppaik.supabase.co'
const supabase = createClient(supabaseUrl, process.env.supabaseKey)

const coinListArr = ['btc','eth','bnb','inj']
const coinListArrLength = coinListArr.length

const main = async () => {
    try {
        for(let i=0;i<coinListArrLength;i++){
            const contractNumsUrl = `https://fapi.binance.com/fapi/v1/openInterest?symbol=${coinListArr[i].toUpperCase()}USDT`
            const contractNumsData = await axios.get(contractNumsUrl,config);
            const { time, openInterest } = contractNumsData.data
            const priceUrl = `https://data-api.binance.vision/api/v3/avgPrice?symbol=${coinListArr[i].toUpperCase()}USDT`
            const priceData = await axios.get(priceUrl)
            const { price } = priceData.data
            const { data, error, count } = await supabase
            .from(`${coinListArr[i]}ContractNums`)
            .insert([
                { 
                    nums: openInterest,
                    price: price,
                    time:new Date(time).toISOString()
                }
            ])
            .select();
            if(error){
                console.log('=====数据库error',error)
            }
            console.log(`====${coinListArr[i]}执行完成`)
        }
    } catch (error) {
        console.log('=====',error)
    }
   
}
main()
setInterval(main,180000)
   
