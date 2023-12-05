//Now we've scanned the QR code, we need to output the appropriate contents.
function outputData(codeData) {

    var dataType = parseInt(findType(codeData)); //Find the data type of QR code contents.
    codeData = decodeURIComponent(codeData); //Replace ASCII encoding references with their ASCII character.

    switch(dataType) {
        case 0: //URL
            outputType("URL"); //Output the data type

            var weburl = document.createElement("a"); //Create clickable URL element
            weburl.href = codeData; //Assign URL to element
            weburl.textContent = codeData; //Assign text to be same as URL
            weburl.classList.add("data-content"); //Add element to the data-content class
            
            div.appendChild(weburl);

            break;

        case 1: //Email
            outputType("Email"); //Output the data type
            
            //MATMSG URI
            if ((codeData.substring(0,7)).toUpperCase() == "MATMSG:")
            {
                codeData = codeData.substr(7); //Cut out the identifier

                var sections = codeData.split(";"); //Split the string at each semi-colon
                var emailAddress = "Email Addres: " + sections[0].split(":")[1]; //Extract the email
                var emailSubject = "Subject: " + sections[1].split(":")[1]; //Extract the subject
                
                //There can be issues if the body contains colons and semi-colons.
                //We must manually select characters between "BODY:" and the final two characters of the string (;;).
                var bodyIndex = (codeData.toUpperCase()).indexOf("BODY:");
                var emailBody = "Body: " + codeData.substring((bodyIndex + 5),(codeData.length - 2));
            }
            //MAILTO URI
            else 
            {
                
                codeData = codeData.substr(7); //Cut out the identifier

                var addressIndex = codeData.indexOf("?");
                var emailAddress = "Email Address: " + codeData.substring(0,addressIndex); //Extract the email (everything up to '?')
                var subjectIndex1 = (codeData.toUpperCase()).indexOf("?SUBJECT=");
                var bodyIndex = (codeData.toUpperCase()).indexOf("&BODY=");
                var emailSubject = "Subject: " + codeData.substring((subjectIndex1 + 9),bodyIndex); //Extract the subject
                var emailBody = "Body: " + codeData.substring(bodyIndex + 6);
            }

            outputLine(emailAddress); //Create Email Address element
            outputLine(emailSubject); //Create Email Subject element
            outputLine(emailBody); //Create Email Body element

            break;

        case 2: //Telephone Number
            outputType("Telephone Number"); //Output the data type

            codeData = codeData.substr(4); //Cut out the identifier
            outputLine(codeData); //Create Telephone Number element
            
            break;

        case 3: //EPC
            outputType("EPC (European Payment Council)"); //Output the data type

            codeData = codeData.substr(3); //Cut out the identifier

            var sections = codeData.split("\n"); //Split the string at each new line
            
            //Check to see if the line is blank. If so, delete it.
            for(let i = 0; i <= sections.length; i++)
            {
                var currentLine = toString(sections[i]);
                if ((sections[i] == "") || (currentLine.trim().length === 0))
                {
                    console.log("Removed: " + sections[i]);
                    sections.splice(i,1)
                }
            }

            //Create new elements to display each payment detail
            var paymentVersion = "Version: " + sections[0];
            outputLine(paymentVersion);
            var paymentSEPACreditTransfer = "SEPA Credit Transfer: " + sections[2];
            outputLine(paymentSEPACreditTransfer);
            var paymentBICSWIFT = "BIC/SWIFT: " + sections[3];
            outputLine(paymentBICSWIFT);
            var paymentReceiver = "Receiver's Name: " + sections[4];
            outputLine(paymentReceiver);
            var paymentIBAN = "IBAN: " + sections[5];
            outputLine(paymentIBAN);
            var paymentAmount = "Amount (EUR): " + sections[6];
            outputLine(paymentAmount);
            var paymentRef = "Payment Reference: " + sections[7];
            outputLine(paymentRef);
            var paymentRem = "Payment Remittance: " + sections[8];
            outputLine(paymentRem);

            break;

        case 4: //SMS
            outputType("SMS"); //Output the data type
            
            var sections = codeData.split(":"); //Split the string at each colon
            var mobileNumber = "Mobile Number: " + sections[1];
            outputLine(mobileNumber);
            var mobileContents = "Message Contents: " + sections[2];
            outputLine(mobileContents);

            break;

        case 5: //Maps
            outputType("Geoloc"); //Output the data type

            codeData = codeData.substr(3); //Cut out the identifier
            var sections = codeData.split(","); //Split the string at each colon
            
            var geoLat = "Latitude: " + sections[0] + " deg N";
            outputLine(geoLat);
            var geoLong = "Longitude: " + sections[1] + " deg W";
            outputLine(geoLong);
            var geoHeight = "Height: " + sections[2] + "m";
            outputLine(geoHeight);

            break;

        case 6: //Calendar
            outputType("Calendar"); //Output the data type
            
            break;
        case 7: //Wi-Fi
            outputType("Wi-Fi"); //Output the data type
            break;
        case 8: //Bookmark
            outputType("Bookmark"); //Output the data type
            break;
        case 9: //Bitcoin
            outputType("Bitcoin"); //Output the data type
            break;
        case 10: //vCard
            outputType("vCard"); //Output the data type
            break;
        case 11: //Me Card
            outputType("MeCard"); //Output the data type
            break;
        case 12: //Text
            outputType("Text"); //Output the data type
            break;
        default:
            outputType("Invalid"); //Output the lack of data type
            break;
    }
}

