// Rutgers Coding BootCamp - Full Stack Developer - Mon/Wed
// Project 1 - HealthySearch Ilene, Dan, Juan & Himanshu  
// db.js - to interface with firebase databae
// January 12, 2019
    
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
 
// Global Variables
var counter = 1;
var minutesAway = 0;
var nextArrival = "";

var train = {
      trainName:"",
      destination:"",
      startTime:"",
      frequency:0,
}

$("#btnAddTrain").on("click", function(event)
{
  event.preventDefault();
  
  train.trainName = $("#txtTrainName").val().trim();
  if (train.trainName.length === 0)
  {
    alert("Pleas enter train name.");
    return;
  }
  train.destination = $("#txtDestination").val().trim();
  if (train.destination.length === 0)
  {
    alert("Pleas enter destination.");
    return;
  }

  train.startTime = $("#txtFirstTrainTime").val().trim();
  if (train.startTime.length === 0)
  {
    alert("Pleas enter start time in HH:MM format.");
    return;
  }
  var startTimeConverted = moment(train.startTime, "HH:mm");
  if (startTimeConverted.isValid() === false)
  {
    alert("Pleas enter start time in HH:MM format.");
    return;
  }
  
  train.frequency = $("#txtFrequency").val().trim();
  if (train.frequency.length === 0)
  {
    alert("Pleas enter frequency in number format (e.g. 30)");
    return;
  }
  if (isNaN(train.frequency))
  {
    alert("Pleas enter frequency in number format (e.g. 30)");
    return;
  }

  database.ref("/schedule").push(train);  
})

function calculateNextTrainDetails()
{
  // initialize variabes
  minutesAway = 0;
  nextArrival = "";

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(train.startTime, "HH:mm").subtract(1, "years");

  // Current Time
  var currentTime = moment();

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  
  // Time apart (remainder)
  var tRemainder = diffTime % train.frequency;

  // Minute Until Train
  minutesAway = train.frequency - tRemainder;
 
  // Next Train
  var nextArrivalNonFormat = moment().add(minutesAway, "minutes");
  nextArrival = moment(nextArrivalNonFormat).format("hh:mm A")
}

function createTrainRecord()
{
  var rowRec = $("<tr>");
  var th = $("<th>");
  th.attr("scope","col");
  th.text(counter);
  var tdTrainName = $("<td>");
  tdTrainName.text(train.trainName);
  var tdDestination =  $("<td>");
  tdDestination.text(train.destination);
  var tdFrequency =  $("<td>");
  tdFrequency.text(train.frequency);
  var tdNextArrival =  $("<td>");
  tdNextArrival.text(nextArrival);
  var tdMinutesAway = $("<td>");
  tdMinutesAway.text(minutesAway);

  rowRec.append(th, tdTrainName, tdDestination, tdFrequency, tdNextArrival, tdMinutesAway);
  $("tbody").append(rowRec);
  counter = counter + 1;
  nextArrival = "";
  minutesAway = 0;
  $("#txtTrainName").val('');
  $("#txtDestination").val('');
  $("#txtFirstTrainTime").val('');
  $("#txtFrequency").val('');
}

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
database.ref("/schedule").on("child_added", function(childSnapshot) {

  // Make train object and add to the table
  train.trainName = childSnapshot.val().trainName;
  train.destination = childSnapshot.val().destination;
  train.startTime = childSnapshot.val().startTime;
  train.frequency = childSnapshot.val().frequency;

  calculateNextTrainDetails();
  createTrainRecord();

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});