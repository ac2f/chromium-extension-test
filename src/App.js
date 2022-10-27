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
  const [lastNumberTimestamp, setLastNumberTimestamp] = useState(17347346);
  const [lastNumbers, setLastNumbers] = useState([6,12,0,3, 33,36]);
  const parseColor = num => [parseInt(num.toString())].map(value => value > -1 && value < 37)[0] ? (num.toString() === "0" ? "green" : "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36".split(",").includes(num.toString()) ? "red" : "black") : null;
  const [intervals, setIntervals] = useState({
    roulette: [],
    baccarat: [],
    blackjack: []
  });
  const [view, setView] = useState("immersive");
  const [lastGame, setLastGame] = useState({
    frame: false,
    game: "",
    id: -1
  });
  useEffect(() => {
    setLastGame({ frame: true, game: "roulette", id: 0 });
    if (activeTab < 0) return;
    console.log("activeTab:", activeTab);
    setLastGame({
      frame: false,
      game: "",
      id: -1
    });
    setInterval(() => {
      if (activeTab < 0) return;
      // var data;
      // console.log("XX1");
      chrome.tabs && chrome.tabs.sendMessage(activeTab, { action: "get-[view-type,tab-status]" }, response => [((response[0].frame && response[0].game.length > 0) || !response[0].frame) && setLastGame(response[0]), (response[1] && response[1].length > 0) && setView(response[1])]);
      // chrome.tabs.sendMessage(activeTab, { action: "get-view-type" }, response => response && setView(response));
    }, 1000);
    setInterval(() => {
      if (activeTab < 0) return;
      // var data;
      // console.log("XX2");
      chrome.tabs && chrome.tabs.sendMessage(activeTab, { action: "get-numbers" }, response => [(response && response.length > 0 && response !== lastNumbers) && setLastNumbers(response)]);
      // chrome.tabs.sendMessage(activeTab, { action: "get-view-type" }, response => response && setView(response));
    }, 300);
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
      // console.log("XX0");
      chrome.tabs && chrome.tabs.query({}, tabs => setActiveTab(tabs.filter(item => item.active)[0].id));
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
              <div className='playing'>
                <a id="l">Playing <a id="hint">{gameId[lastGame.id][0].toUpperCase() + gameId[lastGame.id].slice(1)}</a></a>
                <a id="r"><a id="hint">{lastGame.game}</a></a>
              </div>
            </div>
            <div className='content'>
              <a id="text">Last numbers</a>
              <div className='lastNumbers'>
                {lastNumbers.map((value, index) => <a id={parseColor(value)} className={index < lastNumbers.length -1 ? `_${index}` : "_last"}>{value}</a>)}
              </div>
              <a id="dt">Last update was at <a id="date">{[new Date(lastNumberTimestamp)].map(value => `${value.toLocaleDateString("en-US")} ${value.toLocaleTimeString("en-US")}`)}</a></a>
            </div>
            <div className='bottom'>
              { view.length > 0 && <a><a id="hint">{view[0].toUpperCase() + view.slice(1)}</a> view</a>}

            </div>
          </div>
        )
      }
    </div>
  );
}

export default App;
