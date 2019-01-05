$(document).ready(function () {


    //get doctor to search for

    $("#results").on("click", ".doctor", function () {

        // get value of doctor clicked to determine which doctor to get additional info for using NPI number
        //search better doctors using NPI to get doctor information
        let docValue = $(this).attr("value");
        let drName = docName[docValue];
        let drNPI = docNPI[docValue];

        let queryURL = "https://api.betterdoctor.com/2016-03-01/doctors/npi/" + drNPI + "?user_key=c73e643548e8388f4f7cf67fbc5fbc38";
        $.ajax({
            url: queryURL,
            method: "GET"

            // data gets back from API

        }).then(function (response) {

            // data from API in results
            // only one doctor can be returned as api search is on NPI

            $("#doctorInfo").empty();
            let results = response.data;
            let docDiv = $("<div>");
            let p1 = $("<p class='para'>").text(drName);
            docDiv = docDiv.append(p1);

            // set up doctor address

            let practiceLength = results[0].practices.length;
            let street = " ";
            let city = " ";
            let state = " ";
            let zipCode = " ";
            //    if (practiceLength !== 0) {
            //        for (let i = 0; i < practiceLength; i++) {
            //            let street = results[0].practices[i].visit_address.street;
            //             let city = results[0].practices[i].visit_address.city;
            //             let state = results[0].practices[i].visit_address.state;
            //             let zipCode = results[0].practices[i].visit_address.zip;
            //             let p2 = $("<p class='para'>").text(street);
            //             let p3 = $("<p class='para'>").text(city + "," + state + " " + zipCode);
            //             docDiv = docDiv.append(p2).append(p3);
            //
            //set up phone numbers
            //            let phoneLength = results[0].practices[i].phones.length;
            //            if (phoneLength !== 0) {
            //                for (let j = 0; j < phoneLength; j++) {
            //                     let phoneType = results[0].practices[i].phones[j].type;
            //                    let phoneNo = results[0].practices[i].phones[j].number;
            //                    formatPhoneNo(phoneNo);
            //                    let p4 = $("<p class='para'>").text(phoneNo);
            //                    docDiv = docDiv.append(p4);
            //                }
            //             }
            //set up office hours
            //            let offHrLength = results[0].practices[i].office_hours.length;
            //            if (offHrLength !== 0) {
            //                 for (j = 0; j < offHrLength; j++) {
            //                    let p5 = $("<p class ='para'>").text(results[0].practices[i].office_hours[j]);
            //                     docDiv = docDiv.append(p5);
            //                }
            //            }
        });
     //      }

       // });
    });
function formatPhoneNo() {};
});
