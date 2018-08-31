function hideSlowLoad() {
    hide = true;
    document.getElementById("canBeSlow").style.display = "none";
}

function setSlowLoad() {
    hide = false;
    setTimeout("showSlowLoad();", 10000);
}

function showSlowLoad() {
    if (hide == false) {
        document.getElementById("canBeSlow").style.display = "block";
    }
}

let hide = true;