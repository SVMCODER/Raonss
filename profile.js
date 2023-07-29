var firebaseConfig = {
    apiKey: "AIzaSyCOA_2bf_b1o1nXSHZO5Re5DjSD66Pa6MY",
    authDomain: "https://raona0-default-rtdb.firebaseio.com",
    projectId: "raona0",
    storageBucket: "raona0.appspot.com",
    messagingSenderId: "797719983777",
    appId: "1:797719983777:web:d7ffca1316891b51ec62e0"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
var database = firebase.database();
// Function to get the user's uid from the URL parameters
function getUserUidFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid');
  }
  
// Function to display user data
function displayUserData(user) {
  var uid = user.uid;
  var displayName = user.displayName;
  var photoURL = 'https://cdn-icons-png.flaticon.com/512/7153/7153150.png';

  // If uid is provided in the URL, use that uid to fetch user data
  var urlParams = new URLSearchParams(window.location.search);
  var profileUid = urlParams.get('uid');

  if (profileUid) {
    if (profileUid === uid) {
      // If the current user's uid is the same as the provided uid, display the current user's data
      displayUserProfile(uid, displayName, photoURL);
    } else {
      // Fetch the data of the specified user
      fetchUserProfile(profileUid);
    }
  } else {
    // No uid provided, display the current user's data (if logged in)
    if (uid) {
      displayUserProfile(uid, displayName, photoURL);
    } else {
      // User not logged in, redirect to login page
      window.location.href = 'login.html';
    }
  }
}
// Function to fetch and display user profile data
function fetchUserProfile(uid) {
    var usersRef = database.ref('users/' + uid);
  
    usersRef.once('value')
    .then(function (snapshot) {
      var userData = snapshot.val();
      if (userData) {
        displayUserProfile(uid, userData.displayName, userData.photoURL);
      } else {
        console.log('User data not found');
        // Show an error message or redirect to a not found page
      }
    })
    .catch(function (error) {
      console.log('Error fetching user data:', error);
      // Handle the error as needed
    });
  
  }
  // Function to display user profile data and posts
  function displayUserProfile(uid, displayName, photoURL) {
    // Update the HTML elements to display user information
    var displayNameElement = document.getElementById('displayName');
    var bioElement = document.getElementById('bio');
    var photoElement = document.getElementById('photo');
    displayNameElement.textContent = displayName;
    bioElement.textContent = "Raon User"; // Replace with the user's bio from the database
    photoElement.src = 'https://cdn-icons-png.flaticon.com/512/7153/7153150.png';

    // Fetch and display the user's posts
    var userPostsContainer = document.getElementById('userPosts');
    userPostsContainer.innerHTML = ''; // Clear previous posts

    var postsRef = database.ref('blogs').orderByChild('uid').equalTo(uid);

    postsRef.on('value', function (snapshot) {
      var posts = snapshot.val();
      var totalLikes = 0;
      var totalViews = 0;
      var totalPosts = 0;

      if (posts) {
        Object.keys(posts).forEach(function (postId) {
          var post = posts[postId];
          var postImage = post.imageURL;
          var postImageAlt = post.title;
          var postContent = post.content;
          var postAuthorId = post.uid;
          var postLikes = post.likes || {};
          var postViews = post.views || 0;

          totalLikes += Object.keys(postLikes).length;
          totalViews += postViews;
          totalPosts++;

          var postElement = document.createElement('div');
          postElement.classList.add('post');

          var postImageElement = document.createElement('img');
          postImageElement.classList.add('post-image');
          postImageElement.src = postImage;
          postImageElement.alt = postImageAlt;

          var postContentElement = document.createElement('p');
          postContentElement.classList.add('post-content');
          postContentElement.innerHTML = parsePostContent(postContent, postAuthorId);

          postElement.appendChild(postImageElement);
          postElement.appendChild(postContentElement);
          userPostsContainer.appendChild(postElement);
        });
      } else {
        userPostsContainer.innerHTML = '<p>No posts found.</p>';
      }

      // Update the stat box with total likes, total views, and total posts
      var totalLikesElement = document.getElementById('totalLikes');
      var totalViewsElement = document.getElementById('totalViews');
      var totalPostsElement = document.getElementById('totalPosts');
      totalLikesElement.textContent = totalLikes;
      totalViewsElement.textContent = totalViews;
      totalPostsElement.textContent = totalPosts;
    });
  }

  function parsePostContent(content, postAuthorId) {
    // Split the post content by spaces to identify words
    var words = content.split(' ');

    // Iterate over each word and check for mention tags (@user)
    words.forEach(function (word, index) {
      if (word.startsWith('@') && word.length > 1) {
        // Extract the username from the mention tag
        var username = word.slice(1);

        // Replace the mention tag with a clickable link
        var mentionTag = `<a class="mention-tag" href="/profile.html?uid=${postAuthorId}">${word}</a>`;
        words[index] = mentionTag;
      }
    });

    // Join the modified words back into the content and return
    return words.join(' ');
  }

 // Check if the user is signed in
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in
      console.log('User signed in:', user.displayName);
      displayUserProfile(user.uid, user.displayName, user.photoURL);
    
    } else {
      // User is signed out or not signed in
      console.log('User signed out or not signed in.');
      // Redirect the user to index.html or login.html
      window.location.href = 'index.html'; // or login.html
    }
  });
// Updated logout function with confirmation
function logout() {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Log out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        firebase.auth().signOut()
          .then(() => {
            console.log("User logged out");
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "User logged out successfully!"
            });
            window.location.href = "login.html"; // Redirect the user to the login page after logout
          })
          .catch((error) => {
            console.error("Logout error:", error);
            Swal.fire({
              icon: "error",
              title: "Logout Error",
              text: "An error occurred while logging out."
            });
          });
      }
    });
  }
  // Attach an event listener to the 'beforeunload' event
  window.addEventListener('beforeunload', function (e) {
    // Show a confirmation dialog using SweetAlert
    e.preventDefault();

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to leave this page!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, leave!',
      cancelButtonText: 'No, stay!'
    }).then((result) => {
      // If the user confirms, allow the page to be unloaded
      if (result.isConfirmed) {
        e.returnValue = '';
      }
    });
  });