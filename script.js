const API_KEY = 'AIzaSyCO_xMxlc29j8RuUu78sru4TlafFgXebvE'; 
// Replace with your actual Gemini API key – this stores the API key to authenticate requests to the Gemini API.

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
// The base URL of the Gemini API used to generate content (for text-based responses).

const chatMessages = document.getElementById('chat-messages');
// Gets the DOM element with the ID 'chat-messages', where the chat messages (user and bot) will be displayed.

const userInput = document.getElementById('user-input');
// Gets the DOM element with the ID 'user-input', which is the input field where the user types their message.

const sendButton = document.getElementById('send-button');
// Gets the DOM element with the ID 'send-button', which is the button the user clicks to send their message.

async function generateResponse(prompt) {
// Defines an asynchronous function `generateResponse` that takes the user's input (prompt) and generates a response from the API.

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    // Sends a POST request to the Gemini API endpoint with the API key appended to the URL.
        method: 'POST',
        // Specifies the HTTP method (POST) to send data to the API.

        headers: {
            'Content-Type': 'application/json',
        },
        // Sets the request headers to indicate that the content being sent is in JSON format.

        body: JSON.stringify({
        // The body of the request, converting the user's message into the format required by the API.
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                            // The user's input (`prompt`) is inserted into the request payload.
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
    // Checks if the API request was unsuccessful (i.e., the response is not OK).
        throw new Error('Failed to generate response');
        // If there's an error, an exception is thrown with an error message.
    }

    const data = await response.json();
    // Converts the API response to JSON format.

    return data.candidates[0].content.parts[0].text;
    // Returns the first generated response from the API (the text part of the response).
}

function cleanMarkdown(text) {
// Defines a function `cleanMarkdown` to remove any Markdown formatting (like headers, bold text, etc.) from the response.
    return text
        .replace(/#{1,6}\s?/g, '')
        // Removes any Markdown headers (e.g., #, ##, ###).

        .replace(/\*\*/g, '')
        // Removes bold formatting (double asterisks **).

        .replace(/\n{3,}/g, '\n\n')
        // Limits excessive newlines to a maximum of two (replaces more than two newlines with two).

        .trim();
        // Removes any whitespace from the start and end of the string.
}

function addMessage(message, isUser) {
// Defines a function `addMessage` to add a new message to the chat display. It takes the `message` (text) and `isUser` (boolean indicating whether the message is from the user or the bot).
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    // Creates a new `div` element for the message and adds the 'message' CSS class.

    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    // Adds a class based on whether the message is from the user ('user-message') or the bot ('bot-message').

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    // Creates an image element for the profile picture (either the user or the bot) and adds the 'profile-image' CSS class.

    profileImage.src = isUser ? 'userr.jpg' : 'bott.jpeg';
    // Sets the image source depending on whether it's a user or bot message ('user.jpg' or 'bot.jpg').

    profileImage.alt = isUser ? 'User' : 'Bot';
    // Sets the alternate text for the image (for accessibility), either 'User' or 'Bot'.

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    // Creates a `div` element to hold the text content of the message and adds the 'message-content' CSS class.

    messageContent.textContent = message;
    // Sets the text content of the message.

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
    // Appends the profile image and message content to the message element.

    chatMessages.appendChild(messageElement);
    // Appends the complete message (with profile image and text) to the chat messages section.

    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Scrolls the chat to the bottom to ensure the latest message is visible.
}

async function handleUserInput() {
// Defines an asynchronous function `handleUserInput` to process and handle the user’s input.
    const message = userInput.value.trim();
    if (message) {
        // Add user message
        addMessage(message, true);
        userInput.value = '';

        try {
            const response = await generateResponse(message);
            addMessage(cleanMarkdown(response), false);
            
            // Save chat to history after each interaction
            saveChatToHistory();
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', false);
        }
    }
}

// Store chat in history after each message
function saveChatToHistory() {
    const messages = Array.from(chatMessages.children).map(msg => ({
        text: msg.querySelector('.message-content').textContent,
        isUser: msg.classList.contains('user-message'),
        timestamp: new Date().toISOString()
    }));
    
    if (messages.length > 0) {
        const chatHistory = getChatHistory();
        // Get the first message as title preview
        const titlePreview = messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '');
        
        chatHistory.unshift({
            messages: messages,
            title: titlePreview,
            timestamp: new Date().toISOString(),
            messageCount: messages.length
        });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
}

function getChatHistory() {
    return JSON.parse(localStorage.getItem('chatHistory')) || [];
}

function loadChat(chat) {
    chatMessages.innerHTML = '';
    chat.messages.forEach(msg => {
        addMessage(msg.text, msg.isUser);
    });
}

function getPreview(messages) {
    if (!messages || messages.length === 0) return 'Empty chat';
    const firstMessage = messages[0].text;
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
}

// History button functionality
document.getElementById('history-btn').addEventListener('click', showHistory);

function showHistory() {
    const chatHistory = getChatHistory();
    
    let historyContainer = document.querySelector('.history-container');
    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.className = 'history-container';
        document.body.appendChild(historyContainer);
    }
    
    historyContainer.style.right = '0';
    
    historyContainer.innerHTML = `
        <div class="history-header">
            <h2>Chat History</h2>
            <div class="header-actions">
                <button class="clear-all-btn" title="Delete All History">🗑️ All</button>
                <button class="close-history">&times;</button>
            </div>
        </div>
        <div class="history-list">
            ${chatHistory.length > 0 ? 
                chatHistory.map((chat, index) => `
                    <div class="history-item" data-index="${index}">
                        <div class="history-content">
                            <div class="history-item-header">
                                <span class="history-title">${chat.title || `Chat ${index + 1}`}</span>
                                <span class="history-date">${formatDate(chat.timestamp)}</span>
                            </div>
                            <div class="history-preview">
                                <div class="message-count">${chat.messageCount} messages</div>
                                <div class="last-message">${getLastMessage(chat.messages)}</div>
                            </div>
                        </div>
                        <button class="delete-chat-btn" data-index="${index}" title="Delete this chat">🗑️</button>
                    </div>
                `).join('') : 
                '<div class="no-history">No chat history available</div>'
            }
        </div>
    `;

    // Add event listeners
    const closeBtn = historyContainer.querySelector('.close-history');
    closeBtn.addEventListener('click', () => {
        historyContainer.style.right = '-400px';
    });

    // Delete individual chat
    const deleteButtons = historyContainer.querySelectorAll('.delete-chat-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent chat from loading when clicking delete
            const index = parseInt(btn.dataset.index);
            deleteChat(index);
            showHistory(); // Refresh the history panel
        });
    });

    // Clear all history
    const clearAllBtn = historyContainer.querySelector('.clear-all-btn');
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all chat history?')) {
            clearAllHistory();
            showHistory(); // Refresh the history panel
        }
    });
    
    // Load chat
    const historyItems = historyContainer.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = item.dataset.index;
            loadChat(chatHistory[index]);
            historyContainer.style.right = '-400px';
        });
    });
}

