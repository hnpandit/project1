// Rutgers Coding BootCamp - Full Stack Developer - Mon/Wed
// Project 1 - DocFax - Ilene, Dan, Juan & Himanshu  
// db.js - to interface with firebase databae
// January 12, 2019
    
// https://console.firebase.google.com/project/healthysearch-48e3f/database/healthysearch-48e3f/data/
// Reference: https://firebase.google.com/docs/database/web/read-and-write

// Initialize Firebase

var config = {
    apiKey: "AIzaSyAeth_P5AJXPg7eLNIkOpVsiggFWNSyE-U",
    authDomain: "healthysearch-48e3f.firebaseapp.com",
    databaseURL: "https://healthysearch-48e3f.firebaseio.com",
    projectId: "healthysearch-48e3f",
    storageBucket: "",
    messagingSenderId: "871859770952"
  };
 
firebase.initializeApp(config);

database = firebase.database();

var favorites = {
  doctorID:""
}

function addFavorite(doctorID)
{
  favorites.doctorID = doctorID;

  database.ref("/favorites").push(favorites);  
}

function displayFavorites()
{
    var ref = firebase.database().ref("/favorites");

    $("#results").empty();
    ref.on("value", function(snapshot) 
    {  
      var favorites = [];
      favorites = snapshotToArray(snapshot);
      for (i=0; i<favorites.length; i++)
      {
        console.log("Display details for doctor with NPID " + favorites[i].doctorID);
        myFavorites(favorites[i].doctorID);
      }
      }, function (error) {
        console.log("Error: " + error.code);
    });
}

function snapshotToArray(snapshot) {
  
  var returnArr = [];

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      item.key = childSnapshot.key;

      returnArr.push(item);
  });

  return returnArr;
};