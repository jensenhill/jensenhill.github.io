function outputData(codeData) {

    dataType = parseInt(findType(codeData)); //Find the data type of QR code contents.

    switch(dataType) {
        case 0: //URL
            outputType("URL"); //Output the data type

            weburl = document.createElement("a");
            weburl.href = codeData;
            weburl.textContent = codeData;
            weburl.classList.add("data-content");
            document.body.appendChild(weburl);

            break;

        case 1: //Email
            outputType("Email"); //Output the data type
            break;
        case 2: //Telephone Number
            outputType("Telephone Number"); //Output the data type
            break;
        case 3: //EPC
            outputType("EPC (European Payment Council)"); //Output the data type
            break;
        case 4: //SMS
            outputType("SMS"); //Output the data type
            break;
        case 5: //Maps
            outputType("Geoloc"); //Output the data type
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

    //1 - Email
    if ((codeData.substring(0,7)).toUpperCase() == "MATMSG:") {
        return 1;
    } else {console.log("1. Email check failed.");}

    //2 - Telephone Number
    if ((codeData.substring(0,3)).toUpperCase() == "TEL:") {
        return 2;
    } else {console.log("2. Telephone Number check failed.");}

    //3 - EPC
    if ((codeData.substring(0,3)).toUpperCase() == "BCD") {
        return 3;
    } else {console.log("3. EPC check failed.");}

    //4 - SMS
    if ((codeData.substring(0,6)).toUpperCase() == "SMSTO:") {
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
    p = document.createElement("p");
    p.id = "data-type";
    p.textContent = "Data Type: " + dataTypeText;
    document.body.appendChild(p);
}



export { outputData, findType, outputType };