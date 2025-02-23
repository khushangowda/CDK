let recognition;
let isListening = false;
let lastCommandTime = 0;
const COMMAND_DELAY = 500;

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "startRecognition") startRecognition();
    else if (request.action === "stopRecognition") stopRecognition();
});

function startRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Web Speech API is not supported in this browser.');
        return;
    }
    if (isListening) return;

    isListening = true;
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log('Voice recognition started.');
        showMicOverlay();
        showCommandOverlay("Listening...");
    };

    recognition.onresult = (event) => {
        const now = Date.now();
        if (now - lastCommandTime < COMMAND_DELAY) return;
        lastCommandTime = now;

        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Voice Command:", transcript);
        showCommandOverlay(transcript); // Show command on screen
        processCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
        alert("Voice recognition error: " + event.error);
        stopRecognition();
    };

    recognition.onend = () => {
        console.log('Voice recognition stopped.');
        hideMicOverlay();
        hideCommandOverlay();
        isListening = false;
    };

    recognition.start();
}

function stopRecognition() {
    if (recognition) recognition.stop();
    hideMicOverlay();
    hideCommandOverlay();
}

// Function to display mic overlay
function showMicOverlay() {
    if (document.getElementById('mic-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mic-overlay';
    overlay.innerHTML = `<img src="${chrome.runtime.getURL('icons/mic-on-128.png')}" alt="Mic On" style="width: 100%; height: 100%;">`;

    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.right = '20px';
    overlay.style.width = '60px';
    overlay.style.height = '60px';
    overlay.style.zIndex = '10000';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.borderRadius = '50%';
    overlay.style.padding = '10px';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    document.body.appendChild(overlay);
}

// Function to hide mic overlay
function hideMicOverlay() {
    const overlay = document.getElementById('mic-overlay');
    if (overlay) overlay.remove();
}

// Function to show recognized command on screen
function showCommandOverlay(text) {
    let commandOverlay = document.getElementById('command-overlay');

    if (!commandOverlay) {
        commandOverlay = document.createElement('div');
        commandOverlay.id = 'command-overlay';

        commandOverlay.style.position = "fixed";
        commandOverlay.style.bottom = "120px";
        commandOverlay.style.left = "50%";
        commandOverlay.style.transform = "translateX(-50%)";
        commandOverlay.style.padding = "10px 20px";
        commandOverlay.style.borderRadius = "10px";
        commandOverlay.style.background = "rgba(0, 0, 0, 0.8)";
        commandOverlay.style.color = "#fff";
        commandOverlay.style.fontSize = "18px";
        commandOverlay.style.fontWeight = "bold";
        commandOverlay.style.textAlign = "center";
        commandOverlay.style.maxWidth = "80%";
        commandOverlay.style.zIndex = "10000";

        document.body.appendChild(commandOverlay);
    }

    commandOverlay.innerText = text;

    setTimeout(() => {
        hideCommandOverlay();
    }, 3000);
}

// Function to hide command overlay
function hideCommandOverlay() {
    const commandOverlay = document.getElementById('command-overlay');
    if (commandOverlay) commandOverlay.remove();
}

// Process voice commands
function processCommand(command) {
    if (command.includes("go to")) {
        const pageText = command.replace("go to", "").trim();
        navigateToText(pageText);
    } else if (command.includes("click") || command.includes("press")) {
        const buttonName = command.replace("click", "").replace("press", "").trim();
        clickButton(buttonName);
    } else if (command.includes("scroll down")) {
        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    } else if (command.includes("scroll up")) {
        window.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
    } else if (command.includes("go back")) {
        window.history.back();
    } else if (command.includes("go forward")) {
        window.history.forward();
    } else if (command.includes("open new tab")) {
        chrome.runtime.sendMessage({ action: "openNewTab" });
    } else if (command.includes("search for")) {
        const query = command.split("search for")[1]?.trim();
        if (query) searchOnPage(query);
    } else if (command.includes("search google for")) {
        const query = command.split("search google for")[1]?.trim();
        if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } else if (command.includes("zoom in")) {
        document.body.style.zoom = (parseFloat(document.body.style.zoom) || 1) + 0.1;
    } else if (command.includes("zoom out")) {
        document.body.style.zoom = (parseFloat(document.body.style.zoom) || 1) - 0.1;
    } else if (command.includes("refresh") || command.includes("reload")) {
        window.location.reload();
    } else if (command.includes("close tab")) {
        chrome.runtime.sendMessage({ action: "closeTab" });
    } else if (command.includes("guide")) {
        console.log("Opening guide modal...");
        showGuideModal();
    }
    else if (command.includes("close") || command.includes("close guide")) {
        console.log("Closing guide modal...");
        closeGuideModal();
    }
    
    else {
        console.log("Unrecognized command:", command);
        speakFeedback("Sorry, I didn’t understand that command.");
    }
    
}

// Navigate to links by spoken text
function navigateToText(text) {
    const links = document.querySelectorAll("a");
    for (let link of links) {
        if (link.innerText.toLowerCase().includes(text.toLowerCase())) {
            console.log(`Navigating to: ${link.innerText}`);
            link.click();
            return;
        }
    }
    console.log("Link not found:", text);
    speakFeedback(`Link with text "${text}" not found.`);
}

// Click buttons by spoken text
function clickButton(buttonText) {
    const buttons = document.querySelectorAll("button, input[type='submit']");
    for (let button of buttons) {
        if (button.innerText.toLowerCase().includes(buttonText.toLowerCase())) {
            button.click();
            return;
        }
    }
    console.log("Button not found:", buttonText);
    speakFeedback(`Button with text "${buttonText}" not found.`);
}

// Search for text inside a page
function searchOnPage(query) {
    const input = document.querySelector("input[type='text'], input[type='search']");
    if (input && input.offsetParent !== null) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    } else {
        console.log("No visible search bar found.");
        speakFeedback("No search bar found on this page.");
    }
}

// Text-to-speech feedback
function speakFeedback(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
}
function showGuideModal() {
    // Avoid creating multiple modals
    if (document.getElementById('guide-modal')) return;

    // Create the modal container
    const modal = document.createElement('div');
    modal.id = 'guide-modal';
    Object.assign(modal.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        backgroundColor: 'white',
        zIndex: '10000',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        padding: '0'
    });

// Create a close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    Object.assign(closeBtn.style, {
            position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#f44336',
        color: '00c410',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: '10001'
    });
    closeBtn.onclick = () => modal.remove();

    // Create an iframe to load the guide.html
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('guide.html');
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none'
    });

    // Append elements to modal and modal to the document
    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    document.body.appendChild(modal);
}
function closeGuideModal() {
    const modal = document.getElementById('guide-modal');
    if (modal) {
        modal.remove();
        console.log("Guide modal closed.");
    } else {
        console.log("No guide modal to close.");
    }
}