//Finding the type of data encoded in a QR code and returning the corresponding integer.
function findType(codeData) {
    
    //0 = URL
    //1 = Email
    //2 = Telephone Number
    //3 = EPC
    //4 = SMS
    //5 = Maps
    //6 = Calendar
    //7 = Wi-Fi
    //8 = Bookmark
    //9 = Bit Coin
    //10 = vCard
    //11 = Me Card
    //12 = Text

    //0 - URL
    if (codeData.substring(0,4).toUpperCase() == "WWW.") {
        return 0;
    } else if (codeData.substring(0,8).toUpperCase() == "HTTPS://") {
        return 0;
    } else if (codeData.substring(0,7).toUpperCase() == "HTTP://") {
        return 0;
    } else {console.log("0. URL check failed.");}

    //1 - Email (MATMSG & MAILTO)
    if (((codeData.substring(0,7)).toUpperCase() == "MATMSG:") || (codeData.substring(0,7)).toUpperCase() == "MAILTO:") {
        return 1;
    } else {console.log("1. Email check failed.");}

    //2 - Telephone Number
    if ((codeData.substring(0,4)).toUpperCase() == "TEL:") {
        return 2;
    } else {console.log("2. Telephone Number check failed.");}

    //3 - EPC
    if ((codeData.substring(0,3)).toUpperCase() == "BCD") {
        return 3;
    } else {console.log("3. EPC check failed.");}

    //4 - SMS (SMS, SMSTO, MMS & MMSTO)
    if (((codeData.substring(0,6)).toUpperCase() == "SMSTO:") || ((codeData.substring(0,6)).toUpperCase() == "SMSTO:") || ((codeData.substring(0,6)).toUpperCase() == "MMSTO:") || ((codeData.substring(0,4)).toUpperCase() == "MMS:")) {
        return 4;
    } else {console.log("4. SMS check failed.");}

    //5 - Maps
    if ((codeData.substring(0,4)).toUpperCase() == "GEO:") {
        return 5;
    } else {console.log("5. Maps check failed.");}

    //6 - Calendar
    if ((codeData.substring(0,12)).toUpperCase() == "BEGIN:VEVENT") {
        return 6;
    } else {console.log("6. Calendar check failed.");}

    //7 - Wi-Fi
    if ((codeData.substring(0,7)).toUpperCase() == "WIFI:T:") {
        return 7;
    } else {console.log("7. Wi-Fi check failed.");}

    //8 - Bookmark
    if ((codeData.substring(0,6)).toUpperCase() == "MEBKM:") {
        return 8;
    } else {console.log("8. Bookmark check failed.");}

    //9 - Bitcoin
    if ((codeData.substring(0,8)).toUpperCase() == "BITCOIN:") {
        return 9;
    } else {console.log("9. Bitcoin check failed.");}

    //10 - vCard
    if (codeData.substring(0,11) == "BEGIN:VCARD") {
        return 10;
    } else {console.log("10. vCard check failed.");}

    //11 - Me Card
    if (codeData.substring(0,7) == "MECARD:") {
        return 11;
    } else {console.log("11. Me Card check failed.");}

    //12 - Text
    return 12;

}

//Output the type of data. Called by outputData()
function outputType(dataTypeText) {
    var p = document.createElement("p");
    p.id = "data-type";
    p.textContent = "Data Type: " + dataTypeText;
    document.body.appendChild(p);
}

function outputLine(line) {
    var div = document.getElementById("data-container"); //Place new element in appropriate container.
    var tempElement = document.createElement("p"); //Create temporary <p> element
    var tempText = document.createTextNode(line); //Create temporary text node
    tempElement.appendChild(tempText); //Merge text node with <p> element
    tempElement.classList.add("data-content"); //Add the element to "data-content" class (used for decoration)
    div.appendChild(tempElement); //Push the new element to the page
}

export { outputData, findType, outputType };