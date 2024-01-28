//localStorage.clear(); //Testing

//Check if the user has previously enabled history tracking
if (localStorage.getItem("saveDataEnabled") == "true") {
    console.log("Successfully accessed previous scanned codes.");
    //storeCode("VCARD:John;Name:Doe;Age:53;Location:London;");
}

displayCodes(); //On start up, attempt to display the user's QR code history

//If a code was just scanned, store it using this function.
function storeCode(currentCode) {
    var previousCodes = JSON.parse(localStorage.getItem("previous-codes")) || [];
    previousCodes.push({code : currentCode, time : new Date().toISOString()});
    localStorage.setItem("previous-codes",JSON.stringify(previousCodes));
}

//On start, and after a scan, display an (updated) list of codes.
function displayCodes() {
    
    var previousCodes = JSON.parse(localStorage.getItem("previous-codes")) || [];
    var div = document.getElementById("history-container");

    //Check if there are any codes in the log
    if (previousCodes.length == 0) {
        
        var error = document.createElement("h1");
        error.textContent = "No history to display...";
        error.classList.add("history-error");
        div.appendChild(error);
    }
    //Otherwise, display each history record
    else {
        div.innerHTML = "";
        var copyIcon = document.createElement("i");
        copyIcon.classList.add("fas", "fa-copy");

        for (var i = previousCodes.length-1; i >= 0; i--) {

            //QR code data
            var element = document.createElement("h1");
            element.textContent = previousCodes[i].code;
            element.classList.add("history-entry-code");
            
            //QR code scan date
            //var spanDate = document.createElement("h1");
            //spanDate.textContent = formatDate(previousCodes[i].time)
            //spanDate.classList.add("history-entry-date");

            var relativeTime = document.createElement("sl-relative-time");
            relativeTime.setAttribute("date",previousCodes[i].time);
            relativeTime.classList.add("history-entry-date");
    
            var entry = document.createElement("div");
            entry.classList.add("history-entry");
            entry.appendChild(element);
            //entry.appendChild(spanDate);
            entry.appendChild(relativeTime);

            var butn = document.createElement("sl-copy-button");
            butn.classList.add("history-button");
            butn.setAttribute("value",previousCodes[i].code);
            entry.appendChild(butn);
    
            div.appendChild(entry);
        }
    }


    
}

//Takes a date in the past and finds a corresponding string that describes how long ago it was.
function formatDate(date) {

    var scanDate = new Date(date); //Date of QR scan
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1); //Today - 1 day
    var difference = today - scanDate; //Time (ms) between today and date of QR scan

    //Same day?
    var comp1 = today.toLocaleDateString("en-GB");
    var comp2 = scanDate.toLocaleDateString("en-GB");
    if (comp1 == comp2) {
        return "Today";
    }

    //Yesterday?
    if (scanDate.getDate() === yesterday.getDate()) {
        return "Yesterday";
    }

    //x days ago?
    difference = difference / 3600000; //milliseconds -> hours
    difference = difference / 24; //hours - > days
    if (difference < 2) {
        return "1 day ago";
    } else if (difference < 30) {
        return (Math.floor(difference) + " days ago");
    }

    //x months ago?
    if (difference < 365) {
        return (Math.floor(difference / 30) + " months ago");
    }

    //x years ago?
    difference = difference / 365; //days -> years
    return (Math.floor(difference) + " years ago");

}

export { displayCodes,storeCode,formatDate };

