$(document).ready(function () {



    // global is an object that holds the global variables
    // drUID is an object that hold the doctor's first name, last name, and uid
    // specialties is an array of specialities the user can search for

    let global = {
        validform: true,
        specialities: ["internist", "oncologist", "dermatologist", "cardiologist", "opthamologist"],
        states: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IN", "IL", "IA",
                "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
                "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA",
                "WV", "WI", "WY"],
        specialty: "",
        state: "",
        zipCode: 0,
        insurance: "",
        firstName: [],
        lastName: [],
        drUID: [],
        drSlug: []
    }



    $("#search-button").on("click", function (event) {
        event.preventDefault();

        // get input from form

        global.specialty = $("#specialty-input").val().trim();
        global.zipCode = $("#zip-input").val().trim();
        global.state = $("#state-input").val().trim();
        global.insurance = $("#insurance-input").val().trim();

        //validate input - if an input field is invalid, will return form with error messages for all invalid fields

        validateInput(global.specialty, global.zipCode, global.state);


        // valid search data entered, search doctor data base using ajax and better doctor api

        if (!global.validform) {
            return;
        }

        // form is valid, find doctors based on search criteria entered

        findDocInfo

        //empty form values
        $("#specialty-input").val("");
        $("#zip-input").val("");
        $("#state-input").val("");
        $("#insurance-input").val("");
    });

    // this function is called to validate the input data

    function validateInput(specialty, state, zipCode, insurance) {
        //if a field is invalid - valid form is set to false

        // at least one seach item must be entered
        global.validform = true;
        if (specialty == "" && state == "" && zipCode == "" && insurance == "") {
            global.validform = false;
            return global.validform;
        }
        // check that a valid specialty is entered
        if (!global.specialty.includes(specialty)) {
            global.validform = false;

        }

        // check that a valid state is entered

        if (!global.states.includes(state.toUpperCase())) {
            global.validform = false;
        }
    }

    //this function gets the doctors from better doctor api using ajax

    function getDoctorinfo(specialty, state, zip, insurance) {

        function findDoctors(specialty, state, zipCode, insurance) {
            //    doctorSearch = $(this).attr("char-name");
            console.log("specialty " + specialty);
            console.log("state " + state);
            console.log("zipCode " + zipCode);
            console.log("insurance " + insurance);
            // determine if query is to be searched in api
    let query = " ";
            if (specialty !== "") {
                console.log("specialty " + specialty);
              query = specialty;
            }
            else {
                query = "";
            }
            console.log ("query " + query);
            if (zipCode !== " ") {
                if (query !== " ") {
                    query = query + " " + zipCode;
                }
                else {
                    query = zipCode;
    
                }
            }
            if (insurance !== " ") {
                if (query !== " ") {
                    query = query + insurance;
                }
                else {
                    query = insurance;
                }
            }
        
        let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors?specialty_uid=" + specialty +
            "&location=" + state + "&query="+query+"&skip=0&limit=20&user_key=c73e643548e8388f4f7cf67fbc5fbc38";
        console.log(queryURL);
        $.ajax({
            url: queryURL,
            method: "GET"
    
            // data gets back from API
    
        }).then(function (response) {
    
            // data from API in results
            //maximum number of info wanted for each character is 10
            //get still picture, animated picture, title and rating
            //empty images to remove previous character images
    
            $("#results").empty();
    
            let results = response.data;
            // check that data was obtained, if no data obtained send message
            if (results.length === 0) {
                $("#results").text("No doctors found");
                return;
            }
            let maxLength = 20;
            if (results.length < 20) {
                maxLength = results.length;
            }
            let docDiv = $("<div>");
    
            // retrieve data from api to display
            //save doctor's name, UID, and slug in order to retrieve additional information if doctor is selected
    
            for (let i = 0; i < maxLength; i++) {
                let docImg = $("<img id='imgStyle'>");
                docImg.addClass("doc-button doctor doc-pic-size");
                docImg.attr("data-still", results[i].profile.image_url);
                docImg.attr("src", results[i].profile.image_url);
    
    
                let drFirstName = results[i].profile.first_name.trim();
                global.docFirstName.push(drFirstName);
                let drLastName = results[i].profile.last_name.trim();
                global.docLastName.push(drLastName);
                let drSlug = results[i].profile.slug;
                global.docSlug.push(drSlug);
               let drUID=results[i].uid;
                global.docUID.push(drUID);
                console.log("uid " + drUID);
                let street = results[i].practices[0].visit_address.street;
                let city = results[i].practices[0].visit_address.city;
                let state = results[i].practices[0].visit_address.state;
                let zipCode = results[i].practices[0].visit_address.zip;
                let rating = results[i].ratings;
                if (rating = " ") {
                    rating = "No reviews";
                }
                else {
                    rating = rating + " stars";
                }
    
    
                let p1 = $("<p class='para'>").text(drFirstName + " " + drLastName);
                let p2 = $("<p class='para'>").text(street);
                let p3 = $("<p class='para'>").text(city + "," + state + " " + zipCode);
                let p4 = $("<p class='para'>").text("Rating: " + rating);
    
                docDiv.append(docImg).append("<br>").append(p1).append(p2).append(p3).append(p4);
            }
            $("#results").append(docDiv);
        });
    
    
    }
    
    });



        //////////////
        let uidDoc = $(this).attr("uid");
        let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/uidDoc?user_key=c73e643548e8388f4f7cf67fbc5fbc38"
        $.ajax({
            url: queryURL,
            method: "GET"

            // data gets back from API

        }).then(function (response) {

            // data from API in results
            //maximum number of info wanted for each character is 10
            //get still picture, animated picture, title and rating
            //empty doctor info to remove previous doctor info

            $("#doctor-info").empty();

            let results = response.data;

            // check that data was obtained, if no data obtained send message

            if (results.length === 0) {
                $("doctor-appear-here").text("No info found");
                return;
            }

            let docDiv = $("<div>");

            let docImg = $("<img id='imgStyle'>");
            docImg.addClass("docPic doc-pic-size");
            docImg.attr("docPic", results[i].profile.image_url);
            charImg.attr("src", results[i].profile.image_url);

            title = results[i].title.replace(picType, "   ").trim();
            title = capitalLetters(title);

            //capitalize api rating
            rating = results[i].rating.toUpperCase();

            let p1 = $("<p class='para'>").text("Title:  " + title);
            let p2 = $("<p class='para'>").text("Rating: " + rating);
            // put 2 images per row
            if (i % 2 === 0) {
                gifDiv2.append(charImg).append("<br>").append(p1).append(p2).append("<br>");
            }
            else {
                gifDiv.append(charImg).append("<br>").append(p1).append(p2).append("<br>");
            }
            $("#images-appear-here").append(gifDiv);
            $("#images-appear-here-2").append(gifDiv2);
        }


        // Code for the push
        database.ref("trains").push(state.trainObj);

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