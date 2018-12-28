$(document).ready(function () {

    // global is an object that holds the global variables
    // drUID is an object that hold the doctor's first name, last name, and uid
    // specialties is an array of specialities the user can search for

    let global = {
        validform: true,
        specialObj: [{ specialty: "internist" }, { specialty: "cardiologist" }, { specialty: "dermatologist" }, { specialty: "oncologist" }],
        usStates: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
            "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "UT", "VT", "VA",
            "WA", "WV", "WI", "WY"],

        specialty: "",
        state: "",
        zipCode: "",
        insurance: "",
        docFirstName: [],
        docLastName: [],
        docSlug: [],
        docUID: []
    }


    $("#search-button").on("click", function (event) {
        event.preventDefault();

        // get input from form

        global.specialty = $("#specialist-input").val().trim();
        global.zipCode = $("#zip-input").val().trim();
        global.state = $("#state-input").val().trim();
        global.state = global.state.toUpperCase();
        global.insurance = $("#insurance-input").val().trim();

        //validate input - if an input field is invalid, will return form with error messages for all invalid fields

        validateInput(global.specialty, global.zipCode, global.state, global.insurance);


        // if all entries are valid, search doctor data base using ajax and better doctor api

        if (global.validform) {
            //empty form values
            $("#specialty-input").val("");
            $("#state-input").val("");
            $("#zip-input").val("");
            $("#insurance-input").val("");
        }
        else {
            return;
        }
        findDoctors(global.specialty, global.state, global.zipCode, global.insurance);

    });



    // this function is called to validate the input data

    function validateInput(specialty, zipCode, state, insurance) {

        global.validform = true;

        //check that at least one search item is entered
        if (specialty == "" && state == "" && zipCode == "" && insurance == "") {
            global.validform = false;
            return global.validform;
        }

        //if a field is invalid - valid form is set to false

        // if specialty is not blank - check that it is valid 
        // use fuse.js to check if valid specialty, in case it was spelled incorrectly - looking for a close match

        let options = {
            shouldSort: true,
            includeScore: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 3,
            keys: [
                "specialty",

            ]
        };
        if (specialty !== "") {
            if (!global.specialObj.includes(specialty)) {
                // use fuse.js to determine if there is a close match to a specialty
                let fuse = new Fuse(global.specialObj, options);
                let fuseResult = fuse.search(specialty);
                if (fuseResult.length !== 0) {

                    global.specialty = fuseResult[0].item.specialty;

                }
                else {
                    $("#specialist-input").val("");
                    global.validform = false;
                }
            }
        }
        //check that a valid state was entered

        //check that a valid state was entered

        if (state !== "") {
            if (!global.usStates.includes(state)) {
                //     let errorMsg = "Please Enter Specialty";
                //    document.getElementById("specialty-input") = errorMsg;
                $("#state-input").val("");
                console.log("invalid state");
                global.validform = false;
            }
        }
        return global.validform;
    }

    //this function is used to clear any error messages
    function clearErrMsg(idName) {
        errorMsg = "";
        document.getElementById(idName).innerHTML = errorMsg;

    }

    function findDoctors(specialty, state, zipCode, insurance) {
        // create query data to be searched in api
        let query = " ";
        if (specialty !== "") {
            console.log("specialty " + specialty);
            query = specialty;
        }
        else {
            query = "";
        }
        console.log("query " + query);
        if (zipCode !== " ") {
            if (query !== " ") {
                query = query + " " + zipCode;
            }
            else {
                query = zipCode;

                let results = response.data;
                // check that data was obtained, if no data obtained send message
                if (results.length === 0) {
                    $("#results").text("No doctors found");
                    return;
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
                "&location=" + state + "&query=" + query + "&skip=0&limit=20&user_key=c73e643548e8388f4f7cf67fbc5fbc38";
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
                    let drUID = results[i].uid;
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
    }
});