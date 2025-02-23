document.getElementById('startBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "startListening" });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "stopListening" });
});

document.getElementById('helpBtn').addEventListener('click', () => {
  alert(`Available commands:
  - Scroll up/down
  - Go back/forward
  - Open new tab
  - Search for [query]
  - Search Google for [query]
  - Click [button text]
  - Zoom in/out
  - Refresh
  - Close tab`);
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "listeningOn") {
      document.getElementById('status').textContent = "Listening...";
  } else if (request.action === "listeningOff") {
      document.getElementById('status').textContent = "Stopped";
  }
});
