const socket = io();

// DOM elements
const login = document.querySelector('.login');
const inputNickname = document.querySelector('.login-input');
const loginBtn = document.querySelector('.login-btn');
const usersOnline = document.querySelector('.users-online');
const userJoined = document.querySelector('.user-joined');
const messagesChat = document.querySelector('.chat-messages');
const messagesInput = document.querySelector('.messages-input');
const messagesBtn = document.querySelector('.messages-btn');
const messages = document.querySelector('.messages');
const userTyping = document.querySelector('.user-typing');
const exitBtn = document.querySelector('.exit-btn');
const userDisconnect = document.querySelector('.user-disconnect');

let typing = false;
let timeA;

loginBtn.addEventListener('click', () => {
  const nickname = inputNickname.value.trim();

  if (!nickname || nickname.lenght === 0) return;
  
  socket.emit('chat:addUser', nickname);
  login.classList.add('none');
  inputNickname.value = '';
  messagesChat.classList.remove('none');
});

messagesBtn.addEventListener('click', () => {
  const message = messagesInput.value.trim();

  if (!message || message.lenght === 0) return;

  socket.emit('chat:message', message);
  messagesInput.value = '';
});

messagesInput.addEventListener('keypress', () => {
  if (!typing) {
    socket.emit('chat:typing');
    typing = true;
  }
  
  timeA = Date.now();
  
  setTimeout(() => {
    const timeB = Date.now();
    const timeDiff = timeB - timeA;
    if (timeDiff >= 400 && typing) {
      socket.emit('chat:stopTyping');
      typing = false;      
    }
  }, 400);
});

exitBtn.addEventListener('click', () => {
  socket.emit('chat:disconnect');
});

socket.on('chat:login', (numUsers) => {
  usersOnline.textContent = `users online: ${numUsers}`;
});

socket.on('chat:userJoined', (data) => {
  userJoined.textContent = `${data.username} joined`;
});

socket.on('chat:message', (data) => {
  messages.innerHTML += `
    <p>${data.username}: ${data.message}</p>
  `;
});

socket.on('chat:typing', (data) => {
  if(!userTyping.innerHTML) {
    userTyping.textContent = `${data.username} is typing...`;
  }
});

socket.on('chat:stopTyping', () => {
  userTyping.innerHTML = '';
});

socket.on('chat:disconnect', (data) => {
  usersOnline.textContent = `users online: ${data.numUsers}`;
  messagesChat.classList.add('none');
  login.classList.remove('none');
});