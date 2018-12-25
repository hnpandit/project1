$(document).ready(function () {



    // global is an object that holds the global variables
    // drUID is an object that hold the doctor's first name, last name, and uid
    // specialties is an array of specialities the user can search for

    let global = {
        validform: true,
        specialities: ["primary care"],
        specialty:"",
        state:"",
        zipCode:0,
        insurance:"",
        doctorObj: {
            firstName: "",
            lastName: "",
            drUID: ""
        }
    }


    $("#search-button").on("click", function (event) {
        event.preventDefault();

        // get input from form

        global.specialty = $("#state-input").val().trim();
        global.zipCode = $("#zip-input").val().trim();
        global.state = $("#state-input").val().trim();
        global.insurance = $("#insurance-input").val().trim();

        //validate input - if an input field is invalid, will return form with error messages for all invalid fields

        validateInput(global.specialty, global.zipCode, global.state);


        // if all entries are search doctor data base using ajax and better doctor api

        if (state.validform) {

            //set values of train to be pushed to firebase

            state.trainObj.trainName = state.trainName;
            state.trainObj.destination = state.destination;
            state.trainObj.frequency = state.freqInMin;
            state.trainObj.firstTrain = state.firstTrain;
            state.trainObj.track = state.arrTrack;


            // Code for the push
            database.ref("trains").push(state.trainObj);

            //empty form values
            $("#train-name").val("");
            $("#destination").val("");
            $("#frequency").val("");
            $("#first-train").val("");
            $("#trackNo").val("");
        }
        else {
            state.validform = true;
        }

    });

    // retrive data from firebase
    // random generator will give each train it's own id

    database.ref("trains").on("child_added", function (snapshot) {
        let childAddedTrain = {
            id: Math.floor(Math.random() * 100000000) + 1,
            trainName: snapshot.val().trainName,
            destination: snapshot.val().destination,
            freqInMin: snapshot.val().frequency,
            arrTrack: snapshot.val().track,
            firstTrain: snapshot.val().firstTrain
        }

        // Check if this object exists in the state array of trains
        let trainExists = state.trains.find(function (train) {
            return train.id === childAddedTrain.id;
        })

        // Push into the array if the train does not exist
        if (!trainExists) {
            state.trains.push(childAddedTrain)
        }

        trainName = snapshot.val().trainName;
        destination = snapshot.val().destination;
        freqInMin = snapshot.val().frequency;
        arrTrack = snapshot.val().track;
        firstTrain = snapshot.val().firstTrain;

        renderTrains();

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);

        setInterval(renderTrains, 60000)


    });

    // this function is called to validate the input data

    function validateInput(specialty, state, zipCode, insurance) {
        //if a field is invalid - valid form is set to false

        // check that train name was entered

        if (trainName == "") {
            let errorMsg = "Please Enter Train Name";
            document.getElementById("trainNameError").innerHTML = errorMsg;
            state.validform = false;

        }
        else {
            clearErrMsg("trainNameError");
        }
        // check that destination was entered

        if (destination == "") {
            errorMsg = "Please Enter Destination";
            document.getElementById("destinationError").innerHTML = errorMsg;
            state.validform = false;

        }
        else {
            clearErrMsg("destinationError");
        }

        //check to see that first-train is a valid military time between 00:00 - 23:59
        //note max text size of first-train is 5, therefore position 3 should be a "":"

        timeTrain = moment(firstTrain, "HH:mm");
        let militChar = firstTrain.charAt(2);
        errorMsg = "Invalid - time must be entered in military time";
        if (militChar !== ":") {
            document.getElementById("firstTrainError").innerHTML = errorMsg;
            state.validform = false;
        }
        else {
            let isItMilitary = firstTrain.substr(0, 2);
            if (isItMilitary < 0 || isItMilitary > 23) {
                document.getElementById("firstTrainError").innerHTML = errorMsg;
                state.validform = false;
            }
            else {
                isItMilitary = parseInt(firstTrain.substr(3, 2));
                if (isItMilitary < 0 || isItMilitary > 59) {
                    document.getElementById("firstTrainError").innerHTML = errorMsg;
                    state.validform = false;
                }
                else {
                    clearErrMsg("firstTrainError");

                }
            }
        }

        //check that frequency was entered
        //check to make sure frequency is not entered as an "e" (undefined) as numeric data can be enter an "e" or zero
        if (isNaN(freqInMin) || freqInMin === "" || freqInMin === "0") {
            errorMsg = "Please Enter Frequency -  must be at least 1";
            document.getElementById("frequencyError").innerHTML = errorMsg;
            state.validform = false;
        }
        else {
            clearErrMsg("frequencyError");
        }

        //not required to enter a track number, but if it is must be a number greater than 0
        if (arrTrack === "0") {
            errorMsg = "Invalid track number - must be at least 1";
            document.getElementById("trackError").innerHTML = errorMsg;
            state.validform = false;
        }
        else {
            clearErrMsg("trackError");
        }
        return state.validform;
    }


    //this function is used to clear any error messages
    function clearErrMsg(idName) {
        errorMsg = "";
        document.getElementById(idName).innerHTML = errorMsg;

    }

    // this function displays the train schedule on the board
    function renderTrains() {
        $("#train-table > tbody").empty();

        // save each train from database in array train

        state.trains.forEach(function (train) {
            let { trainName, destination, freqInMin, nextArrival, arrTrack, firstTrain } = train;
            let { minToTrain, timeOfNextTrain } = calcTimes(firstTrain, freqInMin);

            //put time on header bar
            document.getElementById("header-time").innerHTML = moment().format("MM/DD/YYYY hh:mm A");

            // Create new row in train schedule
            //only create row if train is scheduled to arrive within 30 minutes; 
            //if minutes to arrive is less than 3, then put that the train is boarding; arrival track defaults to 1 if not entered

            let status = " ";
            if (minToTrain < 3) {
                status = "Boarding";
                if (arrTrack === " ") {
                    arrTrack = 1;
                }
            }

            if (minToTrain <= 30) {
                let trainRow = $("<tr>").append(
                    $("<td>").text(trainName),
                    $("<td>").text(destination),
                    //        $("<td>").text(freqInMin),
                    $("<td>").text(timeOfNextTrain),
                    $("<td>").text(minToTrain),
                    $("<td>").text(arrTrack),
                    $("<td>").text(status),
                );


                // Append the new row to the table
                $("#train-table > tbody").append(trainRow);

            }

        });
    }

    // this function calculates the number of minutes away and next arrival time

    function calcTimes(firstTrain, freqInMin) {
        let timeTrain = moment(firstTrain, "HH:mm");
        let currentTime = moment();
        let diffTime = moment().diff(moment(timeTrain, "minutes"));
        let tRemainder = diffTime % freqInMin;

        // determine if first train time is after current time
        // to determine how many minutes away and next arrival time

        if (timeTrain > currentTime) {
            minToTrain = moment(timeTrain).diff(moment(), "minutes");
            timeOfNextTrain = moment(timeTrain).format("hh:mm A");
            return { minToTrain: minToTrain, timeOfNextTrain: timeOfNextTrain }
        }
        else {
            minToTrain = freqInMin - tRemainder;
            timeOfNextTrain = moment().add(minToTrain, "minutes").format("h:mm A");
            return { minToTrain: minToTrain, timeOfNextTrain: timeOfNextTrain }
        }

    }


});