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
  doctorID:"",
  doctorName:"",
  doctorLong:"",
  doctorLat:""
}

function addFavorite(doctorID, doctorName, doctorLong, doctorLat)
{
  favorites.doctorID = doctorID;
  favorites.doctorName = doctorName;
  favorites.doctorLong = doctorLong;
  favorites.doctorLat = doctorLat;

  database.ref("/favorites").push(favorites);  
}

function displayFavorites()
{
    var ref = firebase.database().ref("/favorites");

    $("#results").empty();
    $("#doc-details").empty();

    ref.on("value", function(snapshot) 
    {  
      var favorites = [];
      favorites = snapshotToArray(snapshot);

      for (i=0; i<favorites.length; i++)
      {
        let strFavDoctor = "";
        let favDiv = $("<div class='docdiv'>");
        strFavDoctor = favorites[i].doctorName;
        let para = $("<p class='para'>").text(strFavDoctor);
        favDiv.append(para);
        $("#results").append(favDiv).innerHTML;
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