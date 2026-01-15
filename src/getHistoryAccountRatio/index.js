//获取合约多空持仓比
const path = require('path');
require('dotenv').config({ 
  path: path.join(__dirname, '../../', '.env') 
});
const axios = require('axios');
const {HttpsProxyAgent} = require('https-proxy-agent');
const isLocal = process.env.NODE_ENV === 'development' || 
                process.env.ENVIRONMENT === 'development';
const config = isLocal ? {
    httpsAgent: new HttpsProxyAgent('http://127.0.0.1:7890'),
    headers:{
        "X-MBX-APIKEY": '',
    },
} : {
    
};
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://mrgneubpglkrwybppaik.supabase.co'
const supabase = createClient(supabaseUrl, process.env.supabaseKey)

const coinListArr = ['btc','eth','bnb','inj']
const coinListArrLength = coinListArr.length

const main = async () => {
    try {
        for(let i=0;i<coinListArrLength;i++){
            const contractNumsUrl = `https://fapi.binance.com/futures/data/openInterestHist?symbol=${coinListArr[i].toUpperCase()}USDT&period=5m&startTime=${Date.now() - 300000}&endTime=${Date.now()}`
            const contractNumsData = await axios.get(contractNumsUrl,config);
            const { sumOpenInterest , sumOpenInterestValue , timestamp  , symbol} = contractNumsData.data[0]
            console.log('=====',contractNumsData.data)
            const priceUrl = `https://data-api.binance.vision/api/v3/avgPrice?symbol=${coinListArr[i].toUpperCase()}USDT`
            const priceData = await axios.get(priceUrl)
            const { price } = priceData.data
            const { data, error, count } = await supabase
            .from('openContractHistory')
            .insert([
                { 
                    nums: sumOpenInterest, 
                    price: price,
                    numsValue:sumOpenInterestValue,
                    time:new Date(timestamp).toISOString(),
                    symbol:symbol
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
setInterval(main,300000)
   
