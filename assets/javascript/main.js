$(document).ready(function () {

    // state is an object that holds the global variables
    // doctors is an array that hold the doctor's first name, last name, npi (unique number assigned to a doctor), latitude and longitude of doctors location
    // specialties is object that is an array of specialities the user can search for (so can use fuse)

    let state = {
        validform: true,
        docNPID: "",
        specialObj: [
            { specialty: "internist" }, { specialty: "cardiologist" },
            { specialty: "dermatologist" }, { specialty: "oncologist" },
            { specialty: "urologist" }, { specialty: "allergist" },
            { specialty: "obgyn" }, { specialty: "chiropractor" },
            { specialty: "radiologist" }, { specialty: "psychologist" },
            { specialty: "dentist" }, { specialty: "pediatrician" },
            { specialty: "psychiatrist" }, { specialty: "physical-therapist" },
            { specialty: "nutritionist" }, { specialty: "obstetrics-gynecologist" },
            { specialty: "occupational-therapist" }, { specialty: "neurosurgeon" },
            { specialty: "opthalmologist" }, { specialty: "dietitian" },
            { specialty: "family-practioner" }, { specialty: "orthopedist" },
            { specialty: "neurologist" }, { specialty: "endocrinologist" },
            { specialty: "orthodontist" }, { specialty: "optometrist" },
            { specialty: "general-practitioner" }, { specialty: "general-surgeon" },
            { specialty: "gynecologist" }, { specialty: "immunopathologist" },
            { specialty: "podiatrist" }, { specialty: "gastroenterologist" }],

        usStates: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
            "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
            "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "UT", "VT", "VA",
            "WA", "WV", "WI", "WY"],

        specialty: "",
        stateCode: "",
        zipCode: "",
        insurance: "",
        doctors: []
    }

    //search for doctors based on user input

    $("#search-button").on("click", function (event) {
        event.preventDefault();

        //empty doctors array
        for (let i = state.doctors.length; i > 0; i--) {
            state.doctors.pop();

        }
        // get input from form

        state.specialty = $("#specialist-input").val().trim();
        state.zipCode = $("#zip-input").val().trim();
        state.stateCode = $("#state-input").val().trim();
        state.stateCode = state.stateCode.toUpperCase();
        state.insurance = $("#insurance-input").val().trim();

        //validate input - if an input field is invalid, will return form with error messages for all invalid fields

        validateInput(state.specialty, state.zipCode, state.stateCode, state.insurance);


        // if all entries are valid, search doctor data base using ajax and better doctor api

        if (state.validform) {
            $("#specialist-input").val("");
            $("#state-input").val("");
            $("#zip-input").val("");
            $("#insurance-input").val("");
        }
        else {
            return;
        }


        findDoctors(state.specialty, state.stateCode, state.zipCode, state.insurance);

        $("#doc-details").empty();
        // $("#map").append("Map");

    });

    //get all doctor information

    $("#results").on("click", ".docdiv", function () {
        // get value of doctor clicked to determine which doctor to get additional info for using NPI number
        //search better doctors using NPI to get doctor information

        let docValue = $(this).children('img').attr("value");
        let drName = state.doctors[docValue].docName;
        let drNPI = state.doctors[docValue].docNPI;
        state.docNPID = drNPI;
        let drLat = state.doctors[docValue].doclat;
        let drLong = state.doctors[docValue].doclong;
        getDoctorInfo(drNPI, drName, drLat, drLong);
    });

    //Get favorite doctor NPID and store in firebase
    $("#fav").on("click", function (event) {
        addFavorite(state.docNPID);
    });

    //Get favorite doctor NPID and store in firebase
    $("#my-favorites").on("click", function (event) {
        displayFavorites();
    });

    //this function obtains the doctor information from better doctors API; if there is an error with the call, it will return
    function getDoctorInfo(drNPI, drName, drLat, drLong) {
        let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/npi/" + drNPI + "?user_key=c73e643548e8388f4f7cf67fbc5fbc38";
        $.ajax({
            url: queryURL,
            method: "GET"

            // data gets back from API

        }).then(function (response) {
            // data from API in results
            // only one doctor can be returned as api search is on NPI

            let results = response.data;
            let docDiv = $("<div>");


            /*----------changed ID to class---------------*/
            let favBtn = $("<button>").text('Favorite').addClass('fav').attr('id', 'fav-btn');
            let docImg = $("<img class='imgStyle'>");
            docImg.addClass("doctor doc-pic-size");
            docImg.attr("doc-photo", results.profile.image_url);
            docImg.attr("src", results.profile.image_url);
            let p1 = $("<h2>").text(drName);
            docDiv = docDiv.append(docImg).append(p1);
            docDiv = docDiv.append(favBtn).append(docImg).append(p1);

            // set up doctor address
            let practiceLength = results.practices.length;
            let street = " ";
            let city = " ";
            let state = " ";
            let zipCode = " ";
            if (practiceLength !== 0) {
                for (let i = 0; i < practiceLength; i++) {
                    let street = results.practices[i].visit_address.street;
                    let city = results.practices[i].visit_address.city;
                    let state = results.practices[i].visit_address.state;
                    let zipCode = results.practices[i].visit_address.zip;

                    /*-----------------street-----------added a dots right here------*/
                    let p2 = $("<p class='street'>").text("•" + " " + street);


                    /*----------------city-street-zipcode-----------------*/
                    let p3 = $("<p class='city-street-zipcode'>").text(city + "," + state + " " + zipCode);
                    docDiv = docDiv.append(p2).append(p3);

                    //set up phone numbers
                    let phoneLength = results.practices[i].phones.length;
                    let phoneNo = "";
                    if (phoneLength !== 0) {
                        for (let j = 0; j < phoneLength; j++) {
                            let phoneType = results.practices[i].phones[j].type.trim();
                            let phoneNo = results.practices[i].phones[j].number.trim();
                            phoneNo = "(" + phoneNo.substr(0, 3) + ")" + phoneNo.substr(3, 3) + "-" + phoneNo.substr(6, 4);

                            /*-----------------phone-----------------*/
                            let p4 = $("<p class='phone'>").text(phoneType + ": " + phoneNo);
                            docDiv = docDiv.append(p4);

                        }
                    }

                    //set up office hours
                    let offHrLength = results.practices[i].office_hours.length;
                    if (offHrLength !== 0) {
                        for (j = 0; j < offHrLength; j++) {

                            /*-----------------officehours-----------------*/
                            let p5 = $("<p class ='officehours'>").text(results.practices[i].office_hours[j]);
                            docDiv = docDiv.append(p5);
                        }
                    }
                }
            }
            // obtain specialties
            if (results.specialties.length !== 0) {


                /*-----------------bold-----------------*/
                p5 = $("<p class ='bold'>").text("Specialties: ");
                docDiv = docDiv.append(p5);
                for (i = 0; i < results.specialties.length; i++) {
                    docDiv = docDiv.append(results.specialties[i].name);
                }
            }
            //obtain education
            if (results.educations.length !== 0) {

                /*-----------------bold-----------------*/
                p5 = $("<p class ='bold'>").text("Education: ");
                docDiv = docDiv.append(p5);
                for (i = 0; i < results.educations.length; i++) {
                    docDiv = docDiv.append(results.educations[i].school);
                }
            }

            // obtain bio
            if (results.profile.bio.length !== 0) {

                /*-----------------bold-----------------*/
                p5 = $("<p class ='bold'>").text("Bio: ");
                docDiv = docDiv.append(p5);
                docDiv = docDiv.append(results.profile.bio);
            }
            // obtain languages
            if (results.profile.languages.length !== 0) {

                /*-----------------bold-----------------*/
                p5 = $("<p class ='bold'>").text("Languages: ");
                docDiv = docDiv.append(p5);
                for (i = 0; i < results.profile.languages.length; i++) {
                    docDiv = docDiv.append(results.profile.languages[i].name);
                }
            }

            //obtain insurance plans
            if (results.insurances.length !== 0) {

                /*-----------------bold-----------------*/
                p5 = $("<p class ='bold'>").text("Insurance: ");
                docDiv = docDiv.append(p5);
                for (i = 0; i < results.insurances.length; i++) {


                    docDiv = docDiv.append(results.insurances[i].insurance_plan.name + " " + "•" + " ");

                }

                document.getElementById("")
            }

            $("#doc-details").empty();
            displayMap(drLong, drLat);
            $("#doc-details").prepend(docDiv);


        })
            .catch(function (error) {
                console.log("error with request" + error);
                return;
            });
    }

    // this function is called to validate the input data

    function validateInput(specialty, zipCode, stateCode, insurance) {

        state.validform = true;

        //check that at least one search item is entered
        if (specialty == "" && stateCode == "" && zipCode == "" && insurance == "") {
            state.validform = false;
            return state.validform;
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
            //        if (state.specialObj.includes(specialty)) {
            // use fuse.js to determine if there is a close match to a specialty
            let fuse = new Fuse(state.specialObj, options);
            let fuseResult = fuse.search(specialty);
            if (fuseResult.length !== 0) {
                state.specialty = fuseResult[0].item.specialty;
            }
            else {
                $("#specialist-input").val("");
                state.validform = false;
            }
        }
        //check that a valid state was entered
        if (stateCode !== "") {
            if (!state.usStates.includes(stateCode)) {
                //     let errorMsg = "Please Enter valid stategit me";
                //    document.getElementById("specialty-input") = errorMsg;
                $("#state-input").val("");
                state.validform = false;
            }
        }
        return state.validform;
    }

    //this function is used to clear any error messages
    function clearErrMsg(idName) {
        errorMsg = "";
        document.getElementById(idName).innerHTML = errorMsg;

    }

    function findDoctors(specialty, stateCode, zipCode, insurance) {
        // create query field data to be searched in api

        let query = "";
        if (specialty !== "") {
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
            "&location=" + stateCode + "&query=" + query + "&skip=0&limit=20&sort=distance-desc&user_key=c73e643548e8388f4f7cf67fbc5fbc38";
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

        })
            .catch(function (error) {
                console.log("error finding doctors" + error);
                return;
            });
    }




    // this function renders the doctors on the main page

    function renderDoctors(results) {
        let maxLength = 20;
        if (results.length < 20) {
            maxLength = results.length;
        }

        let docDiv = $("<div>");

        // retrieve doctors from api to display
        //save doctor's name and NPI in order to retrieve additional information if doctor is selected

        for (let i = 0; i < maxLength; i++) {
            let docImg = $("<img id='imgStyle'>");
            docImg.addClass("doctor doc-pic-size");
            docImg.attr("doc-photo", results[i].profile.image_url);
            docImg.attr("src", results[i].profile.image_url);
            docImg.attr("value", i);

            let drFirstName = results[i].profile.first_name.trim();
            let drLastName = results[i].profile.last_name.trim();
            let drFullName = drFirstName + " " + drLastName;
            let docName = $("<p>");

            docName.addClass("doctor doctorName");
            docName.attr("doc-name", drFullName);
            docName.attr("value", i);



            docName = docName.text(drFullName);
            // display doctors
            //    let p1 = $("<p class='para'>").text(drFullName);
            docDiv = $("<div class='docdiv'>");
            docDiv = docDiv.append(docImg).append(docName);

            //set up address

            let practice = results[i].practices.length;
            let doctorImage;
            let street = " ";
            let city = " ";
            let stateCode = " ";
            let zipCode = " ";
            let doctorLat = 0;
            let doctorLong = 0;
            if (practice !== 0) {
                street = results[i].practices[0].visit_address.street;
                city = results[i].practices[0].visit_address.city;
                stateCode = results[i].practices[0].visit_address.state;
                zipCode = results[i].practices[0].visit_address.zip;
                doctorLat = results[i].practices[0].lat;
                doctorLong = results[i].practices[0].lon;
                console.log("doctorLat " + doctorLat + "doctorlong = " + doctorLong);
                let p2 = $("<p class='para'>").text(street);
                let p3 = $("<p class='para'>").text(city + "," + stateCode + " " + zipCode);
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
                docDiv.append(p4);
            }
            else {
                p4 = $("<p class='para'>").text("Rated: " + rating + " ");
                //    docDiv.append(docImg).append("<br>").append(p1).append(p2).append(p3).append(ratingImg).append("<br><br>");
                docDiv.append(ratingImg);
            }

            state.doctors.push({docImage:doctorImage, docName: drFullName, docNPI: results[i].npi, docStreet: street, docCity: city, docState: stateCode, docZip: zipCode, doclat: doctorLat, doclong: doctorLong, rating: ratingImg});

            $("#results").append(docDiv).innerHTML;
        }
    }
});

