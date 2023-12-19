/* When the user clicks on the button, 
            toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
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

// Get the modal
var modal3 = document.getElementById('reportbug-modal');
var modal4 = document.getElementById('requestfeature-modal');

console.log(modal3);
console.log(modal4);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    console.log("hey");
    if (event.target == modal3) {
        modal3.style.display = "none";
    }
    if (event.target == modal4) {
        modal4.style.display = "none";
    }
}