//    Using event emmit. (Better)
//    This must be the main module to be effective

const axios = require('axios');
const puppeteer = require('puppeteer-core');
const EventEmitter = require('events');
const RPC = require('discord-rpc');
const rpc = new RPC.Client({ transport: 'ipc' });

class MyEmitter extends EventEmitter {}
const Event = new MyEmitter();

const clientId = '735795539874021503';
var browser;
const titleSelector = '#player > div.list-tab_root__3kdJW > div.list-tab-content_root__3VPeD > div > div.list-song-items_root__w-FSn > div:nth-child(1) > div > div > div.grid_item__UrYe7.list-song-item_root__WY7td.list-song-item_active__26dq0';
const nowSelector = '#player > div.player-progress_root__385z8 > div.player-progress_progressStatus___zfQb > span.player-progress_playTime__3FdbG';
//    If we can get css, maybe get the selector automatically.



async function init(){

    var wsurl;
    
    //  Get websocket url,
    await axios.get("http://localhost:8888/json/version").then(response=>{wsurl = JSON.parse(JSON.stringify(response.data))['webSocketDebuggerUrl'];}); //  I know this isn't good to see.
    //  and connect!
    browser = await puppeteer.connect({browserWSEndpoint: wsurl});

    rpc.login({clientId: clientId}); //     Discord rpc login

}

async function getName(){       //      Work well, need to make some exceptions

    var res;

    await browser.pages()
    .then(async(MainPage)=>{
    
        await MainPage[0].setViewport({width: 1280, height: 720}); //   Whether use this codes, or not, there is a resolution problem.    We can adjust resolution, but weird.
    
        var title_singer = await MainPage[0].$eval(titleSelector, title => title.innerText);    // Title and singer selector.
        title_singer = title_singer.replace("체크박스","").trim();
        const title = title_singer.split('\n')[0];                                          // Title
        const singer = title_singer.split('\n')[2];                                         // Singer
        const now = await MainPage[0].$eval(nowSelector, _now => _now.innerText);           // Duration
        res = {
                title: title,
                singer: singer,
                now: now,
                }
        });

    return(res);
    
}


init().then(()=>{               //      Initialize, then emit an event.

    setInterval(() => {

        getName().then((data) => {

            Event.emit('parsed', data);

        });

    }, 500);

});

Event.on('parsed', (data) => {
    rpc.setActivity({               //      Isn't there a way to change the state to 'Listening'?
        details: data['title'],
        state: data['singer'],
        startTimestamp: new Date(), //      Must be fixed.
        largeImageKey: "logo",
        largeImageText: data['title']
    })
});

/*
export interface Presence {
    state?: string;
    details?: string;
    startTimestamp?: number | Date;
    endTimestamp?: number | Date;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    instance?: boolean;
    partyId?: string;
    partySize?: number;
    partyMax?: number;
    matchSecret?: string;
    spectateSecret?: string;
    joinSecret?: string;
    buttons?: Array<{ label: string, url: string }>;
}
*/