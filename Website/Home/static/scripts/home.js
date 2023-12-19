
var modals;

window.onload = function() {
// Get all elements with the class 'modal'
modals = document.querySelectorAll('.modal');

console.log("Modals:", modals);

// Log each modal for verification
modals.forEach(function(modal, index) {
    console.log("Modal " + (index + 1) + ":", modal);
});
}
// When the user clicks anywhere outside of a modal, close the relevant modal
window.onclick = function(event) {
    modals.forEach(function(modal) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}
