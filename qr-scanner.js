//console.log(jsQR); //jsQR library successfully loaded?
let stream;
let terminate = false;
startCamera('environment'); //Atempt to start rear camera

function startCamera(facingMode) {

    navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:facingMode}}}).then((streamResult) => { //Try opening camera stream for streamResult
        stream = streamResult; //Save as stream
        const videoStream = document.getElementById("camera"); //Get HTML <video> element and save as videoStream
        videoStream.srcObject = stream;

        videoStream.setAttribute('autoplay',''); //videoStream fix for Safari iOS
        videoStream.setAttribute('playsinline',''); //videoStream fix for Safari iOS

        videoStream.play(); //Video starts playing

        videoStream.addEventListener("playing", () => { //Video play event... once video starts playing execute:
            document.getElementById("output").innerText = "QR Code not detected"; //Update #output from 'awaiting camera' to 'no QR code found'
            const canvas = document.createElement("canvas"); //Display video stream onto canvas
            const renderingContext = canvas.getContext("2d"); //Rendering context as "2D"

            const frameAnalysis = () => {
                renderingContext.drawImage(videoStream, 0, 0, canvas.width, canvas.height); //Define height and width of frame + Draw frame to canvas.
                const imageData = renderingContext.getImageData(0,0, canvas.width, canvas.height); //Image data for canvas packaged into imageData.
                const code = jsQR(imageData.data, imageData.width, imageData.height); //jsQR function takes image data and returns object with QR info.

                //====================================================================================================================================
                //=====================================================   QR Code Found ==============================================================
                //====================================================================================================================================
                if (code) {
                    console.log("The QR code was found: ", code.data); //Log data to console.
                    
                    //Inform user of success
                    document.getElementById("output").innerText = code.data;
                    document.getElementById("output").style.color = "green";
                    stream.getTracks().forEach(track => track.stop()) //Terminate camera stream.
                    videoStream.style.visibility = 'hidden'; //Once terminated, hide the container (otherwise the screen will be black).
                    
                    outputData(code.data); //Output the QR code's data to the user
                    
                    return;
                }
                //QR Code NOT Found (null object)
                else {
                    console.log("The QR code was not found."); //Log error to console
                }

                requestAnimationFrame(frameAnalysis)
            };

            frameAnalysis(); //Loop

        })}).catch((error) => { //Catch error if rear 'environment' camera not available.
            //Check if this error is because user denied permission 
            if (error.name === 'NotAllowedError') {
                console.log("User has denied access to the camera.");
                document.getElementById("output").innerText = "Access to the camera has been denied."; //Inform user that we cannot access camera
            } 
            //User granted permission, but...
            else {
                //Try using a front facing camera.
                if (facingMode === "environment") {
                    startCamera("user"); //Call function using front camera this time.
                }
                //If both rear and front camera fail, attempt to let browser use device default camera.
                else if (facingMode==="user")
                {
                    startCamera();
                    terminate = true;
                }
                else if (terminate === true) 
                {
                    document.getElementById("output").innerText = "No camera was detected on this device."; //Inform user that we cannot access camera
                }
            }
        })
    }

//Now we've scanned the QR code, we need to output the appropriate contents.
function outputData(codeData) {

    dataType = findType(codeData); //Find the data type of QR code contents.

    switch(codeData) {
        case 0: //URL
        case 1: //Email
        case 2: //Telephone Number
        case 3: //EPC
        case 4: //SMS
        case 5: //Maps
        case 6: //Calendar
        case 7: //Wi-Fi
        case 8: //Bookmark
        case 9: //Bitcoin
        case 10: //vCard
        case 11: //Me Card
        case 12: //Text
        default: //Other (error)
    }

    document.getElementById("output").innerText = codeData + " = " + dataType;
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
    if (codeData.substring(0,3).toUpperCase() == "WWW.") {
        return 0;
    } else if (codeData.substring(0,7).toUpperCase() == "HTTPS://") {
        return 0;
    } else if (codeData.substring(0,6).toUpperCase() == "HTTP://") {
        return 0;
    } else {console.log("0. URL check failed.");}

    //1 - Email
    if ((codeData.substring(0,6)).toUpperCase() == "MATMSG:") {
        return 1;
    } else {console.log("1. Email check failed.");}

    //2 - Telephone Number
    if ((codeData.substring(0,2)).toUpperCase() == "TEL:") {
        return 2;
    } else {console.log("2. Telephone Number check failed.");}

    //3 - EPC
    if ((codeData.substring(0,2)).toUpperCase() == "BCD") {
        return 3;
    } else {console.log("3. EPC check failed.");}

    //4 - SMS
    if ((codeData.substring(0,5)).toUpperCase() == "SMSTO:") {
        return 4;
    } else {console.log("4. SMS check failed.");}

    //5 - Maps
    if ((codeData.substring(0,3)).toUpperCase() == "GEO:") {
        return 5;
    } else {console.log("5. Maps check failed.");}

    //6 - Calendar
    if ((codeData.substring(0,11)).toUpperCase() == "BEGIN:VEVENT") {
        return 6;
    } else {console.log("6. Calendar check failed.");}

    //7 - Wi-Fi
    if ((codeData.substring(0,6)).toUpperCase() == "WIFI:T:") {
        return 7;
    } else {console.log("7. Wi-Fi check failed.");}

    //8 - Bookmark
    if ((codeData.substring(0,5)).toUpperCase() == "MEBKM:") {
        return 8;
    } else {console.log("8. Bookmark check failed.");}

    //9 - Bitcoin
    if ((codeData.substring(0,7)).toUpperCase() == "BITCOIN:") {
        return 9;
    } else {console.log("9. Bitcoin check failed.");}

    //10 - vCard
    if (codeData.substring(0,10) == "BEGIN:VCARD") {
        return 10;
    } else {console.log("10. vCard check failed.");}

    //11 - Me Card
    if (codeData.substring(0,6) == "MECARD:") {
        return 11;
    } else {console.log("11. Me Card check failed.");}

    //12 - Text
    return 12;

}
