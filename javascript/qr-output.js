import { scanURL } from './url-scan.js';

//Now we've scanned the QR code, we need to output the appropriate contents.
function outputData(codeData) {

    var codeDataOriginal = codeData;
    var dataType = parseInt(findType(codeData)); //Find the data type of QR code contents.
    codeData = decodeURIComponent(codeData); //Replace ASCII encoding references with their ASCII character (if applicable)

    switch(dataType) {
        case 0: //URL
            
            outputType("URL"); //Output the data type
            outputURL(codeData);

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
            //If trimmed section is not equal to nothing ("") then filter it out, repeat for each parameter (=>) of section
            sections = sections.filter(section => section.trim() != ""); //Remove any blank lines

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

            codeData = codeData.substr(4); //Cut out the identifier
            var sections = codeData.split(","); //Split the string at each colon
            
            var geoLat = "Latitude: " + sections[0] + " deg N";
            outputLine(geoLat);
            var geoLong = "Longitude: " + sections[1] + " deg W";
            outputLine(geoLong);
            if (sections.length > 2) {
                var geoHeight = "Height: " + sections[2] + "m";
                outputLine(geoHeight);
            }

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

        case 8: //Market (Google Play)
            outputType("Google Play Market"); //Output the data type
            outputLine(codeData.substr(9)); //Cut out identifier ("market://")

            break;
            
        case 9: //Swiss Payment QR
            outputType("Swiss Payment QR"); //Output the data type
            codeData = codeData.substr(3); //Cut out the identifier
            var sections = codeData.split("\n"); //Split the string at each new line
            var swissIndex = 0; //Track the current index for the sections array

            //If trimmed section is not equal to nothing ("") then filter it out, repeat for each parameter (=>) of section
            sections = sections.filter(section => section.trim() != ""); //Remove any blank lines

            //Nested function: takes current index and uses it to output an address on the following lines.
            function swissAddress(tempIndex) { 
                //Checks if there is an address, and what format it is in.
                if(sections[tempIndex].toUpperCase() === "K") { //Combined address elements ("K")
                    outputLine("Address Type: " + sections[tempIndex]); tempIndex++;
                    outputLine("Name: " + sections[tempIndex]); tempIndex++;
                    outputLine("Street: " + sections[tempIndex]); tempIndex++;
                    outputLine("Postcode & City: " + sections[tempIndex]); tempIndex++;
                    outputLine("Country Code: " + sections[tempIndex]); tempIndex++;
                } else if (sections[tempIndex].toUpperCase() === "S") { //Structured address ("S")
                    outputLine("Address Type: " + sections[tempIndex]); tempIndex++;
                    outputLine("Name: " + sections[tempIndex]); tempIndex++;
                    outputLine("Street: " + sections[tempIndex]); tempIndex++;
                    outputLine("Building Number: " + sections[tempIndex]); tempIndex++;
                    outputLine("Postcode: " + sections[tempIndex]); tempIndex++;
                    outputLine("Town: " + sections[tempIndex]); tempIndex++;
                    outputLine("Country Code: " + sections[tempIndex]); tempIndex++;
                } else {
                    outputLine("Information not provided."); //If an address is not present, no need to increment index by 1.
                }
                return tempIndex;
            }

            //Standard: https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.2-en.pdf

            //Header Data - Mandatory
            outputLine("Version: " + sections[swissIndex]); swissIndex++;
            outputLine("Character Set Code: " + sections[swissIndex]); swissIndex++; //Coding
            
            //Creditor Information - Mandatory
            outputLine("IBAN: " + sections[swissIndex]); swissIndex++;

            //Creditor - Mandatory
            outputLine("Creditor Information");
            swissIndex = swissAddress(swissIndex); //Output the creditor address
            
            //Ultimate Creditor - Optional
            outputLine("Ultimate Creditor Information");
            swissIndex = swissAddress(swissIndex); //Output the ultimate creditor address (if present)
            
            //Payment Amount
            outputLine("Amount: " + sections[swissIndex]); swissIndex++;
            outputLine("Currency: " + sections[swissIndex]); swissIndex++;

            //Ultimate Debtor - Optional
            outputLine("Ultimate Debtor Information");
            swissIndex = swissAddress(swissIndex); //Output the ultimate debtor address (if present)

            //Payment Reference - Mandatory
            outputLine("Reference Type: " + sections[swissIndex]); swissIndex++;
            outputLine("Reference: " + sections[swissIndex]); swissIndex++;

            //Additional Information
            if (sections[swissIndex].toUpperCase() != "EPD") { //If not at end, read additional info
                outputLine("Additional Information: " + sections[swissIndex]);
            }

            break;
        
        case 10: //vCard

        //Map of all vCard properties - used for user-friendly output (https://en.wikipedia.org/wiki/VCard)
            var propertyList = {
                "ADR;": "Address: ",
                "ADR:": "Address: ",
                "AGENT:": "Agent: ",
                "ANNIVERSARY:": "Anniversary: ",
                "BDAY:": "Birthday: ",
                "CALADRURI:": "Scheduling Request Email: ",
                "CALURI:": "URL to Calendar: ",
                "CATEGORIES:": "Categories: ",
                "CLASS:": "Class: ",
                "CLIENTPIDMAP:": "Client PID Map: ",
                "EMAIL:": "Email: ",
                "FBURL:": "Free or Busy URL: ",
                "FN:": "Full Name: ",
                "GENDER:": "Gender: ",
                "GEO:": "Position: ",
                "IMPP:": "Instant Messenger Handle: ",
                "KEY;": "Key: ",
                "KIND:": "Kind: ",
                "LABEL;": "Label: ",
                "LANG:": "Language: ",
                "LOGO;": "Logo: ",
                "MAILER:": "Mailer: ",
                "MEMBER:": "Member: ",
                "N:": "Name: ",
                "NAME:": "Name: ",
                "NICKNAME:": "Nickname: ",
                "NOTE:": "Note: ",
                "ORG;": "Organisation: ",
                "PHOTO;": "Photo: ",
                "PRODID:": "Product ID: ",
                "PROFILE:": "Profile: ",
                "RELATED;": "Related: ",
                "REV:": "Revision: ",
                "ROLE:": "Role: ",
                "SOUND;": "Sound: ",
                "SOURCE:": "Source: ",
                "TEL;": "Telephone: ",
                "TITLE;": "Title: ",
                "TZ:": "Time Zone: ",
                "UID:": "Unique Identifier: ",
                "URL:": "URL: ",
                "VERSION:": "Version: ",
                "XML:": "XML: ",
            };
            codeData = codeData.replace(/;CHARSET=UTF-8/g, ""); //Remove any possible instance of this, invalidates output

            outputType("vCard"); //Output the data type

            //Loop for every property in propertyList
            for(var[flag,output] of Object.entries(propertyList))
            {
                if (codeData.indexOf("\n" + flag) != -1) { //Check if property is present
                    var propertyIndex1 = codeData.indexOf("\n" + flag) + (flag.length + 1); //Lower boundary
                    var propertyIndex2 = codeData.indexOf("\n",propertyIndex1); //Upper boundary

                    if (propertyIndex2 === -1) { //Must be last line
                        propertyIndex2 = codeData.length;
                    }

                    outputLine(propertyList[flag] + codeData.substring(propertyIndex1,propertyIndex2))
                }
            }

            break;
        
        case 11: //MeCard
            outputType("MeCard"); //Output the data type
            
            //Map of all MeCard properties - used for user-friendly output (https://en.wikipedia.org/wiki/VCard)
            var propertyList = {
                "ADR": "Address: ",
                "BDAY": "Birthday: ",
                "EMAIL": "Email: ",
                "N": "Name: ",
                "NICKNAME": "Nickname: ",
                "NOTE": "Note: ",
                "SOUND": "Sound: ",
                "TEL": "Telephone Number: ",
                "URL": "URL: ",
            };

            codeData = codeData.replace("MECARD:",""); //Remove the identifier
            codeData = codeData.replace(/;CHARSET=UTF-8/g, ""); //Remove any possible instance of this, invalidates output

            var sections = codeData.split(";"); //Seperate all of the properties from each other
            
            //Loop for each property (array of sections)
            for (let i = 0; i < (sections.length - 1); i++)
            {
                var parts = sections[i].split(":"); //Seperat the property name/flag from its data

                //URLs contain colons - meaning the length of parts will be > 1
                if(parts[0] === "URL") {
                    var tempURL = parts[1];
                    for (let n = 2; n <= parts.length - 1; n++)
                    {
                        tempURL += (":" + parts[n]); //Append all of the items in parts
                    }

                    outputLine(propertyList[parts[0]] + tempURL);

                } else { //Treat data, that are not URLs, the same

                    outputLine(propertyList[parts[0]] + parts[1]);

                }
            }

            break;
        
        case 12: //Bitcoin
            
        function outputCrypto(data) {

            var cryptoIndex1; //Store the lower bound
            var cryptoIndex2; //Store the upper bound

            //Output the address of wallet
            cryptoIndex2 = data.indexOf("?");
            outputLine("Address: " + data.substring(0,cryptoIndex2));

            //Output the amount of the currency
            if(data.indexOf("amount=") != -1) {
                cryptoIndex1 = data.indexOf("amount=") + 7;
                cryptoIndex2 = data.indexOf("&");

                //Check this property is the final one
                if(data.indexOf("&",cryptoIndex1) != -1) {
                    //Not final property - treat normally
                    outputLine("Amount: " + data.substring(cryptoIndex1,cryptoIndex2));
                } else {
                    //Final property - cryptoIndex2 will be at the end of the string
                    outputLine("Amount: " + data.substr(cryptoIndex1));
                }

            }

            //Output the label
            if (data.indexOf("label=") != -1) {
                cryptoIndex1 = data.indexOf("label=") + 6;
                cryptoIndex2 = data.indexOf("&");
                
                //Check this property is the final one
                if(data.indexOf("&",cryptoIndex1) != -1) {
                    //Not final property - treat normally
                    outputLine("Label: " + data.substring(cryptoIndex1,cryptoIndex2));
                } else {
                    //Final property - cryptoIndex2 will be at the end of the string
                    outputLine("Label: " + data.substr(cryptoIndex1));
                }
            }

            //Output the message
            if (data.indexOf("message=") != -1) {
                cryptoIndex1 = data.indexOf("message=") + 8;
                cryptoIndex2 = data.indexOf("&");
                
                //Check this property is the final one
                if(data.indexOf("&",cryptoIndex1) != -1) {
                    //Not final property - treat normally
                    outputLine("Message: " + data.substring(cryptoIndex1,cryptoIndex2));
                } else {
                    //Final property - crpytoIndex2 will be at the end of the string
                    outputLine("Message: " + data.substr(cryptoIndex1));
                }
            }

        }

            outputType("Bitcoin");
            outputCrypto(codeData.substr(8));
        
            break;
        
        case 13: //Ethereum
            
            outputType("Ethereum");
            outputCrypto(codeData.substr(9));

            break;

        case 14: //Litecoin
            
            outputType("Litecoin");
            outputCrypto(codeData.substr(9));

            break;
        
        case 15: //Bitcoin Cash
            
            outputType("Bitcoin Cash");
            outputCrypto(codeData.substr(12));
        
            break;

        case 16: //Dash
            
            outputType("Dash");
            outputCrypto(codeData.substr(5));

            break;

        case 17: //Text
            outputType("Text"); //Output the data type
            outputLine(codeData);
            
            break;
        
        default:
            outputType("An error occured"); //Output the lack of data type
            break;
    }

    outputRaw(codeDataOriginal);
    
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
    //8 = Market
    //9 = Swiss Payment QR
    //10 = vCard
    //11 = Me Card
    //12 = Bitcoin
    //13 = Ethereum
    //14 = Litecoin
    //15 = Bitcoin Cash
    //16 = Dash
    //17 = Text

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

    //8 - Market
    if ((codeData.substring(0,7)).toUpperCase() == "MARKET:") {
        return 8;
    } else {console.log("8. Market check failed.");}

    //9 - Swiss Payment QR
    if ((codeData.substring(0,3)).toUpperCase() == "SPC") {
        return 9;
    } else {console.log("9. Swiss Payment QR check failed.");}

    //10 - vCard
    if (codeData.substring(0,11).toUpperCase() == "BEGIN:VCARD") {
        return 10;
    } else {console.log("10. vCard check failed.");}

    //11 - Me Card
    if (codeData.substring(0,7).toUpperCase() == "MECARD:") {
        return 11;
    } else {console.log("11. Me Card check failed.");}

    //12 - Bitcoin
    if (codeData.substring(0,8).toUpperCase() == "BITCOIN:") {
        return 12;
    } else {console.log("12. Bitcoin check failed.");}

    //13 - Ethereum
    if (codeData.substring(0,9).toUpperCase() == "ETHEREUM:") {
        return 13;
    } else {console.log("13. Ethereum check failed.");}

    //14 - Litecoin
    if (codeData.substring(0,9).toUpperCase() == "LITECOIN:") {
        return 14;
    } else {console.log("14. Litecoin check failed.");}

    //15 - Bitcoin Cash
    if (codeData.substring(0,12).toUpperCase() == "BITCOINCASH:") {
        return 15;
    } else {console.log("15. Bitcoin Cash check failed.");}

    //16 - Dash
    if (codeData.substring(0,5).toUpperCase() == "DASH:") {
        return 16;
    } else {console.log("16. Dash check failed.");}

    //17 - Text (or other)
    return 17;

}

