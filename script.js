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
  // We are now grabbing the value from id="myTextarea"
  const userInput = document.getElementById("myTextarea").value.trim();
  const chatWindow = document.getElementById("chatWindow");

  if (!userInput) return; // Avoid empty messages

  // Display the user's message in the chat window with 🤔 emoji
  chatWindow.innerHTML += `
    <div class="user-message">
      <span class="message-icon">🤔</span>
      <span>You: ${userInput}</span>
    </div>`;

  document.getElementById("myTextarea").value = ""; // Clear input field

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
        <div class="bot-text">SmartCA: ${formatBotMessage(botMessage)}</div>
      </div>`;

    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message

  } catch (error) {
    console.error("Error communicating with API:", error);
    chatWindow.innerHTML += `
      <div class="bot-message">
        <span class="message-icon">📕</span>
        <div class="bot-text">SmartCA: Oops! Something went wrong. Please try again.</div>
      </div>`;
  }
}

// Function to format the bot's message with support for bullet points and subtopics
function formatBotMessage(message) {
  // Split the message into lines based on newline characters
  const lines = message.split('\n');
  let html = '';
  let listItems = [];
  let currentListOrdered = null; // null means not in a list yet

  // Helper function to flush the current list items into an HTML list
  function flushList() {
    if (listItems.length > 0) {
      if (currentListOrdered === true) {
        html += '<ol>';
        listItems.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ol>';
      } else if (currentListOrdered === false) {
        html += '<ul>';
        listItems.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
      listItems = [];
      currentListOrdered = null;
    }
  }

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•')) {
      // Unordered list item
      if (currentListOrdered === null) {
        currentListOrdered = false;
      } else if (currentListOrdered === true) {
        // If previously in an ordered list, flush it first
        flushList();
        currentListOrdered = false;
      }
      // Remove the bullet (•) and extra spaces
      listItems.push(trimmed.substring(1).trim());
    } else if (/^\d+\./.test(trimmed)) {
      // Ordered list item
      if (currentListOrdered === null) {
        currentListOrdered = true;
      } else if (currentListOrdered === false) {
        flushList();
        currentListOrdered = true;
      }
      listItems.push(trimmed);
    } else if (trimmed === "") {
      // Empty line: flush any existing list and add a break
      flushList();
      html += '<br>';
    } else {
      // Non-list text: flush any list first
      flushList();
      // If the line ends with a colon, treat it as a subheading
      if (trimmed.endsWith(':')) {
        html += `<h4>${trimmed}</h4>`;
      } else {
        html += `<p>${trimmed}</p>`;
      }
    }
  });

  // Flush any remaining list items
  flushList();

  return html;
}
