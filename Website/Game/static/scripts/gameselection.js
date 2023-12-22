function toggleTimerInput(selectElement) {
    var timerSection = document.getElementById("timerSection");
    // Show or hide the timer input based on the selection
    timerSection.style.display = (selectElement.value === "true") ? "block" : "none";
}

function validateForm() {
    var sigma = document.getElementById("scoreCalulation").value;
    var canMove = document.getElementById("canMove").value;
    var timerActive = document.getElementById("timerActive").value;
    let timerDuration;

    if (timerActive === "true") {
        var time = convertTimeToSeconds(document.getElementById("timerDuration").value);

        if (time) {
            if (time > 600) {
                alert("Please enter a time less than 10 minutes.");
                return false;
            } else {
                timerDuration = time;
            }
        } else {
            alert("Please enter a valid time.");
            return false;
        }
    }

    // If all validation passes, redirect to the specified link
    window.location.href = "/game?sigma=" + sigma + "&canMove=" + canMove + "&timerActive=" + timerActive + "&timerDuration=" + timerDuration * 1000 + "&custom=true";

    return false;
}

function convertTimeToSeconds(timeStr) {
    try {
        // Split the time string into minutes and seconds
        const [minutes, seconds] = timeStr.split(':').map(Number);

        // Check if the time is in the correct format
        if (Number.isInteger(minutes) && Number.isInteger(seconds) && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
            // Convert minutes and seconds to seconds
            const totalSeconds = minutes * 60 + seconds;
            return totalSeconds;
        } else {
            return false; // Incorrect time format
        }
    } catch (error) {
        return false; // Incorrect format (not two integers separated by a colon)
    }
}