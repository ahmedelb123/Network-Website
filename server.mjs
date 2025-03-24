import express from "express";
import { DataBase } from "./DataBase.mjs";
import bodyParser from "body-parser";
import expressSession from "express-session";
import cors from "cors";
import fileUpload from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// Initialize the database connection
const dataBase = new DataBase(
  "ahmedelb0101",
  "wassimos20",
  "cst2120",
  "cluster0.qcqhi.mongodb.net"
);

const app = express();

// Configure CORS to allow requests from the specified origin
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware to handle file uploads with a size limit of 10 MB
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  })
);

// Configure session management
app.use(
  expressSession({
    secret: "cst2120 secret", // Secret for signing the session ID cookie
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false, httpOnly: true },
    resave: false,
    saveUninitialized: true,
  })
);

// Third-party API key and endpoint
const apiKey = "ab24124bdd834620b21137e5232969ac";
const url =
  "https://api.football-data.org/v4/teams/86/matches?status=SCHEDULED";

// Fetch data from the third-party API and store it in the database
const response = await axios.get(url, {
  headers: {
    "X-Auth-Token": apiKey,
  },
});
await dataBase.insertOne("third-party-data", response.data);

// Function to register a new user
async function register(request, response) {
  try {
    const doc = request.body; // Extract user details from the request body

    // Check if the username is unique
    const users = await dataBase.find("users", doc);
    if (users.length == 0) {
      const result = await dataBase.insertOne("users", doc);
      console.log(result);
      response.send({
        register: true,
        message: "Document inserted successfully",
        result,
      });
    } else {
      response.send({
        register: false,
        message: "The username is already used",
      });
    }
  } catch (error) {
    console.error("Error inserting document:", error);
    response.send({ message: "Failed to insert document" });
  }
}

// Function to fetch users based on query parameters
async function getUsers(req, res) {
  try {
    const filters = req.query; // Extract query filters
    const results = await dataBase.find("users", filters); // Fetch users matching the filters
    res.send({ users: results });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.send({ message: "An error occurred while fetching users." });
  }
}

// Function to retrieve data from the third-party API collection
async function getApiData(req, res) {
  try {
    const filters = req.query; // Extract query filters
    const results = await dataBase.find("third-party-data", filters); // Fetch matching data
    res.send({ data: results });
  } catch (error) {
    console.error("Error fetching API data:", error);
    res.send({ message: "An error occurred while fetching API data." });
  }
}

// Function to retrieve all content
async function getAllContent(req, res) {
  try {
    const filters = req.query; // Extract query filters
    const results = await dataBase.find("content", filters); // Fetch all content matching filters
    res.send({ content: results });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.send({ message: "An error occurred while fetching content." });
  }
}

// Function to handle user login
async function Login(req, res) {
  try {
    const userLogin = req.body; // Extract login details from the request body

    if (!userLogin || Object.keys(userLogin).length === 0) {
      return res.send({ message: "No credentials provided." });
    }

    const results = await dataBase.find("users", userLogin); // Check credentials

    if (results.length > 0) {
      req.session.username = userLogin.username; // Save username in session
      return res.send({ message: "The credentials are correct" });
    } else {
      return res.send("The credentials are not correct");
    }
  } catch (error) {
    console.error("Error fetching login status:", error);
    res.status(500).send("An error occurred while checking login status.");
  }
}

// Function to check the login status of the user
async function checkLoginStatus(req, res) {
  try {
    const username = req.session.username; // Check if a user is logged in
    if (username) {
      res.send({ Login: true, username: username });
    } else {
      res.send({ Login: false });
    }
  } catch (error) {
    console.error("Error fetching login status:", error);
    res.send({ message: "An error occurred while checking login status." });
  }
}

// Function to log out the user
function logOut(req, res) {
  try {
    req.session.destroy(); // Destroy the session
    res.send({ "logged Out": true });
  } catch (error) {
    res.send({ message: "An error occurred while logging out." });
  }
}