function displayMap(longitude, latitude) {
    // Initialize platform
    var platform = new H.service.Platform({
        'app_id': 'w7UvEiaWJksvqgcOea4n',
        'app_code': 'HqRyRkE_CPdtcF-Qo5lXdA',
        'useHTTPS': true,
        'useCIT': true
    });

    // Obtain the default map types from the platform object
    var maptypes = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById('doc-details'),
        maptypes.normal.map,
        {
            zoom: 10,
            center: { lng: longitude, lat: latitude }
        });
}
function myFavorites(drNPI) {
    let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/npi/" + drNPI + "?user_key=c73e643548e8388f4f7cf67fbc5fbc38";
    $.ajax({
        url: queryURL,
        method: "GET"

        // data gets back from API

    }).then(function (response) {
        // display data from favorite doctors using NPI number
        //
        let results = response.data;
        let docDiv = $("<div>");

        // retrieve doctors from api to display

        let imgDiv = $("<div id='drImage'>");
        let docImg = $("<img id='imgStyle'>");
        docImg.addClass("doctor doc-pic-size");
        docImg.attr("doc-photo", results.profile.image_url);
        docImg.attr("src", results.profile.image_url);
        docDiv = docDiv.append(imgDiv).append(docImg);

        let drFirstName = results.profile.first_name.trim();
        let drLastName = results.profile.last_name.trim();
        let drFullName = drFirstName + " " + drLastName;
        let docName = $("<p>");

        docName.addClass("doctor doctorName");
        docName.attr("doc-name", drFullName);

        docName = docName.text(drFullName);
        // display doctors
        docDiv = $("<div class='docdiv'>");
        let docInfoDiv = $("<div class='docInfo'>");
        docDiv = docDiv.append(docImg).append(docName);

        //set up address

        let practice = results.practices.length;
        let street = " ";
        let city = " ";
        let stateCode = " ";
        let zipCode = " ";
        if (practice !== 0) {
            let street = results.practices[0].visit_address.street;
            let city = results.practices[0].visit_address.city;
            let stateCode = results.practices[0].visit_address.state;
            let zipCode = results.practices[0].visit_address.zip;
            let p2 = $("<p class='para'>").text(street);
            let p3 = $("<p class='para'>").text(city + "," + stateCode + " " + zipCode);
            docDiv.append(p2).append(p3);
        }


        // find better doctor rating
        let rating = "0";
        let ratingImg = $("<img>");
        for (j = 0; j < results.ratings.length; j++) {
            if (results.ratings[j].provider == "betterdoctor") {
                rating = results.ratings[j].rating;
                ratingImg.addClass("rating-pic-image");
                ratingImg.attr("src", results.ratings[j].image_url_small);
                break;
            }
        }

        // set up line to print if rating by better doctor is found
        let p4;
        if (rating === "0") {
            rating = "Not Rated";
            p4 = $("<p class='para'>").text(rating);
            docDiv.append(p4).append("<br><br>");
        }
        else {
            p4 = $("<p class='para'>").text("Rated: " + rating + " ");
            docDiv.append(ratingImg).append("<br><br>");
        }
        
        $("#results").append(docDiv).innerHTML;
    });
}