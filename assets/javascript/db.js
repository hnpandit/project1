// Rutgers Coding BootCamp - Full Stack Developer - Mon/Wed
// Project 1 - HealthySearch Ilene, Dan, Juan & Himanshu  
// db.js - to interface with firebase databae
// January 12, 2019
    
// https://console.firebase.google.com/project/healthysearch-48e3f/database/healthysearch-48e3f/data/

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

var user = {
      userName:"",
      userFirstName:"",
      userLastName:"",
      userEmail:"",
      userCell:"",
      userZip:""
}

var favorites = {
  userName:"",
  doctorName:"",
  betterDoctorUID:""
}

function addUser(userName, FirstName, LastName, Email, Cell, Zip)
{
  user.userName = userName;
  user.userFirstName = FirstName;
  user.userLastName = LastName;
  user.userEmail = Email;
  user.userCell = Cell;
  user.userZip = Zip;

  database.ref("/users").push(user);  
}

function addFavorite(userName, Doctor, DoctorUID)
{
  favorites.userName = userName;
  favorites.doctorName = Doctor;
  favorites.betterDoctorUID = DoctorUID;

  database.ref("/favorites").push(favorites);  
}

function populateData()
{
    addUser("hpandit", "Himanshu", "Pandit", "hp@rcb.com", "(111) 111-1111", "08816");
    addUser("icohen", "Ilene", "Cohen", "ic@rcb.com", "(222) 222-2222", "07608");
    addUser("dsires", "Dan", "Sires", "ds@rcb.com", "(333) 333-3333", "90210");
    addUser("jduran", "Juan", "Duran", "jd@rcb.com", "(444) 444-4444", "06902");

    addFavorite("hpandit", "Dr. Scott Yager", "5bd1d56611167f74712548bbb968e9d8");
    addFavorite("hpandit", "Dr. Dinesh Singal", "5bd1d566119292f74712548bbb968e9d8");
    addFavorite("icohen", "Dr. Ralph Besho", "5bd1d56611167f74712548bbb968e9d8");
    addFavorite("dsires", "Dr. John Doe", "5bd1d56611167f74712548bbb968e9d8");
    addFavorite("jduran", "Dr. Miin Mathew", "5bd1d56611167f74712548bbb968e9d8"); 

    var newKey = firebase.database().ref().child('favorites').push().key;
    console.log(newKey);

    favorites.userName = "hpandit";
    favorites.doctorName = "New Doctor";
    favorites.DoctorUID = "SomeUID";
    var updates = {};
    updates['/favorites/' + newKey + '/'] = favorites;
    database.ref().update(updates);
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

function getUserZip()
{

  var ref = firebase.database().ref("/users");

  ref.on("value", function(snapshot) {
     var users = [];
     users = snapshotToArray(snapshot);
     for (i=0; i<users.length; i++)
     {
      console.log(users[i].userName);
      console.log(users[i].key);
      database.ref("/users/" + users[i].key).remove();
     }
  }, function (error) {
     console.log("Error: " + error.code);
  });
}

getUserZip();
//populateData();