//Output the type of data. Called by outputData()
function outputType(dataTypeText) {
    var div = document.getElementById("data-container");

    div.innerHTML = ""; //Clear the div before we output data.

    var p = document.createElement("p");
    p.id = "data-type";
    p.textContent = "Data Type: " + dataTypeText;
    div.appendChild(p);
}

//Output the line of data to the qr-data container.
//Note: URLs are to be output using the function outputURL (below).
function outputLine(line) {
    var div = document.getElementById("data-container"); //Place new element in appropriate container.
    var tempElement = document.createElement("p"); //Create temporary <p> element
    var tempText = document.createTextNode(line); //Create temporary text node
    tempElement.appendChild(tempText); //Merge text node with <p> element
    tempElement.classList.add("data-container"); //Add the element to "data-container" class (used for decoration)
    div.appendChild(tempElement); //Push the new element to the page
}

function outputURL(url) {
    //Create the URL <a> element
    var div = document.getElementById("data-container"); //Place new element in appropriate container.
    var weburl = document.createElement("a"); //Create clickable URL element
    weburl.id = "URL";
    weburl.href = url; //Assign URL to element
    weburl.textContent = url; //Assign text to be same as URL
    weburl.classList.add("data-container"); //Add element to the data-container class
    weburl.setAttribute("onclick","return confirm('The URL has not been scanned yet. Are you sure you want to proceed?')"); //Prompt user they may not want to open the link yet
    weburl.setAttribute("target","_blank");

    
    //Create an 'open link' icon to accompany link
    var icon = document.createElement("sl-icon");
    icon.setAttribute("name","box-arrow-in-right");
    icon.style = "display:flex;align-self:center;margin-left:3px;";

    //Append new elements to the page
    weburl.appendChild(icon);
    div.appendChild(weburl); //Push the new element to the page
    
    scanURL(url); //Now commence the malware scan on the URL
}

function noData() {
    var div = document.getElementById("data-container");
    var error = document.createElement("h1");
    error.textContent = "No data to display...";
    error.classList.add("no-data");
    div.appendChild(error);
}

function outputRaw(codeDataOriginal) {
    var div = document.getElementById("data-container");
    var details = document.createElement("sl-details");
    details.setAttribute("summary","View Raw Data");
    details.innerText = codeDataOriginal;
    details.style = "margin-top:15px;"
    div.appendChild(details);
    
}

export { outputData, noData }; //=> qr-scanner.js