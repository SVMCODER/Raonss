var firebaseConfig = {
  apiKey: "AIzaSyCOA_2bf_b1o1nXSHZO5Re5DjSD66Pa6MY",
  authDomain: "https://raona0-default-rtdb.firebaseio.com",
  projectId: "raona0",
  storageBucket: "raona0.appspot.com",
  messagingSenderId: "797719983777",
  appId: "1:797719983777:web:d7ffca1316891b51ec62e0"
};
firebase.initializeApp(firebaseConfig); // Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User is signed in
      const user = userCredential.user;
      console.log("User logged in:", user);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User logged in successfully!"
      });
      window.location.href = "home.html";
    })
    .catch((error) => {
      // Handle login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);

      if (errorCode === "auth/user-not-found") {
        // User account does not exist, prompt for username
        Swal.fire({
          title: "Create New Account",
          text: "Username",
          input: "text",
          showCancelButton: true,
          confirmButtonText: "Sign Up",
          showLoaderOnConfirm: true,
          preConfirm: (username) => {
            return firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed up:", user);
                return user.updateProfile({
                  displayName: username
                });
              })
              .catch((error) => {
                console.error("Sign up error:", error);
                Swal.showValidationMessage(`Sign up failed: ${error.message}`);
              });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "User signed up successfully!"
            });
            window.location.href = "home.html";
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Error",
          text: errorMessage
        });
      }
    });
}