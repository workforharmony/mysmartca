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

    // Display the user's message in the chat window with 🤔 emoji
    chatWindow.innerHTML += `
        <div class="user-message">
            <span class="message-icon">🤔</span>
            <span>You: ${userInput}</span>
        </div>`;
    
    document.getElementById("userInput").value = ""; // Clear input field

    try {
        const response = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput, category: selectedCategory })
        });

        const data = await response.json();
        const botMessage = data.message || "Sorry, I didn't understand that.";

        // Display the bot's response in the chat window with 📕 emoji and 'SmartCA' name
        chatWindow.innerHTML += `
            <div class="bot-message">
                <span class="message-icon">📕</span>
                <span>SmartCA: ${formatBotMessage(botMessage)}</span>
            </div>`;

        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message

    } catch (error) {
        console.error("Error communicating with API:", error);
        chatWindow.innerHTML += `
            <div class="bot-message">
                <span class="message-icon">📕</span>
                <span>SmartCA: Oops! Something went wrong. Please try again.</span>
            </div>`;
    }
}

// Function to format the bot's message with support for bullet points and lists
function formatBotMessage(message) {
    // Convert new lines to <br> and handle basic bullet points and numbered lists
    return message
        .replace(/\n/g, '<br>')
        .replace(/•\s/g, '<li>') // Convert bullets (•) to list items
        .replace(/(\d+\.)\s/g, '<li>') // Convert numbered lists (1., 2., ...) to list items
        .replace(/<\/li><br>/g, '</li>') // Clean up unnecessary <br> after list items
        .replace(/<br><li>/g, '<ul><li>') // Wrap list items in <ul> tags
        .replace(/<\/li>(?!<li>)/g, '</li></ul>'); // Close <ul> properly
}
