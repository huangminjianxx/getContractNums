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
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://mrgneubpglkrwybppaik.supabase.co'
const supabaseKey = '' 

const supabase = createClient(supabaseUrl, supabaseKey)
let lastTime = ''
const main = async () => {
    try {
        const priceApiUrl = `https://fapi.binance.com/fapi/v1/openInterest?symbol=INJUSDT`
        const listArr = await axios.get(priceApiUrl,config);
        console.log('======',listArr.data)
            lastTime = String(listArr.data.time)
            const str = `${JSON.stringify(listArr.data)}====\n\r`
            console.log('======',new Date(listArr.data.time).toISOString())
            const { data, error, count } = await supabase
            .from('injContractNums')
            .insert([
                { 
                    nums: listArr.data.openInterest,
                    price: 25,
                    time:new Date(listArr.data.time).toISOString()
                }
            ])
            .select();
            console.log('======',2)
            console.log('=====',data, error, count)
            if (error) {
                console.error('错误详情:', {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint
                })
              } else if (!data || data.length === 0) {
                console.log('⚠️ 没有报错，但也没有返回数据')
              } else {
                console.log('✅ 插入成功，返回数据:', data)
              }
            // fs.appendFile("record.txt",str,(err) => {
        
            // })
    } catch (error) {
        
    }
   
}
// setInterval(main,1000)
main()
   