// Delete functions
function deleteChat(index) {
    const chatHistory = getChatHistory();
    chatHistory.splice(index, 1);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function clearAllHistory() {
    localStorage.removeItem('chatHistory');
}

// Helper functions
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function getLastMessage(messages) {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMsg = messages[messages.length - 1];
    const text = lastMsg.text;
    return `${lastMsg.isUser ? 'You' : 'Bot'}: ${text.length > 40 ? text.substring(0, 40) + '...' : text}`;
}

// Add styles for history panel
const historyStyles = document.createElement('style');
historyStyles.textContent = `
    .history-container {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: #070707;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
        transition: right 0.3s ease;
        z-index: 1000;
        overflow-y: auto;
    }

    .history-header {
        padding: 15px 20px;
        background: #003363;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 2;
        border-bottom: 1px solid #0e0d0d;
    }

    .history-item {
        background: #080808;
        border-radius: 8px;
        margin: 10px;
        cursor: pointer;
        transition: background 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border: 1px solid #0e0d0d;
    }

    .history-content {
        flex-grow: 1;
        margin-right: 15px;
    }

    .history-item:hover {
        background: #0e0d0d;
    }

    .history-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .history-title {
        color: #e0e0e0;
        font-weight: bold;
        font-size: 0.95rem;
    }

    .history-date {
        color: #666;
        font-size: 0.8rem;
    }

    .history-preview {
        color: #888;
        font-size: 0.85rem;
    }

    .message-count {
        color: #4a90e2;
        font-size: 0.8rem;
        margin-bottom: 4px;
    }

    .last-message {
        color: #666;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .no-history {
        color: #666;
        text-align: center;
        padding: 30px;
        font-size: 0.9rem;
    }

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #2a2a2a;
    }

    ::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #5a5a5a;
    }
`;
document.head.appendChild(historyStyles);

sendButton.addEventListener('click', handleUserInput);
// Adds an event listener to the send button that calls `handleUserInput` when clicked.

userInput.addEventListener('keypress', (e) => {
// Adds an event listener for when a key is pressed in the input field.
    if (e.key === 'Enter' && !e.shiftKey) {
    // Checks if the 'Enter' key is pressed and Shift is not held (to distinguish from Shift+Enter for newlines).
        e.preventDefault();
        // Prevents the default behavior of adding a newline.

        handleUserInput();
        // Calls `handleUserInput` to send the message.
    }
});

// New Message and History functionality
document.getElementById('new-chat-btn').addEventListener('click', () => {
    // Clear the chat messages
    chatMessages.innerHTML = '';
    // Clear the input field
    userInput.value = '';
    // Store current chat in history if it has messages
    saveChatToHistory();
});