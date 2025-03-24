//Check the structure if the email
function checkEmail(email) {
  const emailRegex = new RegExp(
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  );
  return emailRegex.test(email);
}

// It checks the level of the difficulty for the password;
function checkPassword(password) {
  const strongPassword = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
  );
  return strongPassword.test(password);
}

// Checks if all the field have been filled;
function checkFields(email, name, number, password) {
  return email != "" && name != "" && number != "" && password != "";
}
//This get request to get the users from the data base depend on the query
async function getUsers(query) {
  try {
    const result = await fetch("http://localhost:8080/M00940460/users" + query);
    if (result.ok) {
      let resultData = await result.json();
      console.log(resultData);
      return resultData;
    } else {
      console.log("http Error:" + result.status);
      return;
    }
  } catch (error) {
    console.log(`Error fetch users: ${error}`);
    return;
  }
}
//check name
function checkName(name) {
  return name.length > 1;
}
// check if its a valid number;
function checkNumber(number) {
  if (!isNaN(Number(number))) {
    return number.length >= 10 && number.length < 25;
  }
  return false;
}
// storing data in localStorage;
async function createAcc() {
  const email = document.getElementById("email").value;
  const Username = document.getElementById("Username").value;
  const number = document.getElementById("number").value;
  const password = document.getElementById("password").value;

  const errorMessageEmail = document.querySelector(".notEmail");
  const errorMessageWeakPassword = document.querySelector(".notStrongPassword");
  const alreadyHasAccountMessage = document.querySelector(".hasAccount");
  const errorMessageEmptyField = document.querySelector(".emptyField");
  const errorMessageValidationNumber = document.querySelector(".wrongNumber");
  const shortName = document.querySelector(".shortUsername");
  const usenameUsed = document.querySelector(".usernameUsed");

  errorMessageEmail.style.display = "none";
  errorMessageWeakPassword.style.display = "none";
  alreadyHasAccountMessage.style.display = "none";
  errorMessageEmptyField.style.display = "none";
  errorMessageValidationNumber.style.display = "none";
  shortName.style.display = "none";
  usenameUsed.style.display = "none";

  if (!checkFields(email, Username, number, password)) {
    errorMessageEmptyField.style.display = "block";
    return;
  }
  if (!checkEmail(email)) {
    errorMessageEmail.style.display = "block";
    return;
  }
  if (!checkNumber(number)) {
    errorMessageValidationNumber.style.display = "block";
    return;
  }
  if (!checkPassword(password)) {
    errorMessageWeakPassword.style.display = "block";
    return;
  }
  const users = await getUsers(`?email=${encodeURIComponent(email)}`);
  const usernameUsed = await getUsers(
    `?username=${encodeURIComponent(Username)}`
  );
  if (users.users.length != 0) {
    alreadyHasAccountMessage.style.display = "block";
    return;
  }
  if (usernameUsed.users.length != 0) {
    usenameUsed.style.display = "block";
    return;
  } else if (!checkName(Username)) {
    shortName.style.display = "block";
    //if all good it send the user details with a post methode to store the data of the user in database
  } else {
    let userData = {
      email: email,
      username: Username,
      number: number,
      password: password,
      following: [],
      followers: [],
    };
    const SignUpDiv = document.querySelector(".SignUpInfo");
    const LoginDiv = document.querySelector(".LoginInfo");
    SignUpDiv.style.display = "none";
    LoginDiv.style.display = "block";

    // Convert the object to JSON format
    let userDataJSON = JSON.stringify(userData);
    try {
      const response = await fetch("http://localhost:8080/M00940460/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: userDataJSON,
        credentials: "include",
      });
      const result = await response.json();
      console.log(result);
      sessionStorage.setItem("last", "sign-up");
    } catch (error) {
      console.log(error);
    }
  }
}

