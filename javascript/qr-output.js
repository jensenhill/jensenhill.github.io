//Now we've scanned the QR code, we need to output the appropriate contents.
function outputData(codeData) {

    var dataType = parseInt(findType(codeData)); //Find the data type of QR code contents.
    codeData = decodeURIComponent(codeData); //Replace ASCII encoding references with their ASCII character (if applicable)

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
            if ((codeData.split(":").length - 1) > 1) { //Does the SMS number contain a message?
                var mobileContents = "Message Contents: " + sections[2];
                outputLine(mobileContents);
            }

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

        case 6: //Calendar -> Follows the .ics (iCalendar) format
            outputType("Calendar"); //Output the data type
            
            codeData.toUpperCase();
            var calendarIndex1; //Store the index of the first character in the line
            var calendarIndex2; //Store the index of the final character in the line

            //Event UID
            if (codeData.indexOf("UID:") != -1) {
                calendarIndex1 = codeData.indexOf("UID:") + 4;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("UID: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event DTSTAMP
            if (codeData.indexOf("DTSTAMP:") != -1) {
                calendarIndex1 = codeData.indexOf("DTSTAMP:") + 8;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                var date = new Date(Date.parse(codeData.substring(calendarIndex1,calendarIndex2)));

                if (!isNaN(date)) //Was the date successfully converted?
                {
                    outputLine("Creation Date: " + date);
                
                }
                else //Try a alternate format
                {   
                    var stringDate = codeData.substring(calendarIndex1,calendarIndex2);
                    var year = stringDate.substring(0,4);
                    var month = stringDate.substring(4,6);
                    var day = stringDate.substring(6,8);
                    var hour = stringDate.substring(9,11);
                    var minute = stringDate.substring(11,13);
                    var second = stringDate.substring(13,15);
                    date = new Date(Date.UTC(year,month,day,hour,minute,second))
                    if (!isNaN(date))
                    {
                        outputLine("Creation Date: " + date);
                    }
                    else
                    {
                        outputLine("Creation Date: " + codeData.substring(calendarIndex1,calendarIndex2));
                    }
                }
            }

            //Event CREATED
            if (codeData.indexOf("CREATED:") != -1) {
                calendarIndex1 = codeData.indexOf("CREATED:") + 8;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                var date = new Date(Date.parse(codeData.substring(calendarIndex1,calendarIndex2)));

                if (!isNaN(date)) //Was the date successfully converted?.
                {
                    outputLine("Created: " + date);
                
                }
                else //Try a alternate format
                {   
                    var stringDate = codeData.substring(calendarIndex1,calendarIndex2);
                    var year = stringDate.substring(0,4);
                    var month = stringDate.substring(4,6);
                    var day = stringDate.substring(6,8);
                    var hour = stringDate.substring(9,11);
                    var minute = stringDate.substring(11,13);
                    var second = stringDate.substring(13,15);
                    date = new Date(Date.UTC(year,month,day,hour,minute,second))
                    if (!isNaN(date))
                    {
                        outputLine("Created: " + date);
                    }
                    else
                    {
                        outputLine("Created: " + codeData.substring(calendarIndex1,calendarIndex2));
                    }
                }
            }

            //Event DTSTART
            if (codeData.indexOf("DTSTART:") != -1) {
                calendarIndex1 = codeData.indexOf("DTSTART:") + 8;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                var date = new Date(Date.parse(codeData.substring(calendarIndex1,calendarIndex2)));

                if (!isNaN(date)) //Was the date successfully converted?.
                {
                    outputLine("Start: " + date);
                
                }
                else //Try a alternate format
                {   
                    var stringDate = codeData.substring(calendarIndex1,calendarIndex2);
                    var year = stringDate.substring(0,4);
                    var month = stringDate.substring(4,6);
                    var day = stringDate.substring(6,8);
                    var hour = stringDate.substring(9,11);
                    var minute = stringDate.substring(11,13);
                    var second = stringDate.substring(13,15);
                    date = new Date(Date.UTC(year,month,day,hour,minute,second))
                    if (!isNaN(date))
                    {
                        outputLine("Start: " + date);
                    }
                    else
                    {
                        outputLine("Start: " + codeData.substring(calendarIndex1,calendarIndex2));
                    }
                }
            }
            

            //Event DTEND
            if (codeData.indexOf("DTEND:") != -1) {
                calendarIndex1 = codeData.indexOf("DTEND:") + 6;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                var date = new Date(Date.parse(codeData.substring(calendarIndex1,calendarIndex2)));

                if (!isNaN(date)) //Was the date successfully converted?.
                {
                    outputLine("End: " + date);
                
                }
                else //Try a alternate format
                {   
                    var stringDate = codeData.substring(calendarIndex1,calendarIndex2);
                    var year = stringDate.substring(0,4);
                    var month = stringDate.substring(4,6);
                    var day = stringDate.substring(6,8);
                    var hour = stringDate.substring(9,11);
                    var minute = stringDate.substring(11,13);
                    var second = stringDate.substring(13,15);
                    date = new Date(Date.UTC(year,month,day,hour,minute,second))
                    if (!isNaN(date))
                    {
                        outputLine("End: " + date);
                    }
                    else
                    {
                        outputLine("End: " + codeData.substring(calendarIndex1,calendarIndex2));
                    }
                }
            }

            //Event SUMMARY
            if (codeData.indexOf("SUMMARY:") != -1) {
                calendarIndex1 = codeData.indexOf("SUMMARY:") + 8;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Summary: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event CLASS
            if (codeData.indexOf("CLASS:") != -1) {
                calendarIndex1 = codeData.indexOf("CLASS:") + 6;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Class: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event CATEGORIES
            if (codeData.indexOf("CATEGORIES:") != -1) {
                calendarIndex1 = codeData.indexOf("CATEGORIES:") + 11;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Categories: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event TRANSP
            if (codeData.indexOf("TRANSP:") != -1) {
                calendarIndex1 = codeData.indexOf("TRANSP:") + 7;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Transparency: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event DESCRIPTION
            if (codeData.indexOf("DESCRIPTION:") != -1) {
                calendarIndex1 = codeData.indexOf("DESCRIPTION:") + 12;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Description: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event GEO
            if (codeData.indexOf("GEO:") != -1) {
                calendarIndex1 = codeData.indexOf("GEO:") + 4;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Geo: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event LAST-MOD
            if (codeData.indexOf("LAST-MOD:") != -1) {
                calendarIndex1 = codeData.indexOf("LAST-MOD:") + 9;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Last Modified: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event LOCATION
            if (codeData.indexOf("LOCATION:") != -1) {
                calendarIndex1 = codeData.indexOf("LOCATION:") + 9;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Location: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event ORGANIZER (US Spelling)
            if (codeData.indexOf("ORGANIZER:") != -1) {
                calendarIndex1 = codeData.indexOf("ORGANIZER:") + 10;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Organiser: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event PRIORITY
            if (codeData.indexOf("PRIORITY:") != -1) {
                calendarIndex1 = codeData.indexOf("PRIORITY:") + 9;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Priority: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Evemt STATUS
            if (codeData.indexOf("STATUS:") != -1) {
                calendarIndex1 = codeData.indexOf("STATUS:") + 7;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Status: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event SUMMARY
            if (codeData.indexOf("SUMMARY:") != -1) {
                calendarIndex1 = codeData.indexOf("SUMMARY:") + 8;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Summary: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event URL
            if (codeData.indexOf("URL:") != -1) {
                calendarIndex1 = codeData.indexOf("URL:") + 4;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("URL: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            //Event RECURID
            if (codeData.indexOf("RECURID:") != -1) {
                calendarIndex1 = codeData.indexOf("RECURID:") + 7;
                calendarIndex2 = codeData.indexOf("\n",calendarIndex1);
                outputLine("Recurrance iD: " + codeData.substring(calendarIndex1,calendarIndex2));
            }

            break;

        case 7: //Wi-Fi
            outputType("Wi-Fi"); //Output the data type

            codeData.toUpperCase();
            var wifiIndex1;
            var wifiIndex2;

            //T: Authentication
            if (codeData.indexOf("T:") != -1) {
                wifiIndex1 = codeData.indexOf("T:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("Authentication: " + codeData.substring(wifiIndex1,wifiIndex2));
            } else {
                outputLine("No Authentication")
            }

            //S: SSID
            if (codeData.indexOf("S:") != -1) {
                wifiIndex1 = codeData.indexOf("S:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("SSID: " + codeData.substring(wifiIndex1,wifiIndex2));
            }

            //P: SSID
            if (codeData.indexOf("P:") != -1) {
                wifiIndex1 = codeData.indexOf("P:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                if (codeData.substring(wifiIndex1,wifiIndex2) == "NOPASS")
                {
                    outputLine("No Password");
                }
                else
                {
                    outputLine("Password: " + codeData.substring(wifiIndex1,wifiIndex2));
                }
            } else {
                outputLine("No Password");
            }

            //E: EAP Method
            if (codeData.indexOf("E:") != -1) {
                wifiIndex1 = codeData.indexOf("E:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("EAP Method: " + codeData.substring(wifiIndex1,wifiIndex2));
            }

            //A: Anonymous Identity
            if (codeData.indexOf("A:") != -1) {
                wifiIndex1 = codeData.indexOf("A:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("Anonymous Identity: " + codeData.substring(wifiIndex1,wifiIndex2));
            }

            //I: Identity
            if (codeData.indexOf("I:",6) != -1) { //Disregards the "I:" part of "WIFI:"
                wifiIndex1 = codeData.indexOf("I",6) + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("Identity: " + codeData.substring(wifiIndex1,wifiIndex2));
            }

            //PH2: Phase 2 (method)
            if (codeData.indexOf("PH2:") != -1) {
                wifiIndex1 = codeData.indexOf("PH2:") + 4;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("Anonymous Identity: " + codeData.substring(wifiIndex1,wifiIndex2));
            }

            //H: Hidden
            if (codeData.indexOf("H:") != -1) {
                wifiIndex1 = codeData.indexOf("H:") + 2;
                wifiIndex2 = codeData.indexOf(";",wifiIndex1);
                outputLine("Hidden Network: " + codeData.substring(wifiIndex1,wifiIndex2));
            }
            
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
            outputType("An error occured"); //Output the lack of data type
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
    //9 = Bitcoin
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
    if (((codeData.substring(0,4)).toUpperCase() == "SMS:") || ((codeData.substring(0,6)).toUpperCase() == "SMSTO:") || ((codeData.substring(0,6)).toUpperCase() == "SMSTO:") || ((codeData.substring(0,6)).toUpperCase() == "MMSTO:") || ((codeData.substring(0,4)).toUpperCase() == "MMS:")) {
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
    if ((codeData.substring(0,5)).toUpperCase() == "WIFI:") {
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