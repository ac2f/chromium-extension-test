/*global chrome*/
/* */
import logo from './logo.svg';
import { useEffect, useState } from "react";
import './App.css';

function App() {
  const getElementByXpath = path => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const sendMessageToTab = async data => await (new Promise(r => chrome.tabs.sendMessage(activeTab, data, response => r(response))));
  const loader = async timestamp => { setLoading(true); await new Promise(r => setTimeout(r, timestamp)); setLoading(false); };
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(document.getElementById("test") ? document.getElementById("test").value : "");
  const [firstLoad, setFirst] = useState(true);
  const [activeTab, setActiveTab] = useState(-1);
  const [selectedGame, setSelectedGame] = useState(null);
  useEffect(() => {
    if (activeTab === -1) return;
    console.log("activeTab:", activeTab);
    (async () => {
      console.log("[Get Status]", await sendMessageToTab({ message: "get-status" }));
    })();
  }, [activeTab]);
  useEffect(() => {
    if (!firstLoad) return;
    setFirst(false);
    (async() => {
      while (true) {
        await sendMessageToTab({action: "tab-status"});
        await new Promise(r => setTimeout(r, 1000));
      }
    })();
    loader(1000);
    // (async () => {

    // })();
  }, [firstLoad]);
  (async() => {
    while (true) {
      chrome.tabs.query({}, tabs => setActiveTab(tabs.filter(item => item.active)[0].id));
      await new Promise(r => setTimeout(r, 1000));
    }
  })();
  (async() => {
    while (true) {
      if (activeTab > -1)
        console.log("[Get Status]", await sendMessageToTab({ message: "get-status" }));
      await new Promise(r => setTimeout(r, 1000));
    }
  })();

  return (
    <div className="App">

      <div className="status">
      {
        loading ? (
          <div className="loader-circle">
            <div id="block"></div>
          </div>
        ) : (
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
          </div>
        )
      }
      </div>
    </div>
  );
}

export default App;