//if all details are correct it save the login account in the sessionStorage
async function checkLoginDetails() {
  const email = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const incorrectEmailOrPassword = document.querySelector(".dontHaveAccount");
  const incorrectPassword = document.querySelector(".haveAccount");
  const missingdetails = document.querySelector(".emptyField");
  const container1 = document.querySelector(".container1");
  const homePage = document.querySelector(".HomePage");

  incorrectEmailOrPassword.style.display = "none";
  incorrectPassword.style.display = "none";
  missingdetails.style.display = "none";
  if (email == "" || password == "") {
    missingdetails.style.display = "block";
  }
  const users = await getUsers(`?username=${email}`);
  if (users.users.length != 0) {
    const userAcc = await getUsers(`?username=${email}&password=${password}`);
    if (userAcc.users.length == 0) {
      incorrectPassword.style.display = "block";
      return;
    } else {
      let userData = { username: email, password: password };
      // Convert the object to JSON format
      let userDataJSON = JSON.stringify(userData);
      //send a request to login this user into the website
      try {
        const response = await fetch("http://localhost:8080/M00940460/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: userDataJSON,
          credentials: "include",
        });
        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.log(error);
      }
      container1.style.display = "none";
      homePage.style.display = "block";
      const allContent = await CreatAllContent();
      sessionStorage.setItem("last", "login");
      await uploadApi();
    }
  } else {
    incorrectEmailOrPassword.style.display = "block";
  }
}
//check if this user is followed by or not
async function checkFollowStatus(username) {
  const response1 = await fetch("http://localhost:8080/M00940460/login", {
    method: "GET",
    credentials: "include",
  });
  const result = await response1.json();
  const query = `?username=${encodeURIComponent(result.username)}`;
  const response2 = await getUsers(query);
  const userInfo = response2.users[0];
  console.log(userInfo);
  if (username == result.username) {
    return null;
  }
  return userInfo.following.includes(username);
}
// Create the post dynamically
async function createPost(Username, Content, imageSrc) {
  // Create the main post container
  const post = document.createElement("div");
  post.className = "Post";

  // Create the profile picture section
  const profilePicture = document.createElement("div");
  profilePicture.className = "ProfilePicture";
  const profileButton = document.createElement("button");
  profileButton.type = "button";
  profilePicture.appendChild(profileButton);

  // Create the username section
  const username = document.createElement("div");
  username.className = "Username";
  username.textContent = Username;

  // Create the content section
  const content = document.createElement("div");
  content.className = "Content";
  content.textContent = Content;

  // Create the like-comment bar
  const likeCommentBar = document.createElement("div");
  likeCommentBar.className = "like-comment-bar";

  // Create the like button
  const likeButton = document.createElement("button");
  likeButton.className = "like-button";
  likeButton.innerHTML = '<i class="fa fa-thumbs-up"></i> 0 Like';

  // Create the comment button
  const commentButton = document.createElement("button");
  commentButton.className = "comment-button";
  commentButton.innerHTML = '<i class="fa fa-comment"></i> 0 Comment';

  // Append buttons to the like-comment bar
  likeCommentBar.appendChild(likeButton);
  likeCommentBar.appendChild(commentButton);

  // Assemble the post
  post.appendChild(profilePicture);
  post.appendChild(username);
  const followButton = document.createElement("button");
  const updateFollowButton = async () => {
    const followStatus = await checkFollowStatus(Username);
    if (followStatus === false) {
      followButton.className = "follow-button";
      followButton.innerHTML = "Follow";
      followButton.onclick = async () => {
        let data = { username: Username };
        const jsonData = JSON.stringify(data);
        try {
          const response = await fetch(
            "http://localhost:8080/M00940460/follow",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: jsonData,
              credentials: "include",
            }
          );
          const result = await response.json();
          if (result.FollowAdded === true) {
            console.log("Followed successfully");
            updateFollowButton(); // Refresh the button state
          }
        } catch (error) {
          console.log("Error happened: " + error);
        }
      };
    } else if (followStatus === true) {
      followButton.className = "unfollow-button";
      followButton.innerHTML = "Unfollow";
      followButton.onclick = async () => {
        try {
          const query = `?username=${encodeURIComponent(Username)}`;
          const response = await fetch(
            "http://localhost:8080/M00940460/follow" + query,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const result = await response.json();
          if (result.unFollow === true) {
            console.log("Unfollowed successfully");
            updateFollowButton(); // Refresh the button state
          }
        } catch (error) {
          console.log("Error happened: " + error);
        }
      };
    }
  };
  await updateFollowButton();
  post.appendChild(followButton);

  post.appendChild(content);
  if (imageSrc != null) {
    // Create a div to hold the image
    const postImageDiv = document.createElement("div");
    postImageDiv.classList.add("PostImage");

    // Create the image element
    const imgElement = document.createElement("img");
    imgElement.src = "../uploads/" + imageSrc; // Set the source of the image
    imgElement.alt = "Uploaded Image"; // Add an alt attribute for accessibility

    // Append the image to the div
    postImageDiv.appendChild(imgElement);
    post.appendChild(postImageDiv);
  }
  post.appendChild(likeCommentBar);

  // Append the post to a parent container (e.g., a div with id 'posts-container')
  const postsContainer = document.querySelector(".AllPosts");
  postsContainer.appendChild(post);
}
// this is the upload button
function upload() {
  const addPostContainer = document.querySelector(".AddPostContainer");
  let fileArr = document.getElementById("FileInput");
  fileArr.value = "";
  const content = document.getElementById("BlogContent");
  content.value = "";

  let serverRes = document.getElementById("serverRes");
  serverRes.innerHTML = "";
  addPostContainer.style.display = "block";
}
// this button is to cancel a post
function cancelPost() {
  const addPostContainer = document.querySelector(".AddPostContainer");
  addPostContainer.style.display = "none";
}
// this button to add a post and send a request to the server to save that post
async function addPost() {
  const content = document.getElementById("BlogContent").value;
  const response = await fetch("http://localhost:8080/M00940460/login", {
    method: "GET",
    credentials: "include",
  });
  const result = await response.json();
  const username = result.username;
  const imageSrc = await uploadFile();
  const post = await createPost(username, content, imageSrc);
  let userData = {
    username: username,
    content: content,
    image: imageSrc,
    likes: 0,
    comments: [],
  };
  console.log(result);
  // Convert the object to JSON format
  let userDataJSON = JSON.stringify(userData);
  try {
    const response = await fetch("http://localhost:8080/M00940460/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: userDataJSON,
      credentials: "include",
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.log("Error happend: " + error);
  }

  const addPostContainer = document.querySelector(".AddPostContainer");
  addPostContainer.style.display = "none";
}

async function logOut() {
  const request = await fetch("http://localhost:8080/M00940460/login", {
    method: "DELETE",
    credentials: "include",
  });
  const homePage = document.querySelector(".HomePage");
  const container1 = document.querySelector(".container1");
  const allPosts = document.querySelector(".AllPosts");
  allPosts.innerHTML = "";
  homePage.style.display = "none";
  container1.style.display = "block";
  sessionStorage.setItem("last", "logout");
}
// this function request from the server all the content stored for all the user and displayed them
async function CreatAllContent() {
  try {
    const response = await fetch("http://localhost:8080/M00940460/AllContent", {
      method: "GET",
      credentials: "include",
    });
    const jsonResponse = await response.json();
    const allContent = jsonResponse.content;

    const loginDiv = document.querySelector(".container1");
    const allPosts = document.querySelector(".AllPosts");
    allPosts.innerHTML = "";
    loginDiv.style.display = "none";
    for (let i = 0; i < allContent.length; i++) {
      const content = allContent[i].content;
      const username = allContent[i].username;
      const imageSrc = allContent[i].image;
      const post = await createPost(username, content, imageSrc);
    }
  } catch (error) {
    console.log("Error occupied: " + error);
  }
}

async function displaySearchContent() {
  try {
    const search = document.getElementById("searchContent").value;
    const query = `?content=${encodeURIComponent(search)}`;
    const response = await fetch(
      "http://localhost:8080/M00940460/content/search" + query,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const jsonResponse = await response.json();
    const contentArr = jsonResponse.content;
    console.log(contentArr);

    if (search != "") {
      const allPosts = document.querySelector(".AllPosts");
      allPosts.innerHTML = "";
      if (contentArr.length != 0) {
        for (let i = 0; i < contentArr.length; i++) {
          const content = contentArr[i].content;
          const username = contentArr[i].username;
          const imageSrc = contentArr[i].image;
          const post = await createPost(username, content, imageSrc);
        }
      } else {
        const message = document.querySelector(".NoContent");
        message.style.display = "block";
      }
    }
  } catch (error) {
    console.log("Error occupied: " + error);
  }
}
async function CreatUser(Username) {
  const user = document.createElement("div");
  user.className = "user";
  const username = document.createElement("div");
  username.className = "Username";
  username.textContent = Username;
  // Create the profile picture section
  const profilePicture = document.createElement("div");
  profilePicture.className = "ProfilePicture";
  const profileButton = document.createElement("button");
  profileButton.type = "button";
  profilePicture.appendChild(profileButton);
  user.appendChild(profilePicture);
  user.appendChild(username);
  const followButton = document.createElement("button");
  const updateFollowButton = async () => {
    const followStatus = await checkFollowStatus(Username);
    if (followStatus === false) {
      followButton.className = "follow";
      followButton.innerHTML = "Follow";
      followButton.onclick = async () => {
        let data = { username: Username };
        const jsonData = JSON.stringify(data);
        try {
          const response = await fetch(
            "http://localhost:8080/M00940460/follow",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: jsonData,
              credentials: "include",
            }
          );
          const result = await response.json();
          if (result.FollowAdded === true) {
            console.log("Followed successfully");
            updateFollowButton(); // Refresh the button state
          }
        } catch (error) {
          console.log("Error happened: " + error);
        }
      };
    } else if (followStatus === true) {
      followButton.className = "unfollow";
      followButton.innerHTML = "Unfollow";
      followButton.onclick = async () => {
        try {
          const query = `?username=${encodeURIComponent(Username)}`;
          const response = await fetch(
            "http://localhost:8080/M00940460/follow" + query,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const result = await response.json();
          if (result.unFollow === true) {
            console.log("Unfollowed successfully");
            updateFollowButton(); // Refresh the button state
          }
        } catch (error) {
          console.log("Error happened: " + error);
        }
      };
    }
  };
  await updateFollowButton();
  user.appendChild(followButton);
  const userContainer = document.querySelector(".GetUsers");
  userContainer.appendChild(user);
}

// thus function display only the content that you searched for
async function displaySearchedUsers() {
  try {
    const search = document.getElementById("searchUser").value;
    const query = `?username=${encodeURIComponent(search)}`;
    const response = await fetch(
      "http://localhost:8080/M00940460/users/search" + query,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const jsonResponse = await response.json();
    const userArr = jsonResponse.User;

    if (search != "") {
      const users = document.querySelector(".GetUsers");
      users.innerHTML = "";
      if (userArr.length != 0) {
        for (let i = 0; i < userArr.length; i++) {
          const username = userArr[i].username;
          const user = await CreatUser(username);
        }
        users.style.display = "block";
      }
    }
  } catch (error) {
    console.log("Error occupied: " + error);
  }
}
// this is a button where it shows you all the content
async function forYou() {
  const NoContentMessage = document.querySelector(".NoContent");
  const foryou = document.querySelector(".ForYou");
  const followingButton = document.querySelector(".Following");
  foryou.style.opacity = "1";
  followingButton.style.opacity = "0.5";
  NoContentMessage.style.display = "none";
  await CreatAllContent();
  sessionStorage.setItem("last", "foryou");
}
// this one shows you the content from the users you follow
async function followingContent() {
  try {
    const response = await fetch("http://localhost:8080/M00940460/Content", {
      method: "GET",
      credentials: "include",
    });
    const jsonResponse = await response.json();
    const allContent = jsonResponse.followingContent;

    const loginDiv = document.querySelector(".container1");
    const allPosts = document.querySelector(".AllPosts");
    allPosts.innerHTML = "";
    loginDiv.style.display = "none";
    for (let i = 0; i < allContent.length; i++) {
      const content = allContent[i].content;
      const username = allContent[i].username;
      const imageSrc = allContent[i].image;
      const post = await createPost(username, content, imageSrc);
    }
    const foryou = document.querySelector(".ForYou");
    const followingButton = document.querySelector(".Following");
    foryou.style.opacity = "0.5";
    followingButton.style.opacity = "1";
    sessionStorage.setItem("last", "following");
  } catch (error) {
    console.log("Error occupied: " + error);
  }
}
// this function allows you to uplod files and images specificly
async function uploadFile() {
  let fileArr = document.getElementById("FileInput").files;
  let serverRes = document.getElementById("serverRes");
  serverRes.innerHTML = "";
  if (fileArr.length !== 1) {
    serverRes.innerHTML = "No image uploaded";
    return null;
  }

  const formData = new FormData();
  formData.append("myFile", fileArr[0]);

  try {
    const response = await fetch(
      "http://localhost:8080/M00940460/uploadImages",
      {
        method: "POST",
        body: formData, // Let the browser handle the Content-Type
        credentials: "include",
      }
    );

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const result = await response.json();
    if (result.upload) {
      serverRes.innerHTML = "Image uploaded successfully";
      return result.filename;
    } else {
      serverRes.innerHTML = result.error || "Upload failed";
      return null;
    }
  } catch (error) {
    console.error("Upload failed:", error);
    serverRes.innerHTML = `Error: ${error.message}`;
    return null;
  }
}
//this function reques the data from the api
async function uploadApi() {
  try {
    const response = await fetch("http://localhost:8080/M00940460/Api", {
      method: "GET",
      credentials: "include",
    });
    const jsonResponse = await response.json();
    const data = jsonResponse.data;
    const lastData = data[data.length - 1];
    try {
      // Iterate through matches
      const apiDiv = document.querySelector(".apiData");
      const matche = document.querySelector(".m");
      const matches = document.querySelector(".matches");
      matches.innerHTML = "";
      let hometeam = null;
      let awayteam = null;
      let count = 0;
      if (lastData.matches) {
        for (let match of lastData.matches) {
          if (count == 3) {
            break;
          }
          if (hometeam != null && awayteam != null) {
            const match = document.createElement("div");
            match.className = "m";
            match.innerHTML = `${hometeam}  vs  ${awayteam}`;
            matches.appendChild(match);
            count++;
            hometeam = null;
            awayteam = null;
          }
          if (match.homeTeam) {
            hometeam = match.homeTeam.name;
          }
          if (match.awayTeam) {
            awayteam = match.awayTeam.name;
          }
        }
        apiDiv.appendChild(matches);
      } else {
        console.log("No matches found.");
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        console.error("HTTP Status:", error.response.status);
      } else {
        console.error("Unexpected Error:", error.message);
      }
    }
  } catch (err) {
    console.log("Error: " + err);
  }
}
// this function control the dynamic of the pages
async function initializePage() {
  const container = document.querySelector(".container1");
  const HomePage = document.querySelector(".HomePage");
  const loginDiv = document.querySelector(".LoginInfo");
  const SignUpDi = document.querySelector(".SignUpInfo");
  const lastClickedButton = sessionStorage.getItem("last");
  try {
    const response = await fetch("http://localhost:8080/M00940460/login", {
      method: "GET",
      credentials: "include",
    });
    const result = await response.json();
    const status = result.Login;
    if (status) {
      if (lastClickedButton === "login") {
        container.style.display = "none";
        HomePage.style.display = "block";
        await uploadApi();
        await CreatAllContent();
      } else if (lastClickedButton === "sign-up") {
        HomePage.style.display = "none";
        container.style.display = "block";
        loginDiv.style.display = "block";
        SignUpDi.style.display = "none";
        await uploadApi();
      } else if (lastClickedButton === "foryou") {
        HomePage.style.display = "block";
        container.style.display = "none";
        await uploadApi();
        await forYou();
      } else if (lastClickedButton === "following") {
        HomePage.style.display = "block";
        container.style.display = "none";
        await uploadApi();

        await followingContent();
      } else if (lastClickedButton === "logout") {
        await logOut();
        HomePage.style.display = "none";
        container.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}
window.onload = async () => {
  await initializePage();
};
