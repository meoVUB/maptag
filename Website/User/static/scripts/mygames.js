function openMode(evt, name) {
    var i, x, tablinks;
    x = document.getElementsByClassName("mode");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " w3-dark-grey";
}

function toggleTimerInput() {
    var timerActiveSelect = document.getElementById("timerActive");
    var timerSection = document.getElementById("timerSection");

    // Show or hide the timer input based on the selection
    timerSection.style.display = (timerActiveSelect.value === "yes") ? "block" : "none";
}

function validateForm() {
    var mapTitle = document.getElementById("mapTitle").value;
    var canMove = document.getElementById("canMove").value;
    var timerActive = document.getElementById("timerActive").value;
    var timerDuration = document.getElementById("timerDuration").value;
    var mapDescription = document.getElementById("mapDescription").value;
    var formRows = document.getElementsByClassName('form-row');
    var maps = formRows.length;
    // Check if required fields are filled
    if (mapTitle && canMove && timerActive && mapDescription) {
        // If Timer is set to "Yes," ensure Timer Duration is filled
        if (timerActive === "yes" && !timerDuration) {
            alert("Please fill the Timer Duration.");
        }
        checkCoordinates(maps);
    } else {
        alert("Please fill in all required fields.");
    }
}

// Array to store invalid locations
var invalidLocations = [];

function checkCoordinates(maps) {
    invalidLocations = [];
    var timerDuration = document.getElementById("timerDuration").value;
    if (timerDuration > 600) {
        alert("Timer duration cannot exceed 10 minutes.");
        return;
    }
    // Check each set of coordinates
    for (var i = 1; i <= maps; i++) {
        var lat = parseFloat(document.getElementById("lat" + i).value);
        var long = parseFloat(document.getElementById("long" + i).value);
        var validStreet = validStreetView(lat, long, i);
    }
    // Check and alert for invalid locations
    var alertMessage = "Please enter valid coordinates for Locations: "
    setTimeout(() => {
        if (invalidLocations.length > 0) {
            invalidLocations.forEach(function (index) {
                alertMessage = alertMessage + index + " ";
            });
            alert(alertMessage);
        }
    }, 300);
}

function validStreetView(latitude, longitude, i) {
    const streetViewService = new google.maps.StreetViewService();
    const streetViewLocation = { lat: latitude, lng: longitude };
    streetViewService.getPanorama(
        { location: streetViewLocation, radius: 1000, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
        (data, status) => {
            if (status !== "OK") {
                invalidLocations.push(i);
            }
        }
    );
}
/////////////////////////////////////////////////////////////////
// Code to add divs
function addCoordinate() {
    // Create a new form row
    var newFormRow = document.createElement('div');
    newFormRow.classList.add('form-row');

    // Get the number of the new coordinate
    var coordinateNumber = document.getElementsByClassName('form-row').length + 1;

    // Create latitude input with label
    var latInput = createInput('text', 'form-control', 'Latitude (Location ' + coordinateNumber + '):', "lat" + coordinateNumber, "lat" + coordinateNumber);

    // Create longitude input with label
    var longInput = createInput('text', 'form-control', 'Longitude (Location ' + coordinateNumber + '):', "long" + coordinateNumber, "long" + coordinateNumber);

    // Append inputs to the new form row
    newFormRow.appendChild(createFormGroup('col-md-6', latInput));
    newFormRow.appendChild(createFormGroup('col-md-6', longInput));

    // Get the locationSubmissionForm
    var locationForm = document.getElementById('locationSubmissionForm');

    // Insert the new form row before the last child (Submit button)
    locationForm.appendChild(newFormRow);

    // Add Delete button if there's more than one coordinate
    if (document.getElementsByClassName('form-row').length > 1) {
        addDeleteButton();
    }
}

// Code to add delete button
function addDeleteButton() {
    // Check if delete button already exists
    if (!document.getElementById('deleteCoordinateBtn')) {
        var deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('btn', 'btn-danger', 'ml-2'); // Added margin-left class
        deleteBtn.textContent = 'Delete Coordinate';
        deleteBtn.id = 'deleteCoordinateBtn';
        deleteBtn.onclick = deleteCoordinate;

        // Insert the delete button after the Add Coordinate button
        document.getElementById('addOrDeleteButtons').appendChild(deleteBtn);
    }
}

// Code to delete the last added coordinate
function deleteCoordinate() {
    var formRows = document.getElementsByClassName('form-row');
    if (formRows.length > 1) {
        formRows[formRows.length - 1].remove();
    }

    // Remove Delete button if there's only one coordinate left
    if (formRows.length <= 1) {
        var deleteBtn = document.getElementById('deleteCoordinateBtn');
        if (deleteBtn) {
            deleteBtn.remove();
        }
    }
}

function createFormGroup(className, input) {
    var formGroup = document.createElement('div');
    formGroup.classList.add('form-group', className);
    formGroup.appendChild(input);
    return formGroup;
}

function createInput(type, className, label, id, name) {
    var input = document.createElement('input');
    input.type = type;
    input.classList.add(className);
    input.required = true;
    input.id = id
    input.name = name

    var inputLabel = document.createElement('label');
    inputLabel.textContent = label;

    var inputContainer = document.createElement('div');
    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(input);

    return inputContainer;
}