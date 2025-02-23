// Check if the browser supports the SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // Function to start or restart recognition
    const startRecognition = () => {
        recognition.start();
        console.log("Voice recognition started...");
    };

    // Start listening for voice commands
    startRecognition();

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("You said:", transcript);

        // Check if the user said "guide" to open the modal
        if (transcript.includes("guide")) {
            document.getElementById("guideModal").style.display = "flex";
        }

        // Check if the user said "close" or "back" to close the modal
        if (transcript.includes("close") || transcript.includes("back")) {
            document.getElementById("guideModal").style.display = "none";
        }
    });

    recognition.addEventListener("error", (event) => {
        console.error("Speech recognition error:", event.error);
        // Restart recognition if an error occurs
        if (event.error === "aborted" || event.error === "network" || event.error === "no-speech") {
            startRecognition();
        }
    });

    // Restart the recognition if it stops for any reason
    recognition.addEventListener("end", () => {
        startRecognition();
    });
} else {
    console.error("Speech recognition not supported in this browser.");
}

// Close modal when clicking the Close button
document.getElementById("closeGuide").addEventListener("click", function () {
    document.getElementById("guideModal").style.display = "none";
});
