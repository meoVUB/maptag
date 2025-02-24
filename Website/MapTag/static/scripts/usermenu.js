/* Code for user profile dropdown menu */


var username, first_name, last_name, email;
var usernameID, firstNameID, lastNameID, emailID, button;

function editAccountDetails() {

    button.innerHTML = `<button id="edit" onclick="saveAccountDetails()"><span>Save</span></button>`;

    // Replace text with input fields using template literals
    usernameID.innerHTML = `<input type="text" name="username" value="${username}" required>`;
    firstNameID.innerHTML = `<input type="text" name="first_name" value="${first_name}" required>`;
    lastNameID.innerHTML = `<input type="text" name="last_name" value="${last_name}" required>`;
    emailID.innerHTML = `<input type="email" name="email" value="${email}" required>`;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function saveAccountDetails() {
    // Get new user data
    var new_username = document.getElementsByName("username")[0].value;
    var new_first_name = document.getElementsByName("first_name")[0].value;
    var new_last_name = document.getElementsByName("last_name")[0].value;
    var new_email = document.getElementsByName("email")[0].value;

    // Client-side validation
    if (!isValidUsername(new_username) || !isValidName(new_first_name) || !isValidName(new_last_name) || !isValidEmail(new_email)) {
        alert("Please enter valid data for all fields.");
        resetPage();
        return;
    }

    // Perform AJAX request to update account details
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "update_account_details", true);

    // Include CSRF token in the request headers
    var csrftoken = getCookie('csrftoken');  // Implement getCookie function to retrieve the CSRF token
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("X-CSRFToken", csrftoken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                username = new_username;
                first_name = new_first_name
                last_name = new_last_name;
                email = new_email;
                resetPage();
            } else {
                alert("Failed to update account details");
            }
        }
    };

    // Send data to the server
    var data = "username=" + encodeURIComponent(new_username) +
               "&first_name=" + encodeURIComponent(new_first_name) +
               "&last_name=" + encodeURIComponent(new_last_name) +
               "&email=" + encodeURIComponent(new_email);
    xhr.send(data);
}


// Validation functions
function isValidUsername(username) {
    return username.trim().length >= 1;
}

function isValidName(name) {
    return name.trim().length >= 1;
}

function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function resetPage() {  
    const page = document.getElementById("pagediv");
    page.innerHTML = `
    <div class="profile-container">
        <div class="profile-info">
            <span class="label">Username:</span>
            <span id="username">${username}</span><br>
        </div>

        <div class="profile-info">
            <span class="label">First Name:</span>
            <span id="first_name">${first_name}</span><br>
        </div>

        <div class="profile-info">
            <span class="label">Last Name:</span>
            <span id="last_name">${last_name}</span><br>
        </div>

        <div class="profile-info">
            <span class="label">Email:</span>
            <span id="email">${email}</span><br>
            <div id="button" data-url="{% url 'myaccount' %}">
                <button id="edit" onclick="editAccountDetails()">
                    <span id="save">Edit Your Account Details Here!</span>
                </button>
            </div>
        </div>
    </div>
`;
usernameID = document.getElementById("username");
firstNameID = document.getElementById("first_name");
lastNameID = document.getElementById("last_name");
emailID = document.getElementById("email");
button = document.getElementById("button");
const dropdownButton = document.getElementById("dropdown");
dropdownButton.innerHTML = username;
}




/* When the user clicks on the button, 
            toggle between hiding and showing the dropdown content */

            
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

var modals;

window.onload = function() {
    usernameID = document.getElementById("username");
    if (usernameID !== null) {
        username = usernameID.textContent.trim();
    }
    firstNameID = document.getElementById("first_name");
    if (firstNameID !== null) {
        first_name = firstNameID.textContent.trim();
    }
    lastNameID = document.getElementById("last_name");
    if (lastNameID !== null) {
        last_name = lastNameID.textContent.trim();
    }
    emailID = document.getElementById("email");
    if (emailID !== null) {
        email = emailID.textContent.trim();
    }
    button = document.getElementById("button");

    // Get all elements with the class 'modal'
    modals = document.querySelectorAll('.modal');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    modals.forEach(function(modal) {
        if (event.target == modal && !modal.classList.contains('no-close')) {
            modal.style.display = "none";
            if (document.getElementById("profile-modal") === event.target) {
                resetPage();
            }
        }
    });
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}