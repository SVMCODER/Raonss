var firebaseConfig = {
    apiKey: "AIzaSyCOA_2bf_b1o1nXSHZO5Re5DjSD66Pa6MY",
    authDomain: "https://raona0-default-rtdb.firebaseio.com",
    projectId: "raona0",
    storageBucket: "raona0.appspot.com",
    messagingSenderId: "797719983777",
    appId: "1:797719983777:web:d7ffca1316891b51ec62e0"
  };
 firebase.initializeApp(firebaseConfig)
 const roomList = document.getElementById('rooms');
 const createRoomBtn = document.getElementById('createRoomBtn');
 
 // Function to fetch and build the room list
 function buildRoomList() {
   firebase.database().ref('chatrooms').on('value', (snapshot) => {
     roomList.innerHTML = '';
 
     const chatrooms = snapshot.val();
     if (chatrooms) {
       Object.entries(chatrooms).forEach(([roomId, roomData]) => {
         const listItem = document.createElement('li');
         const link = document.createElement('a');
         link.href = `${window.location.origin}/chatroom.html?roomId=${roomId}`;
         link.textContent = roomData.name;
 
         const avatar = document.createElement('img');
         // Replace 'path/to/default/avatar.png' with the URL of the default avatar image
         avatar.src = roomData.avatar || 'https://img.icons8.com/color/48/filled-chat.png';
 
         listItem.appendChild(avatar);
         listItem.appendChild(link);
         roomList.appendChild(listItem);
       });
     }
   });
 }
// Function to show a SweetAlert input prompt to create a new room
function createRoom() {
  Swal.fire({
    title: 'Create New Raon',
    input: 'text',
    inputLabel: 'Raon Name:',
    inputValidator: (value) => {
      if (!value) {
        return 'Please enter raon name';
      } else {
        // Generate a unique room ID using Firebase's push() method
        const roomId = firebase.database().ref('chatrooms').push().key;

        // Save the room data to Firebase
        firebase.database().ref('chatrooms/' + roomId).set({
          name: value,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
          Swal.fire({
            title: 'Raon Created!',
            text: 'Invite your friends',
            inputValue: `${window.location.origin}/chatroom.html?roomId=${roomId}`,
            showCancelButton: true,
            confirmButtonText: 'Invite',
          }).then((result) => {
            if (result.isConfirmed) {
              const input = document.createElement('input');
              document.body.appendChild(input);
              input.value = `${window.location.origin}/chatroom.html?roomId=${roomId}`;
              input.select();
              document.execCommand('copy');
              document.body.removeChild(input);
            }
          });

          // Add the created room to the list
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a href="${window.location.origin}/chatroom.html?roomId=${roomId}">${value}</a>`;
          createdRoomsList.appendChild(listItem);
        })
        .catch((error) => {
          console.error('Error creating chatroom:', error);
          Swal.fire('Error', 'Failed to create raon', 'error');
        });
      }
    }
  });
}
// Fetch and build the room list when the page loads
window.addEventListener('load', () => {
    buildRoomList();
  });
createRoomBtn.addEventListener('click', createRoom);