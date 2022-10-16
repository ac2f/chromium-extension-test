/*global chrome*/
import logo from './logo.svg';
import {useEffect, useState} from "react";
// import { ChromeMessage, Sender } from "./types";
import './App.css';

function App() {
  const getElementByXpath = path => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const sendMessageToTab = async data => await (new Promise (r=>chrome.tabs.sendMessage(activeTab, data, response => r(response))));
  const [value, setValue] = useState(document.getElementById("test") ? document.getElementById("test").value :  "");
  const [first, setFirst] = useState(true);
  const [activeTab, setActiveTab] = useState(-1);
  useEffect(() => {
    if (activeTab === -1) return;
    console.log("activeTab:", activeTab);
    // chrome.tabs.sendMessage(activeTab, {message: "get-status"}, response => console.log("Response:", response));
    (async () => {
      console.log("[Get Status]", await sendMessageToTab({message: "get-status"}));
    })();
    // chrome.tabs.sendMessage(activeTab, {from: "react", message: "delete logo"}, response => console.log("Response:", response));
  }, [activeTab]);
  useEffect(() => {
    if (!first) return;
    setFirst(false);
    (async() => {
      while (true) {
        chrome.tabs.query({}, tabs => setActiveTab(tabs.filter(item => item.active)[0].id));
        if (activeTab > -1) {
          console.log("[Get Status]", await sendMessageToTab({message: "get-status"}));
        }
        // setValue(String.toString(chrome.prototype));
        // setValue(chrome.app.toString());
        // chrome.runtime..addListener(function (msg, sender, sendResponse) {
        //   console.log(msg, sender, sendResponse);
        // });
        // chrome.logMessage("chrome");
        // setValue(document.getElementById("text") ? document.getElementById("text").innerText : "NOTFOUND");
        // setValue(window.location.href);
        await new Promise(r => setTimeout(r, 5000));
      }
    })();
  }, [first]);
  return (
    <div className="App">
    <div className="status">
      <div className="loader">
        <div id="_a1"></div>
        <div id="_a2"></div>
        <div id="_a3"></div>
        <div id="_a4"></div>
      </div>
      <div className="text">
        <a>Waiting for Evolution Gaming frame</a>
        <button onClick={async() =>  console.log("[Click]", await sendMessageToTab({message: "click", order: ["0", "36", "25"]}))}>SEND CLICK</button>
        <button onClick={async() =>  console.log("[XPATH Click]", await sendMessageToTab({message: "click-xpath", xpath: `//button[@data-role="favorite-bets-button"]`}))}>CLICK XPATH</button>
        <button onClick={async() =>  console.log("[Get Status]", await sendMessageToTab({message: "get-status"}))}>GET STATUSL</button>
      </div>
    </div>
    <div className="frame">
      <a id="test">{value}</a>
    </div>
    {/* <iframe src='https://stake.com' width={"500px"} height={"500px"}/> */}
    </div>
  );
}

export default App;
