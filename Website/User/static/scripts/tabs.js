function openMode(evt, name) {
    var i, x, tablinks;
    x = document.getElementsByClassName("custom-mode");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("custom-tab");
    for (i = 0; i < x.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.classList.add("active");
}