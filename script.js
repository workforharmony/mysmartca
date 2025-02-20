let selectedCategory = "";

// Handle Category Selection
function selectCategory(category) {
    selectedCategory = category;
    document.getElementById("selectedCategory").innerText = `Category: ${category}`;
    document.querySelector(".chat-container").style.display = "block";
    document.getElementById("chatWindow").innerHTML = ""; // Clear previous chat history
}

// Send Message to Vercel API
async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatWindow = document.getElementById("chatWindow");

    if (!userInput) return; // Avoid empty messages

    // Display the user's message in the chat window
    chatWindow.innerHTML += `<div class="user-message">You: ${userInput}</div>`;
    document.getElementById("userInput").value = ""; // Clear input field

    try {
        const response = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput, category: selectedCategory })
        });

        const data = await response.json();
        const botMessage = data.message || "Sorry, I didn't understand that.";

        // Display the bot's response in the chat window
        chatWindow.innerHTML += `<div class="bot-message">SmartCA GPT: ${botMessage}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message

    } catch (error) {
        console.error("Error communicating with API:", error);
        chatWindow.innerHTML += `<div class="bot-message">Oops! Something went wrong. Please try again.</div>`;
    }
}
