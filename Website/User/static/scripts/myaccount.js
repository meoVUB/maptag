function editAccountDetails() {
    console.log("Hello World");
    var usernameID = document.getElementById("username");
    var username = usernameID.textContent.trim();
    var firstNameID = document.getElementById("first_name");
    var firstname = firstNameID.textContent.trim();
    var lastNameID = document.getElementById("last_name");
    var lastname = lastNameID.textContent.trim();
    var emailID = document.getElementById("email");
    var email = emailID.textContent.trim();
    var savebutton = document.getElementById("edit");

    savebutton.innerHTML = `<button id="edit" onclick="saveAccountDetails()"><span>Save</span></button>`;

    // Replace text with input fields using template literals
    usernameID.innerHTML = `<input type="text" name="username" value="${username}">`;
    firstNameID.innerHTML = `<input type="text" name="first_name" value="${firstname}">`;
    lastNameID.innerHTML = `<input type="text" name="last_name" value="${lastname}">`;
    emailID.innerHTML = `<input type="email" name="email" value="${email}">`;
}

function saveAccountDetails() {
    var username = document.getElementsByName("username")[0].value;
    var first_name = document.getElementsByName("first_name")[0].value;
    var last_name = document.getElementsByName("last_name")[0].value;
    var email = document.getElementsByName("email")[0].value;

    // Perform AJAX request to update account details
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/update_account_details/", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log("Account details updated successfully");
            } else {
                console.error("Failed to update account details");
            }
        }
    };

    var data = "username=" + encodeURIComponent(username) +
               "&first_name=" + encodeURIComponent(first_name) +
               "&last_name=" + encodeURIComponent(last_name) +
               "&email=" + encodeURIComponent(email);
    xhr.send(data);
}