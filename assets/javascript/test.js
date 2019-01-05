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

    //get all doctor information

    $("#results").on("click", ".doctor", function () {
        // get value of doctor clicked to determine which doctor to get additional info for using NPI number
        //search better doctors using NPI to get doctor information
   //     let docValue=0;
        let docValue = $(this).attr("value");
        let drName = global.docName[docValue];
        let drNPI = 1518175256;
        console.log("dr NPI when click on doctor " + drNPI);
        console.log("doc value " +docValue + " dr name " + drName + " drNPI " + drNPI);
  //  let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors?name=Mudita%20Sethi&skip=0&limit=10&user_key=c73e643548e8388f4f7cf67fbc5fbc38"
            let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/npi/" + drNPI + "?user_key=c73e643548e8388f4f7cf67fbc5fbc38";
          let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/npi/1518175256?user_key=c73e643548e8388f4f7cf67fbc5fbc38";
     //   let npiQueryURL = "https://api.betterdoctor.com/2016-03-01/doctors?query=" + drNPI + "&user_key=c73e643548e8388f4f7cf67fbc5fbc38";
        console.log("npi query " + queryURL);
        $.ajax({
            url:queryURL,
            method: "GET"

            // data gets back from API
        

        }).then(function (response) {
            console.log("results length " + results.length);
            // data from API in results
            // only one doctor can be returned as api search is on NPI
            console.log("in then");
            //            $("#doctorInfo").empty();

            let results = response.data;
            let docDiv = $("<div>");
            let p1 = $("<p class='para'>").text(drName);
            docDiv.append(p1);
            // set up doctor address

            let practiceLength = results[0].practices.length;
            let street = " ";
            let city = " ";
            let state = " ";
            let zipCode = " ";
            if (practiceLength !== 0) {
                for (let i = 0; i < practiceLength; i++) {
                    let street = results[0].practices[i].visit_address.street;
                    let city = results[0].practices[i].visit_address.city;
                    let state = results[0].practices[i].visit_address.state;
                    let zipCode = results[0].practices[i].visit_address.zip;
                    let p2 = $("<p class='para'>").text(street);
                    let p3 = $("<p class='para'>").text(city + "," + state + " " + zipCode);
                    docDiv = docDiv.append(p2).append(p3);

                    //set up phone numbers
                    let phoneLength = results[0].practices[i].phones.length;
                    if (phoneLength !== 0) {
                        for (let j = 0; j < phoneLength; j++) {
                            let phoneType = results[0].practices[i].phones[j].type;
                            let phoneNo = results[0].practices[i].phones[j].number;
                            formatPhoneNo(phoneNo);
                            let p4 = $("<p class='para'>").text(phoneNo);
                            docDiv = docDiv.append(p4);
                        }
                    }
                    //set up office hours
                    let offHrLength = results[0].practices[i].office_hours.length;
                    if (offHrLength !== 0) {
                        for (j = 0; j < offHrLength; j++) {
                            let p5 = $("<p class ='para'>").text(results[0].practices[i].office_hours[j]);
                            docDiv = docDiv.append(p5);
                        }
                    }
                }
            }
            let error = response.error_code;
            console.log("response " + error);
            $("#doctorInfo").append(docDiv);
        });
        let error = response.error_code;
        console.log("response " + error);
        $("#doctorInfo").empty();
        $("#doctorInfo").append(docDiv);



    });
    function formatPhoneNo() { };





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


        // render doctors
        renderDoctors(results);





    }
    // this function renders the doctors on the main page

    function renderDoctors(results) {


        let docDiv = $("<div>");

        // retrieve data from api to display
        //save doctor's name and NPI in order to retrieve additional information if doctor is selected


        let drFullName = "Amy Sethi";
        let docName = $("<a href='indexdr.html'>");
        //    let docName = $("<p id=docName-style>");
        docName.addClass("doctor doctorName");
        docName.attr("doc-name", drFullName);
        docName.attr("value", 0);
        global.docName[0]= drFullName;
        //        let drSlug = results[i].profile.slug;
        //        global.docSlug.push(drSlug);

        docName = docName.text(drFullName);
        // display doctors

        docDiv.append("<br>").append(docName);

        //set up address

        $("#results").append(docDiv);


    }

});