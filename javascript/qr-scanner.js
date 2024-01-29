import { outputData } from './qr-output.js';
import { storeCode,displayCodes,formatDate } from './qr-history.js';


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
            
            document.getElementById("loading-bar").remove(); //Remove loading bar
            document.getElementById("searching").style.opacity = 1; //Reveal the "Searching for code" message
            document.getElementById("waiting").remove(); //Remove the "Waiting for camera access" message
            
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
                    
                    stream.getTracks().forEach(track => track.stop()) //Terminate camera stream.
                    videoStream.style.visibility = 'hidden'; //Once terminated, hide the container (otherwise the screen will be black).

                    document.getElementById("searching").remove(); //Remove the "Searching for QR code" message
                    document.getElementById("success").style.opacity = 1; //Reveal the "QR Code Successfully Scanned" message

                    document.getElementById("camera-container").style.backgroundColor = "green";

                    outputData(code.data); //Output the QR code's data to the user
                    storeCode(code.data); //Store the QR code in history
                    displayCodes(); //Refresh the QR code history

                    document.getElementById("export-button").style.visibility = "visible"; //Let the user export the code's data

                    return;
                }
                //QR Code NOT Found (null object)
                else {
                    console.log("The QR code was not found."); //Log error to console
                }

                requestAnimationFrame(frameAnalysis)
            };

            frameAnalysis(); //Loop

        })
    }).catch((error) => { //Catch error if rear 'environment' camera not available.
            //Check if this error is because user denied permission 
            if (error.name === 'NotAllowedError') {
                console.log("User has denied access to the camera.");
                document.getElementById("waiting").remove();

                document.getElementById("loading-bar").remove(); //Remove loading bar

                //Create an alert
                const alert = document.getElementById("camera-denied");
                alert.style.opacity = 1;
                alert.show();
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
                    //Device does not have a camera
                    const alert = document.getElementById("camera-denied");
                    alert.style.opacity = 1;
                    alert.show();
                }
            }
    })
}