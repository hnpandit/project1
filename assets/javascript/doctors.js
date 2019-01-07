$(document).ready(function () {


    //get doctor to search for

    $(document).on("click", ".doctor", getDoctorInfo);



});




// this function uses AJAX to obtain API info from giphy for
// each character in topics array

function getDoctorinfo(uid) {
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

        });
    }
function changePicture() {
    //get state of picture
    picState = $(this).attr("image-state");

    // if still picture - change to animate and change attribute to animate
    // if animated picture - change to still and change attribute to still

    if (picState === "still") {
        $(this).attr("src", $(this).attr("data-animate"));
        $(this).attr("image-state", "animate");
    }
    else {
        $(this).attr("src", $(this).attr("data-still"));
        $(this).attr("image-state", "still");
    }
}


});