var firebaseConfig = {
    apiKey: "AIzaSyCOA_2bf_b1o1nXSHZO5Re5DjSD66Pa6MY",
    authDomain: "https://raona0-default-rtdb.firebaseio.com",
    projectId: "raona0",
    storageBucket: "raona0.appspot.com",
    messagingSenderId: "797719983777",
    appId: "1:797719983777:web:d7ffca1316891b51ec62e0"
  };
// chatroom.js

// Initialize Firebase (Replace these credentials with your own)
firebase.initializeApp(firebaseConfig);
// chatroom.js

// Function to format the timestamp into a relative time difference
function formatTimestamp(timestamp) {
  const messageDate = new Date(timestamp);
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - messageDate.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes === 1) {
    return '1 minute ago';
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours === 1) {
    return '1 hour ago';
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (weeks === 1) {
    return '1 week ago';
  } else if (weeks < 4) {
    return `${weeks} weeks ago`;
  } else if (months === 1) {
    return '1 month ago';
  } else if (months < 12) {
    return `${months} months ago`;
  } else if (years === 1) {
    return '1 year ago';
  } else {
    return `${years} years ago`;
  }
}

const chatContainer = document.getElementById('chatContainer');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const roomId = new URLSearchParams(window.location.search).get('roomId');

// Get the current user's username from Firebase Authentication
let username = ''; // Global variable to store the username
let touchStartTime; // Variable to store the start time of the touch event for long-press detection

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    username = user.displayName || 'Anonymous'; // Use the display name, or set to 'Anonymous' if not available
    document.getElementById('userIcon').textContent = user.displayName ? user.displayName[0] : 'A';
  }
});
// Function to handle the context menu (pop-up) on long-press for message deletion
function handleContextMenu(event, messageKey, messageUsername, messagesRef) {
  event.preventDefault();

  // Check if the current user is the sender of the message
  if (messageUsername === username) {
    Swal.fire({
      title: 'Delete Message?',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete the message from the database
        messagesRef.child(messageKey).remove()
          .then(() => {
            Swal.fire({
              title: 'Message Deleted!',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          })
          .catch((error) => {
            console.error('Error deleting message:', error);
            Swal.fire({
              title: 'Error',
              text: 'An error occurred while deleting the message.',
              icon: 'error'
            });
          });
      }
    });
  }
}
function scrollChatToBottom()
{
    var height = document.body.scrollHeight;
    window.scroll(0 , height);
}
  
  // Function to handle the deletion of a message
  function handleDeleteMessage(messageDiv) {
    Swal.fire({
      title: 'Delete Message?',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        messageDiv.remove();
      }
    });
  }

  // Initialize long-press event for each message
  const allMessages = document.querySelectorAll('.message');
  allMessages.forEach((messageDiv) => {
    handleLongPress(messageDiv);

    // Add click event listener to the trash icon
    const trashIcon = messageDiv.querySelector('.trash-icon');
    trashIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent the click event from bubbling up to the message div
      handleDeleteMessage(messageDiv);
    });
  });
if (!roomId) {
  messagesDiv.innerHTML = '<p>No chatroom found. Please create or join a chatroom.</p>';
} else {
  const chatroomRef = firebase.database().ref('chatrooms/' + roomId);
  const messagesRef = chatroomRef.child('messages');

  chatroomRef.once('value')
    .then((snapshot) => {
      const roomName = snapshot.val().name;
      document.title = `Chatroom - ${roomName}`;
    })
    .catch((error) => {
      console.error('Error fetching chatroom:', error);
    });

    function refreshChat() {
      // Clear existing messages
      messagesDiv.innerHTML = '';
    
      // Fetch all messages again and populate the chat
      messagesRef.once('value', (snapshot) => {
        const messages = [];
    
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          messages.push({
            key: childSnapshot.key,
            username: message.username,
            timestamp: message.timestamp,
            text: message.text,
            formattedTimestamp: formatTimestamp(message.timestamp)
          });
        });
    
        // Sort the messages based on their timestamps in ascending order (oldest to newest)
        messages.sort((a, b) => a.timestamp - b.timestamp);
    
        // Generate message HTML
        let chatHTML = '';
        messages.forEach((message) => {
          const messageDiv = document.createElement('div');
          messageDiv.classList.add('message');
          messageDiv.classList.add(message.username === username ? 'sent' : 'received');
    
          // Set a data attribute to identify the message div with its key
          messageDiv.setAttribute('data-message-key', message.key);
    
          // Create the message content
          const messageContentDiv = document.createElement('div');
          messageContentDiv.classList.add('messageContent');
          messageContentDiv.innerHTML = `
            <div class="messageHeader">
              <span class="username">${message.username}</span>
              <span class="timestamp">${message.formattedTimestamp}</span>
            </div>
            <div class="text">${message.text}</div>
          `;
// Scroll to the bottom to see new messages
scrollChatToBottom();
messageDiv.addEventListener('contextmenu', (event) => {
  handleContextMenu(event, snapshot.key, message.username, messagesRef);
});
          // Append message content to the messageDiv
          messageDiv.appendChild(messageContentDiv);
    
          // Add long-press event listener to each message
          messageDiv.addEventListener('contextmenu', (event) => {
            handleContextMenu(event, message.key, message.username, messagesRef);
          });
    
          chatHTML += messageDiv.outerHTML;
        });
    
        // Update the chat with the generated HTML
        messagesDiv.innerHTML = chatHTML;
        scrollChatToBottom();
        // Scroll to the bottom to see new messages
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
    }
  
    const allMessages = document.querySelectorAll('.message');
    allMessages.forEach((messageDiv) => {
      const messageKey = messageDiv.getAttribute('data-message-key');
      const messageUsername = messageDiv.getAttribute('data-message-username');
      initMessageLongPress(messageDiv, messageKey, messageUsername, messagesRef);
    });
  // Listen for child_removed event to detect when a message is deleted
  messagesRef.on('child_removed', (snapshot) => {
    // Get the key of the deleted message
    const deletedMessageKey = snapshot.key;

    // Find the corresponding message div and remove it from the UI
    const deletedMessageDiv = document.querySelector(`[data-message-key="${deletedMessageKey}"]`);
    if (deletedMessageDiv) {
      deletedMessageDiv.classList.add('deleted');
      deletedMessageDiv.textContent = 'Message Deleted!';
    }
  });

  // Listen for any change in the database to refresh the chat
  messagesRef.on('value', () => {
    refreshChat();
    scrollChatToBottom();
    // Scroll to the bottom to see new messages
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Send Message Function
  const messageInput = document.getElementById('messageText');
  const sendButton = document.getElementById('sendButton');
  const MAX_MESSAGE_LENGTH = 200;

  // Function to handle sending a new message
  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== '' && messageText.length <= MAX_MESSAGE_LENGTH) {
      // Truncate the message to the maximum allowed length
      const truncatedMessage = messageText.slice(0, MAX_MESSAGE_LENGTH);

      const newMessage = {
        username: username,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        text: truncatedMessage
      };

      // Save the new message to the database
      messagesRef.push(newMessage);

      // Clear the message input after sending
      messageInput.value = '';
      scrollChatToBottom();
      // Update the send button state after sending
      updateSendButtonState();
    }
  }

  // Listen for click event on the send button
  sendButton.addEventListener('click', sendMessage);

  // Function to update the send button state based on the message input
  function updateSendButtonState() {
    const messageText = messageInput.value.trim();
    sendButton.disabled = messageText === '';
  }

  // Listen for input event on the message input to update the send button state
  messageInput.addEventListener('input', updateSendButtonState);
}
