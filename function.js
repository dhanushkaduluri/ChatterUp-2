const socket = io.connect('https://chatterup-32xj.onrender.com');

// characters for the users

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageDisplay = document.getElementById('message-display');
const typing_status=document.getElementById('typing-status');
const users_count=document.getElementById('user-count');
const users_names=document.getElementById('users-names');
const info_container=document.getElementById('info-container');
const welcome_msg=document.getElementById('welcome-msg');
const typing_container=document.getElementById('typing-container');

let username = '';
let room = '';

// Event handler for the login form
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Get the username and room from the form
    username = document.getElementById('username-input').value;
    room = document.getElementById('room-input').value;
    welcome_msg.innerText=`Welcome ${username}`;

    // Hide the login container and show the chat container
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    info_container.style.display = 'block';
    typing_container.style.display = 'block';
    // Join the room by emitting a 'join' event
    socket.emit('join', { username, room });
});

// Event handler for the message form
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const  avatar=`https://robohash.org/${username}`;
    // Emit a 'sendMessage' event to send the message to the server
    const messageElement = document.createElement('div');
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    messageElement.className="my-msg"
    messageElement.innerHTML = `<div class="chat-message"><span>
    <span>${username}  ${hours}:${minutes}</span>
    <p>${message} </p>
    </span>
    </div>
    <img src=${avatar} />`;
    messageDisplay.appendChild(messageElement);
    socket.emit('sendMessage', { username, message, room, avatar ,hours, minutes});

    messageInput.value = '';
});

messageInput.addEventListener('keydown',()=>{
    console.log("changed");
    socket.emit('typingStatus',{status:`${username} is typing...`, room:room});
})

// Listen for incoming messages from the server
socket.on('message', (message) => {
    console.log(message.userCount);
    console.log(message.prevUsers);
    // Display the received message in the message display area
    typing_status.innerText="";
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<div class="chat-message"><span>
    <span>${message.username}  ${message.hours}:${message.minutes}</span>
    <p>${message.text} </p>
    </span>
    </div>
    <img src=${message.avatar} />`;
    messageElement.className="others-msg"
    messageDisplay.appendChild(messageElement);
});

socket.on('typing',(data)=>{
    console.log(data.status);
    // const typing_det=document.createElement('span');
    // typing_det.innerText=data.status;
    typing_status.innerHTML=`${data.status}`;
})

socket.on('server-message',(message)=>{
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<div class="chat-message"><span>
    <span>${hours}:${minutes}</span>
    <p>${message.text} </p>
    </span>
    </div>`;
    messageElement.className="server-msg"
    messageDisplay.appendChild(messageElement);
})

socket.on('details',(data)=>{
    users_count.innerHTML=`<h2>Online users: ${data.userCount ? data.userCount : 0}</h2>`;

    if(data.prevUsers){
        users_names.innerHTML="";
        data.prevUsers.forEach(user=>{
            if(user.username!==username){
                const names=document.createElement('div');
                names.innerHTML=`${user.username}`;
                users_names.appendChild(names);
            }
        })
    }

})
