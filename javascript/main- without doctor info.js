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
        docName: [],
        docNPI: []
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
            //        if (!global.specialObj.includes(specialty)) {
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
            //        }
        }
        //check that a valid state was entered

        if (state !== "") {
            if (!global.usStates.includes(state)) {
                //     let errorMsg = "Please Enter Specialty";
                //    document.getElementById("specialty-input") = errorMsg;
                $("#state-input").val("");
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
        // create query field data to be searched in api

        let query = "";
        if (specialty !== "") {
            console.log("specialty " + specialty);
            query = specialty;
        }
        else {
            query = "";
        }
        if (zipCode !== "") {
            if (query !== "") {
                query = query + "%20" + zipCode;
            }
            else {
                query = zipCode;
            }
        }
        if (insurance !== "") {
            if (query !== "") {
                query = query + "%20" + insurance;
            }
            else {
                query = insurance;
            }
        }

        let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors?specialty_uid=" + specialty +
            "&location=" + state + "&query=" + query + "&skip=0&limit=20&sort=distance-desc&user_key=c73e643548e8388f4f7cf67fbc5fbc38";
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

            // render doctors
            renderDoctors(results);
            
        });



    }
    // this function renders the doctors on the main page
    
    function renderDoctors(results) {
        let maxLength = 20;
            if (results.length < 20) {
                maxLength = results.length;
            }

            let docDiv = $("<div>");

            // retrieve data from api to display
            //save doctor's name and NPI in order to retrieve additional information if doctor is selected

            for (let i = 0; i < maxLength; i++) {
                let docImg = $("<img id='imgStyle'>");
                docImg.addClass("doc-button doctor doc-pic-size");
                docImg.attr("doc-photo", results[i].profile.image_url);
                docImg.attr("src", results[i].profile.image_url);
                docImg.attr("value", i);


                let drFirstName = results[i].profile.first_name.trim();
                let drLastName = results[i].profile.last_name.trim();
                let drFullName = drFirstName + " " + drLastName;
                let docName = $("<a href='indexdr.html'>");
            //    let docName = $("<p id=docName-style>");
                docName.addClass("doctor doctorName");
                docName.attr("doc-name", drFullName);
                docName.attr("value", i);
                global.docName.push(drFullName);
                //        let drSlug = results[i].profile.slug;
                //        global.docSlug.push(drSlug);
                global.docNPI.push(results[i].npi);

                // display doctors
                let p1 = $("<p class='para'>").text(drFullName);
                docDiv.append(docImg).append("<br>").append(p1);

                //set up address

                let practice = results[i].practices.length;
                let street = " ";
                let city = " ";
                let state = " ";
                let zipCode = " ";
                if (practice !== 0) {
                    let street = results[i].practices[0].visit_address.street;
                    let city = results[i].practices[0].visit_address.city;
                    let state = results[i].practices[0].visit_address.state;
                    let zipCode = results[i].practices[0].visit_address.zip;
                    let p2 = $("<p class='para'>").text(street);
                    let p3 = $("<p class='para'>").text(city + "," + state + " " + zipCode);
                    docDiv.append(p2).append(p3);
                }


                // find better doctor rating
                let rating = "0";
                let ratingImg = $("<img>");
                for (j = 0; j < results[i].ratings.length; j++) {
                    if (results[i].ratings[j].provider == "betterdoctor") {
                        rating = results[i].ratings[j].rating;

                        //    let ratingImg = results[i].ratings[j].image_url_small;
                        ratingImg.addClass("rating-pic-image");
                        ratingImg.attr("src", results[i].ratings[j].image_url_small);
                        break;
                    }
                }

                // set up line to print if rating by better doctor is found
                let p4;
                if (rating === "0") {
                    rating = "Not Rated";
                    p4 = $("<p class='para'>").text(rating);
                    //         docDiv.append(docImg).append("<br>").append(p1).append(p2).append(p3).append(p4);
                    docDiv.append(p4).append("<br><br>");
                }
                else {
                    p4 = $("<p class='para'>").text("Rated: " + rating + " ");
                    //    docDiv.append(docImg).append("<br>").append(p1).append(p2).append(p3).append(ratingImg).append("<br><br>");
                    docDiv.append(ratingImg).append("<br><br>");
                }

            }
            $("#results").append(docDiv);
    }
});