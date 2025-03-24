// Function to show the sign-up form and hide the login form
function SignUpLink() {
  // Get the SignUpInfo div (sign-up form)
  const SignUpDiv = document.querySelector(".SignUpInfo");
  // Get the LoginInfo div (login form)
  const LoginDiv = document.querySelector(".LoginInfo");

  // Show the sign-up form
  SignUpDiv.style.display = "block";
  // Hide the login form
  LoginDiv.style.display = "none";
}

// Function to show the login form and hide the sign-up form
function LoginLink() {
  // Get the SignUpInfo div (sign-up form)
  const SignUpDiv = document.querySelector(".SignUpInfo");
  // Get the LoginInfo div (login form)
  const LoginDiv = document.querySelector(".LoginInfo");

  // Hide the sign-up form
  SignUpDiv.style.display = "none";
  // Show the login form
  LoginDiv.style.display = "block";
}

// Function to hide the 'already have an account' message, and show the login form
function LoginLink2() {
  // Get the SignUpInfo div (sign-up form)
  const SignUpDiv = document.querySelector(".SignUpInfo");
  // Get the LoginInfo div (login form)
  const LoginDiv = document.querySelector(".LoginInfo");
  // Get the message that says "You already have an account"
  const message = document.querySelector(".hasAccount");

  // Hide the 'already have an account' message
  message.style.display = "none";
  // Hide the sign-up form
  SignUpDiv.style.display = "none";
  // Show the login form
  LoginDiv.style.display = "block";
}
