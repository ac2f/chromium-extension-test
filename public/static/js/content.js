/*global chrome*/
var wsc;
const fStr = "/*fStr000*/";
const iStr = "/*iStr000*/";
const gameId = [
    "roulette",
    "baccarat",
    "blackjack"
];

var _xpath = {
    iframe: `//*[contains(@src, "https://babylonstk.evo-games.com")]`,
    gameName: `//div[contains(@class, "tableInfoContainer")]/div[1]/span`,
    lastNumber: `//div[contains(@class,"recent-numbers") or contains(@class, "recentNumbers")]/div/div[${iStr}]//span[contains(@class, "value")]`,
    viewImmersive: `//div[@data-role="current-view-immersivev2"]`,
    viewClassic: `//div[@data-role="current-view-classic"]`,
    viewImmersive__Status: `//div[contains(@class, "timerAndResult")]/div`,
    viewClassic__Status: `//div[@data-role="status-text"][contains(text(), "BETS") or contains(text(), "BLACK") or contains(text(), "GREEN") or contains(text(), "RED")]`
};
var lastStatus = "";
var currentGame = {
    frame: false,
    game: "",
    id: -1
};
var numbers = [];
var view = "";
const getElementByXpath = xpath => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const xpath = (k, i = 1, d = "iframe") => _xpath[k].replace(fStr, _xpath[d] + "//").replace(iStr, i + "");
const parseId = title => gameId.indexOf([(gameId.filter(value => title.toLowerCase().includes(value.toLowerCase()))[0])][0]);
const log = (src, text) => console.log(src.split(",").map(value => `[${value}]`).join(""), text);
const sendToWS = data => wsc && wsc.send(JSON.stringify(data));
const actions = async message => {
    
};
// var wssConnectionTries = 0;
(() => {
    if (!wsc) {
        try {
            log("WSS", "WSS not set! Connecting port 30105..");
            wsc = new WebSocket(`ws://localhost:30105`);
            wsc.onopen = () => {
                log("WSS", "WSS opened! Waiting for data..");
            };
            wsc.onmessage = request => {
                var data = JSON.parse(request.data)
                log("WSS", `WSS sent data: ${data}`);
                log(`WSS,RESPONSE`, `${data.action}`);
                if (data.action === "get-[view-type,tab-status]") {
                    // log(`WSS,RESPONSE`, `${data.action}`);
                    wsc.send(JSON.stringify({ currentGame: currentGame, view: view }));
                }
                if (data.action === "get-numbers") {
                    // log(`WSS,RESPONSE`, `${data.action}`);
                    wsc.send(JSON.stringify({numbers: numbers}));
                }
                if (data.action === "get-view-type") {
                    // log(`WSS,RESPONSE`, `${data.action}`);
                    // console.log(`RESPONSE,${data.action}`, view);
                    wsc.send(JSON.stringify({view: view}));
                }
                // wsc.send(actions());
            };
            wsc.onclose = () => [log("WSS", "WSS closed!"), alert("Failed to connect to program. Program might not be running or firewall blocks the connection.")];
            wsc.onerror = error => console.log(error);
        } catch (error) {
            ["Connection to program has closed! You must run the application and reload the page."].map(value => [log("WSS", value), alert(value)]);
            // log("WSS", "Failed to connect to program. Program might not be running or firewall blocks the connection.");
        }
    }
})();
setInterval(() => (async () => {
    // var x = getElementByXpath(xpath("iframe"));
    // !frameExist && log("FRAMECHECK", "Checking..");
    // if (!!x) {
    //     !frameExist && log("FRAMECHECK", "Frame exist!");
    //     // log("FRAMECHECK", `Frame exist 0: ${frameExist}`);
    //     log("FRAMECHECK", `--- Frame exist: ${currentGame.frame}`);
    // console.log("999999993123 - 1");
    var tmpText = getElementByXpath(xpath("gameName"));
    if (tmpText) {
        // console.log("999999993123 - 2", tmpText, xpath("gameName"), "q");
        if (tmpText.textContent.length > 0 && currentGame.game !== tmpText.textContent) {
            currentGame.game = tmpText.textContent;
            currentGame.id = parseId(tmpText.textContent);
            currentGame.frame = currentGame.id >= 0;
        }
        // console.log(`SET: ${JSON.stringify(currentGame)}`);
        return;
    }
    currentGame = {
        frame: false,
        game: "",
        id: -1
    };
    // } else {
    //     log("FRAMECHECK", "Xpath not exist!");
    //     currentGame.frame = false;
    //     frameExist = false;
    // }
    // localStorage.setItem("currentGame", JSON.stringify(currentGame));
})().then(res => res), 3000);
setInterval(() => (async () => {
    if (!currentGame.frame || currentGame.id !== parseId("roulette")) return;
    var tmpArr = [];
    var max = 6;
    for (let index = 1; index <= max; index++) {
        var lastNumberElement;
        while (true) {
            lastNumberElement = getElementByXpath(xpath("lastNumber", index));
            if (lastNumberElement && lastNumberElement.textContent.length > 0) break;
            await new Promise(r => setTimeout(r, 100));
        }
        var value = lastNumberElement.textContent;
        tmpArr.push(value);
        await new Promise(r => setTimeout(r, 100));
    }
    if (numbers !== max) numbers = tmpArr;
    // else numbers[0] = tmpArr[0];
})().then(res => res), 1000);
setInterval(() =>
    (async () => {
        var _view = view;
        if (!currentGame.frame) return;
        // log("FRAMECHECK,GAMETYPE", "Checking if view is classic or immersive..");
        var isClassicView = false;
        if (!!getElementByXpath(xpath("viewClassic"))) {
            // _view !== "classic" && log("FRAMECHECK,GAMETYPE", "View is classic.");
            view = "classic";
            isClassicView = true;
        } else if (!!getElementByXpath(xpath("viewImmersive"))) { view = "immersive"; } else {
            !isClassicView && log("FRAMECHECK,GAMETYPE", "Couldn't detect view. Retrying..");
            return;
        }
        // _view !== "immersive" && !isClassicView && log("FRAMECHECK,GAMETYPE", "View is immersive.");
        view !== _view && log("FRAMECHECK,GAMETYPE", `View is ${isClassicView ? "Classic" : "Immersive"}.`);
        if (!!getElementByXpath(xpath(isClassicView ? "viewClassic__Status" : "viewImmersive__Status"))) {
            // log("FRAMECHECK,GAMETYPE", `Status is accessable for the ${isClassicView ? "Classic" : "Immersive"} view.`);

            // log("FRAMECHECK,GAMETYPE", `Fetched last numbers ${numbers.join("")}`);
        }
    })().then(res => res)
    , 1500);
