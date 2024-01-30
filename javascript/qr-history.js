//localStorage.clear(); //Testing

displayCodes(); //On start up, attempt to display the user's QR code history

//On start, and after a scan, display an (updated) list of codes.
function displayCodes() {
    
    //Fetch the previously scanned codes from local flat file
    var previousCodes = JSON.parse(localStorage.getItem("previous-codes")) || [];
    var div = document.getElementById("history-container");

    //Check if there are any codes in the log
    if (previousCodes.length == 0) {
        //Inform user there is no history
        var error = document.createElement("h1");
        error.textContent = "No history to display...";
        error.classList.add("no-data");
        div.appendChild(error);
    }
    //Otherwise, display each history record
    else {
        div.innerHTML = ""; //Clear 'No History to Display' message
        var copyIcon = document.createElement("i");
        copyIcon.classList.add("fas", "fa-copy");

        for (var i = previousCodes.length-1; i >= 0; i--) {       

            //QR code data
            var element = document.createElement("h1");
            element.textContent = previousCodes[i].code;
            element.classList.add("history-entry-code");
            
            //QR code scan date
            var relativeTime = document.createElement("sl-relative-time");
            relativeTime.setAttribute("date",previousCodes[i].time);
            relativeTime.classList.add("history-entry-date");
            
            //Package up the elements and push to HTML
            var entry = document.createElement("div");
            entry.classList.add("history-entry");
            entry.appendChild(element);
            entry.appendChild(relativeTime);

            //Copy Button
            var butn = document.createElement("sl-copy-button");
            butn.classList.add("history-button");
            butn.setAttribute("value",previousCodes[i].code);
            entry.appendChild(butn);
    
            div.appendChild(entry);
        }
    }
}

//If a code was just scanned, store it using this function.
function storeCode(currentCode) {
    //Fetch the previously scanned codes from local flat file
    var previousCodes = JSON.parse(localStorage.getItem("previous-codes")) || [];
    //Append current code onto history of codes
    previousCodes.push({code : currentCode, time : new Date().toISOString()});
    //Convert previousCodes to JSON string and store in browser flat file
    localStorage.setItem("previous-codes",JSON.stringify(previousCodes));
}

export { displayCodes,storeCode }; //=> qr-scanner.js