async function postContent(req, res) {
  try {
    // get content
    const content = req.body;
    const data = content;
    const result = await dataBase.insertOne("content", data);
    res.send({ result: result, "content posted": true });
  } catch (error) {
    res.send({
      "content posted": false,
      message: "An error occurred while the user posting content.",
    });
  }
}
async function follow(req, res) {
  try {
    //get user
    const query = req.body;
    //get follower
    const followerName = req.session.username;
    //get the following name;
    const followingName = query.username;
    //get the object from the database for the current user
    const obj1 = await dataBase.find("users", { username: followerName });
    //get the object from the database for the current user
    const obj2 = await dataBase.find("users", { username: followingName });
    //get folowing arr of the current user
    const following = obj1[0].following;
    //get the arr of the followers of the other user
    const followers = obj2[0].followers;
    //update the following array
    const updatedFollowing = [...following, followingName];
    //update the followers array
    const updatedFollowers = [...followers, followerName];

    //create the update doc for following
    const updateDoc1 = { $set: { following: updatedFollowing } };
    //create the update doc for followers
    const updateDoc2 = { $set: { followers: updatedFollowers } };

    //update the following arr in the database;
    const result1 = await dataBase.updateOne(
      "users",
      { username: followerName },
      updateDoc1
    );
    //update the followers arr in the database;
    const result2 = await dataBase.updateOne(
      "users",
      { username: followingName },
      updateDoc2
    );
    res.send({ FollowAdded: true });
  } catch (error) {
    res.send({
      "Follow added": false,
      message: "An error occurred while the user try to follow another user.",
      error,
    });
  }
}
async function unfollow(req, res) {
  try {
    // get query
    const filter = req.query;
    //get the current user;
    const currentUser = req.session.username;
    //get the following
    const followingName = filter.username;
    //get the objects from the database
    const obj1 = await dataBase.find("users", { username: currentUser });
    const obj2 = await dataBase.find("users", { username: followingName });
    //get folowing arr of the current user
    const following = obj1[0].following;
    //get followers arr of the other user
    const followers = obj2[0].followers;
    //update the following array
    const updatedFollowing = following.filter((item) => item !== followingName);
    //update the followers arr
    const updatedFollowers = followers.filter((item) => item !== currentUser);
    //create the update doc for the current user (follower)
    const updateDoc1 = { $set: { following: updatedFollowing } };
    //create the update doc for the other user (following)
    const updateDoc2 = { $set: { followers: updatedFollowers } };

    //update the following arr in the database;
    const result1 = await dataBase.updateOne(
      "users",
      { username: currentUser },
      updateDoc1
    );
    //update the followers arr in the database;
    const result2 = await dataBase.updateOne(
      "users",
      { username: followingName },
      updateDoc2
    );
    res.send({ unFollow: true });
  } catch (error) {
    res.send({
      unFollow: false,
      message:
        "An error occurred while the user try to follow another user." + error,
    });
  }
}
async function getFollowingContent(req, res) {
  try {
    // Extract the current user
    const currentUser = req.session.username;
    //get the doc of the current user from the data base
    const doc = await dataBase.find("users", { username: currentUser });
    //get the arr of the follwing
    const following = doc[0].following;
    //get all content
    const allContent = await dataBase.find("content", {});
    //set the arr for the following content only
    let followingContent = [];
    for (const obj of allContent) {
      if (following.includes(obj.username)) {
        followingContent.push(obj);
      }
    }
    res.send({ followingContent: followingContent });
  } catch (error) {
    res.send({ message: error });
  }
}
async function searchForAUser(req, res) {
  try {
    // Extract query parameters from the request
    const filters = req.query;
    // find the user from the database
    const result = await dataBase.find("users", {
      $text: { $search: filters.username },
    });
    if (result.length == 0) {
      res.send({ User: result, message: "User not found" });
    } else {
      res.send({ User: result });
    }
  } catch (error) {
    res.send({ message: error });
  }
}
async function searchForContent(req, res) {
  try {
    // Extract query parameters from the request
    const filters = req.query;
    // find the user from the database
    const result = await dataBase.find("content", {
      $text: { $search: filters.content },
    });
    if (result.length == 0) {
      res.send({ content: result, message: "Content not found" });
    } else {
      res.send({ content: result });
    }
  } catch (error) {
    res.send({ message: error });
  }
}
async function uploadImages(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ upload: false, error: filesMissing });
  }
  let myFile = req.files.myFile;
  //check if its an image
  if (!myFile.mimetype.startsWith("image/")) {
    return res
      .status(400)
      .send({ upload: false, error: "File is not an image" });
  }
  let uniqueFileName = uuidv4();

  uniqueFileName += myFile.name.substring(
    myFile.name.indexOf("."),
    myFile.name.length
  );
  myFile.mv("./public/uploads/" + uniqueFileName, function (err) {
    if (err) {
      return res.status(500).send({
        filename: myFile.name,
        upload: false,
        err: err,
      });
    }
    res.send({ filename: uniqueFileName, upload: true });
  });
}

app.get("/M00940460/users", getUsers);
app.post("/M00940460/users", register);
app.post("/M00940460/login", Login);
app.get("/M00940460/login", checkLoginStatus);
app.delete("/M00940460/login", logOut);
app.post("/M00940460/content", postContent);
app.post("/M00940460/follow", follow);
app.delete("/M00940460/follow", unfollow);
app.get("/M00940460/content", getFollowingContent);
app.get("/M00940460/users/search", searchForAUser);
app.get("/M00940460/content/search", searchForContent);
app.get("/M00940460/AllContent", getAllContent);
app.post("/M00940460/uploadImages", uploadImages);
app.get("/M00940460/Api", getApiData);
app.use(express.static("public"));

app.listen(8080);
console.log("listening");
