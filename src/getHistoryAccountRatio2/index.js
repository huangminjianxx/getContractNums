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


let coinListArr = []
function generateHourlyIntervalsFrom(startDateStr = '2025-12-20 00:00:00') {
    const start = new Date(startDateStr);
    const now = new Date('2026-01-15T20:00:00');
    
    // 确保开始时间是整点
    start.setMinutes(0, 0, 0);
    
    const intervals = [];
    let current = new Date(start);
    
    while (current < now) {
        const nextHour = new Date(current);
        nextHour.setHours(current.getHours() + 1);
        
        intervals.push([
            current.getTime(),
            nextHour.getTime()
        ]);
        
        current = nextHour;
    }
    
    return intervals;
}
coinListArr = generateHourlyIntervalsFrom('2025-12-20 00:00:00');
const coinListArrLength = coinListArr.length


const main = async (newCoin) => {
    const coin = String(newCoin).toUpperCase()
    try {
        for(let i=0;i<coinListArrLength;i++){
            const contractNumsUrl = `https://fapi.binance.com/futures/data/openInterestHist?symbol=${coin}USDT&period=30m&startTime=${coinListArr[i][0]}&endTime=${coinListArr[i][1]}`
            const contractNumsData = await axios.get(contractNumsUrl,config);
            console.log('====',contractNumsData.data)
            if(contractNumsData && contractNumsData.data && contractNumsData.data.length){
                const { sumOpenInterest , sumOpenInterestValue , timestamp  , symbol} = contractNumsData.data[0]
                const priceUrl = `https://data-api.binance.vision/api/v3/avgPrice?symbol=${coin}USDT`
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
                console.log(`====${coin}执行完成`)
            }
        }
    } catch (error) {
        console.log('=====',error)
    }
   
}


const newList = ['ondo','fil','pyth']

const start = async () => {
    for(let i=0;i<newList.length;i++){
        await main(newList[i])
    }
}
start()

// setInterval(main,300000)


   
