const axios = require('axios');
const puppeteer = require('puppeteer-core');

var wsurl;
var browser;
const selector = '#player > div.list-tab_root__3kdJW > div.list-tab-content_root__3VPeD > div > div.list-song-items_root__w-FSn > div:nth-child(1) > div > div > div.grid_item__UrYe7.list-song-item_root__WY7td.list-song-item_active__26dq0';
var result;



module.exports = {
    getName: async function(){
        //  Get websocket url,
        await axios.get("http://localhost:8888/json/version").then(response=>{wsurl = JSON.parse(JSON.stringify(response.data))['webSocketDebuggerUrl'];}); //  I know this isn't good to see.
        //  and connect!
        browser = await puppeteer.connect({browserWSEndpoint: wsurl});

        await browser.pages()
        .then(async(MainPage)=>{

            await MainPage[0].setViewport({width: 1280, height: 720}); //   Whether I use this, or not, there is a resolution problem

            const t = await MainPage[0].$eval(selector, title => title.innerText);
            result = (t.replace("체크박스","").trim())
        })
        return(result)
    }
};