const API_KEY = 'api key '; 


const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const chatMessages = document.getElementById('chat-messages');

const userInput = document.getElementById('user-input');

const sendButton = document.getElementById('send-button');

async function generateResponse(prompt) {


    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    
        method: 'POST',
        
        headers: {
            'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
       
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                           
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
    
        throw new Error('Failed to generate response');
      
    }

    const data = await response.json();
    
    return data.candidates[0].content.parts[0].text;
    
}

function cleanMarkdown(text) {

    return text
        .replace(/#{1,6}\s?/g, '')
       

        .replace(/\*\*/g, '')
        

        .replace(/\n{3,}/g, '\n\n')
      
        .trim();
        
}

function addMessage(message, isUser) {

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    

    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    

    profileImage.src = isUser ? 'userr.jpg' : 'bott.jpeg';
   
    profileImage.alt = isUser ? 'User' : 'Bot';
   

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    messageContent.textContent = message;
    
    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
  
    chatMessages.appendChild(messageElement);
    

    chatMessages.scrollTop = chatMessages.scrollHeight;
   
}

async function handleUserInput() {

    const message = userInput.value.trim();
    if (message) {
        
        addMessage(message, true);
        userInput.value = '';

        try {
            const response = await generateResponse(message);
            addMessage(cleanMarkdown(response), false);
            

            saveChatToHistory();
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', false);
        }
    }
}


function saveChatToHistory() {
    const messages = Array.from(chatMessages.children).map(msg => ({
        text: msg.querySelector('.message-content').textContent,
        isUser: msg.classList.contains('user-message'),
        timestamp: new Date().toISOString()
    }));
    
    if (messages.length > 0) {
        const chatHistory = getChatHistory();
      
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

    
    const closeBtn = historyContainer.querySelector('.close-history');
    closeBtn.addEventListener('click', () => {
        historyContainer.style.right = '-400px';
    });

   
    const deleteButtons = historyContainer.querySelectorAll('.delete-chat-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const index = parseInt(btn.dataset.index);
            deleteChat(index);
            showHistory(); 
        });
    });

    const clearAllBtn = historyContainer.querySelector('.clear-all-btn');
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all chat history?')) {
            clearAllHistory();
            showHistory();
        }
    });
    
    const historyItems = historyContainer.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = item.dataset.index;
            loadChat(chatHistory[index]);
            historyContainer.style.right = '-400px';
        });
    });
}

function deleteChat(index) {
    const chatHistory = getChatHistory();
    chatHistory.splice(index, 1);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function clearAllHistory() {
    localStorage.removeItem('chatHistory');
}

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

userInput.addEventListener('keypress', (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {
    
        e.preventDefault();
        

        handleUserInput();
        
    }
});

document.getElementById('new-chat-btn').addEventListener('click', () => {

    chatMessages.innerHTML = '';

    userInput.value = '';
    saveChatToHistory();
});
