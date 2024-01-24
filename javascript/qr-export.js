function exportCode() {
    //Get the decoded data
    var outputLines = document.querySelectorAll("p.data-container");
    
    //New line: %0D%0A | Line space: %0A
    var emailString = "mailto:?subject=[QR Inspector] Scanned QR Code&body="; //Template
    emailString += document.getElementById("data-type").textContent + "%0A"; //Type of data decoded
    for (var i = 0; i < outputLines.length; i++) {
        emailString += outputLines[i].textContent + "%0D%0A"; //Extract text from element and append
    }

    //Add the date & time to the bottom of the email
    var currentDate = new Date();
    emailString += "%0D%0AThis QR code was scanned on " + currentDate.toString();
    emailString += "%0D%0Awww.jensenhill.github.io";

    window.location.href = emailString; //Open email client
}