const messagesFromReactAppListener = async (message, sender, response) => {
    // console.log('[content.js]. Message received', {
    //     message,
    //     sender,
    // });
    var INDEX = 1;
    var lastNumberXpath = `//div[contains(@class, " recent-number--") and contains(@class, "numbers")]/div[${INDEX}]//span`;
    var currentClickNumber = 36;
    var statusXpath = `//div[contains(@data-role,"status-text")]`;
    if (sender.id === chrome.runtime.id) {
        log("REQUEST", message.action);
        log(`RESPONSE`, `${message.action}`);
        if (message.action === "get-tab-status") {
            // log(`RESPONSE`, `${message.action}`);
            // var data = JSON.parse(localStorage.getItem("currentGame"));
            response({currentGame: currentGame});
        }
        if (message.action === "get-view-type") {
            // log(`RESPONSE`, `${message.action}`);
            response({view: view});
        }
        if (message.action === "get-[view-type,tab-status]") {
            // log(`RESPONSE`, `${message.action}`);
            response({ currentGame: currentGame, view: view });
        }
        if (message.action === "get-numbers") {
            // log(`RESPONSE`, `${message.action}`);
            response({numbers: numbers});
        }
        if (message.action === "get-status") {
            // var status = getElementByXpath(statusXpath);
            // status = status ? status.textContent : lastStatus;
            // // status !== lastStatus &&
            // response(status ?? lastStatus);
            // console.log("[SENT]", String(status ?? lastStatus));
            // lastStatus = status;
        }
        if (message.action === "click") {
            var order = message.order;
            for (let index = 0; index < order.length; index++) {
                var element = await getElementByXpath(`//*[@class="classicStandard-wrapper"]/*[@data-bet-spot-id="${order[index]}"]`);
                if (!element) continue;
                // element.addEventListener("click", () => {console.log("click event");});
                // var ev = new MouseEvent('click');
                // var el = document.elementFromPoint(x, y);
                // console.log(el); //print element to console
                try {
                    // var x = element.dispatchEvent(ev);
                    await new Promise(r => setTimeout(r, 1000));
                    // element.click();
                    // element.addEventListener('click', () => { });
                    element.dispatchEvent(new Event('click'));
                    // element.click();
                    // element.
                } catch (error) {
                    if (String(error).includes("not a function"))
                        console.log("ERR:", error, getElementByXpath(`//*[@class="classicStandard-wrapper"]/*[@data-bet-spot-id="${order[index]}"]`));
                    else console.log(element ? element[0] : String(element));
                }
            }
            console.log("[SENT] OK");
            response("OK");
        }
        if (message.action === "click-xpath") {
            var element = await getElementByXpath(message.xpath);
            if (element === null || element === undefined) { response("Invalid XPATH!"); }
            else if (element) {
                var ev = new Event("click");
                console.log("[XPATH]", message.xpath);
                element.click();
                response("OK CLICKED XPATH!");
            }
        }
    }
};
/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
