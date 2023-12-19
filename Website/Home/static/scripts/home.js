// Get the modal
var modal1 = document.getElementById('register-modal');
var modal2 = document.getElementById('login-modal');
var modal3 = document.getElementById('reportbug-modal');
var modal4 = document.getElementById('requestfeature-modal');

console.log(modal1);
console.log(modal2);
console.log(modal3);
console.log(modal4);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    console.log("hey");
    if (event.target == modal1) {
        modal1.style.display = "none";
    }
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
    if (event.target == modal3) {
        modal3.style.display = "none";
    }
    if (event.target == modal4) {
        modal4.style.display = "none";
    }
}