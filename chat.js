/**
 * SkillBridge — Real-Time Chat Module (js/chat.js)
 * Socket.io powered in-app messaging
 */

'use strict';

/* global io, Auth, MessagesAPI, showToast */

let chatSocket = null;
let currentRoom = null;
let typingTimer = null;

// ─── INIT SOCKET ──────────────────────────────────────────────────────────────
function initChat() {
  if (chatSocket) return;
  const SOCKET_URL = window.SKILLBRIDGE_API ? window.SKILLBRIDGE_API.replace('/api', '') : 'http://localhost:5000';

  try {
    chatSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    chatSocket.on('connect', () => {
      console.log('💬 Chat connected');
      const token = Auth.getToken();
      if (token) chatSocket.emit('authenticate', token);
    });

    chatSocket.on('newMessage', (msg) => {
      if (msg.room === currentRoom) appendChatMessage(msg);
      else showChatBadge(msg.room);
    });

    chatSocket.on('userTyping', (userId) => {
      const el = document.getElementById('chatTypingIndicator');
      if (el) { el.textContent = 'typing...'; el.style.display = 'block'; }
    });

    chatSocket.on('userStopTyping', () => {
      const el = document.getElementById('chatTypingIndicator');
      if (el) el.style.display = 'none';
    });

    chatSocket.on('newSwapRequest', ({ swap, from }) => {
      showToast(`⇄ ${from.name} sent you a swap request!`, 'info');
      refreshNotificationBadge();
    });

    chatSocket.on('disconnect', () => console.log('💬 Chat disconnected'));
  } catch (e) {
    console.warn('Socket.io not available (demo mode)');
  }
}

// ─── OPEN CHAT MODAL ──────────────────────────────────────────────────────────
async function openChat(roomId, partnerName) {
  currentRoom = roomId;
  if (chatSocket) chatSocket.emit('joinRoom', roomId);

  const modal = document.getElementById('chatModal');
  if (!modal) return;

  document.getElementById('chatPartnerName').textContent = partnerName || 'Partner';
  document.getElementById('chatMessages').innerHTML = '<div class="chat-loading">Loading messages...</div>';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  try {
    const { messages } = await MessagesAPI.getHistory(roomId);
    await MessagesAPI.markRead(roomId);
    renderChatMessages(messages);
  } catch (e) {
    // Demo mode — show placeholder messages
    renderChatMessages(getDemoMessages(partnerName));
  }

  const input = document.getElementById('chatInput');
  if (input) input.focus();
}

function closeChat() {
  currentRoom = null;
  const modal = document.getElementById('chatModal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

// ─── RENDER MESSAGES ──────────────────────────────────────────────────────────
function renderChatMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const user = Auth.getUser();
  container.innerHTML = messages.map(msg => buildMsgHTML(msg, user)).join('');
  container.scrollTop = container.scrollHeight;
}

function appendChatMessage(msg) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const user = Auth.getUser();
  container.insertAdjacentHTML('beforeend', buildMsgHTML(msg, user));
  container.scrollTop = container.scrollHeight;
}

function buildMsgHTML(msg, currentUser) {
  const isMe = currentUser && (msg.sender?._id || msg.sender) === (currentUser._id || currentUser.id);
  const name = msg.sender?.name || 'Partner';
  const time = new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="chat-msg ${isMe ? 'chat-msg-me' : 'chat-msg-them'}">
      ${!isMe ? `<div class="chat-avatar">${name[0]}</div>` : ''}
      <div class="chat-bubble">
        <p>${escapeHTML(msg.content)}</p>
        <span class="chat-time">${time}</span>
      </div>
    </div>`;
}

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const content = input?.value.trim();
  if (!content || !currentRoom) return;

  if (chatSocket?.connected) {
    chatSocket.emit('sendMessage', { roomId: currentRoom, message: { content, type: 'text' } });
  } else {
    // Demo mode — append locally
    const user = Auth.getUser() || { name: 'You', _id: 'me' };
    appendChatMessage({ sender: user, content, createdAt: new Date(), room: currentRoom });
  }

  input.value = '';
  if (chatSocket) chatSocket.emit('stopTyping', currentRoom);
}

function handleChatInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); return; }
  if (chatSocket && currentRoom) {
    chatSocket.emit('typing', currentRoom);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => chatSocket.emit('stopTyping', currentRoom), 1500);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function showChatBadge(roomId) {
  refreshNotificationBadge();
}

function refreshNotificationBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  try {
    NotificationsAPI.getAll().then(({ unread }) => {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    });
  } catch (e) {}
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getDemoMessages(partnerName) {
  return [
    { sender: { name: partnerName || 'Alex', _id: 'other' }, content: 'Hey! Ready to start our swap session?', createdAt: new Date(Date.now() - 300000) },
    { sender: Auth.getUser() || { name: 'You', _id: 'me' }, content: 'Yes! I can teach you React hooks today. What time works for you?', createdAt: new Date(Date.now() - 240000) },
    { sender: { name: partnerName || 'Alex', _id: 'other' }, content: 'Anytime after 5pm IST works for me 👍', createdAt: new Date(Date.now() - 180000) },
  ];
}

// ─── CHAT MODAL HTML ──────────────────────────────────────────────────────────
function injectChatModal() {
  if (document.getElementById('chatModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="chatModal" class="modal-overlay">
    <div class="modal-box chat-modal-box">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar-lg" id="chatPartnerAvatar">A</div>
          <div>
            <div class="chat-partner-name" id="chatPartnerName">Partner</div>
            <div class="chat-status" id="chatTypingIndicator" style="display:none;">typing...</div>
            <div class="chat-status" id="chatOnlineStatus">Online</div>
          </div>
        </div>
        <button class="modal-close" onclick="closeChat()">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input-area">
        <textarea id="chatInput" class="chat-input" placeholder="Type a message..." rows="1"
          onkeydown="handleChatInputKey(event)" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <button class="chat-send-btn" onclick="sendChatMessage()">➤</button>
      </div>
    </div>
  </div>`);
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  injectChatModal();
  if (Auth.isLoggedIn()) initChat();
});

window.openChat = openChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;
window.handleChatInputKey = handleChatInputKey;
window.initChat = initChat;
