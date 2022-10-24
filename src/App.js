/*global chrome*/
/* */
import logo from './logo.svg';
import { useEffect, useState } from "react";
import './App.css';
const gameId = [
  "roulette",
  "baccarat",
  "blackjack"
];
function App() {
  const getElementByXpath = path => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const sendMessageToTab = async data => await (new Promise(r => chrome.tabs.sendMessage(activeTab, data, response => r(response))));
  const parseId = title => gameId.indexOf([(gameId.filter(value => title.toLowerCase().includes(value.toLowerCase()))[0])][0]);
  const loader = async timestamp => { setLoading(true); await new Promise(r => setTimeout(r, timestamp)); setLoading(false); };
  const log = (src, text) => console.log(src.split(",").map(value => `[${value}]`).join(""), text);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(document.getElementById("test") ? document.getElementById("test").value : "");
  const [firstLoad, setFirst] = useState(true);
  const [activeTab, setActiveTab] = useState(-1);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loopValue0, setLoopValue0] = useState(-1);
  const [view, setView] = useState(null);
  const [lastGame, setLastGame] = useState({
    frame: false,
    game: "",
    id: -1
  });
  useEffect(() => {
    if (activeTab === -1) return;
    console.log("activeTab:", activeTab);
    setLastGame({
      frame: false,
      game: "",
      id: -1
    });
    setInterval(() => {
      if (activeTab < 0) return;
      // var data;
      console.log("XX1");
      chrome.tabs.sendMessage(activeTab, { action: "get-[view-type,tab-status]" }, response => [((response[0].frame && response[0].game.length > 0) || !response[0].frame) && setLastGame(response[0]), (response[1] && response[1].length > 0) && setView(response[1])]);
      // chrome.tabs.sendMessage(activeTab, { action: "get-view-type" }, response => response && setView(response));
    }, 1000);
    (async () => {
      // while (true) {
      //   await new Promise(r => setTimeout(r, 2000));
      // }
    })();
    (async () => {
      // console.log("[Get Status]", await sendMessageToTab({ message: "get-status" }));
    })();
  }, [activeTab]);
  useEffect(() => {
    if (!firstLoad) return;
    setFirst(false);
    loader(1000);
    setInterval(() => {
      console.log("XX0");
      chrome.tabs.query({}, tabs => setActiveTab(tabs.filter(item => item.active)[0].id));
    }, 1000);

    // (async () => {
    //   while (true) {
    //     await new Promise(r => setTimeout(r, 1000));
    //   }
    // })();
  }, [firstLoad]);
  useEffect(() => {
    log("LASTGAME", JSON.stringify(lastGame));
  }, [lastGame]);
  useEffect(() => {
    // console.log("LOOP0");
    // // (async () => {
    // //   if (activeTab < 0) return;
    // //   // var data;
    // //   // chrome.tabs.sendMessage(activeTab, { action: "get-tab-status" }, response => (response.frame && response.game.length > 0) && setLastGame(response));
    // //   // console.log("[Get Status]", );
    // //   await new Promise(r => setTimeout(r, 3000));
    // // })().then(() => setLoopValue0(loopValue0 + (loopValue0 < 1 ? 1 : -1)));
    // (async() => {
    //   while (true) {
    //     await sendMessageToTab({action: "tab-status"});
    //     await new Promise(r => setTimeout(r, 2000));
    //   }
    // })();
    // (async () => {

    // })();
  }, []);
  // setInterval(() => {
  //   chrome.tabs.sendMessage(activeTab, { action: "get-tab-status" }, response => (response.frame && response.game.length > 0) && setLastGame(response));
  // }, 3000);
  useEffect(() => {
    // const interval1 = setInterval(() => {
    //   chrome.tabs.query({}, tabs => setActiveTab(tabs.filter(item => item.active)[0].id));
    // }, 1000);
    // const interval2 = setInterval(() => {
    //   if (activeTab < 0) return;
    //   // var data;
    //   chrome.tabs.sendMessage(activeTab, { action: "get-tab-status" }, response => (response.frame && response.game.length > 0) && setLastGame(response));
    // }, 3000);
    // return () => [clearInterval(interval1), clearInterval(interval2)];
    // console.log("LOOP0");
    // // (async () => {
    // //   // console.log("[Get Status]", );
    // //   await new Promise(r => setTimeout(r, 3000));
    // // })().then(() => setLoopValue1(loopValue1 + (loopValue1 < 1 ? 1 : -1)));
    // (async() => {
    //   while (true) {
    //     await sendMessageToTab({action: "tab-status"});
    //     await new Promise(r => setTimeout(r, 2000));
    //   }
    // })();
    // (async () => {

    // })();
  }, []);

  return (
    <div className="App">

      <div className="status">
        {
          loading ? (
            <div className="loader-circle">
              <div id="block"></div>
            </div>
          ) : (
            !lastGame.frame && (
              <div>
                <div className="loader">
                  <div id="_a1"></div>
                  <div id="_a2"></div>
                  <div id="_a3"></div>
                  <div id="_a4"></div>
                </div>
                <div className="text">
                  <a>Waiting for <strong id="provider">Evolution Gaming</strong> frame..</a>
                  {/* <button onClick={async() =>  console.log("[Click]", await sendMessageToTab({message: "click", order: ["0", "36", "25"]}))}>SEND CLICK</button>
                  <button onClick={async() =>  console.log("[XPATH Click]", await sendMessageToTab({message: "click-xpath", xpath: `//button[@data-role="favorite-bets-button"]`}))}>CLICK XPATH</button>
                  <button onClick={async() =>  console.log("[Get Status]", await sendMessageToTab({message: "get-status"}))}>GET STATUS</button> */}
                </div>
              </div>)
          )
        }
      </div>
      {
        lastGame.frame && (
          <div className='main'>
            <div className='top'>
              <a id="playing">Currently playing <a id="gameName">{gameId[lastGame.id][0].toUpperCase() + gameId[lastGame.id].slice(1)}</a> in the lobby <a id="gameLobby">{lastGame.game}</a>.</a>
              <a>View is: {view}</a>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default App;
