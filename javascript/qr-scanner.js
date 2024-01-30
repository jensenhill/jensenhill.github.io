import { outputData,noData } from './qr-output.js';
import { storeCode,displayCodes } from './qr-history.js';

const videoStream = document.getElementById("camera"); //Get HTML <video> element and save as videoStream

start();
function start() {

    //console.log(jsQR); //jsQR library successfully loaded?
    let stream;
    let terminate = false;

    noData(); //Inform user there is no data to display... yet
    startCamera('environment'); //Atempt to start rear camera

    function startCamera(facingMode) {

        navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:facingMode}}}).then((streamResult) => { //Try opening camera stream for streamResult
            stream = streamResult; //Save as stream
            videoStream.srcObject = stream;

            videoStream.setAttribute('autoplay',''); //videoStream fix for Safari iOS
            videoStream.setAttribute('playsinline',''); //videoStream fix for Safari iOS

            videoStream.play(); //Video starts playing

            videoStream.addEventListener("playing", () => { //Video play event... once video starts playing execute:
                
                document.getElementById("loading-bar").style.display = "none"; //Remove loading bar
                document.getElementById("searching").style.opacity = 1; //Reveal the "Searching for code" message
                document.getElementById("waiting").style.display = "none"; //Remove the "Waiting for camera access" message
                
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
                        videoStream.style.display = "none"; //Once terminated, hide the container (otherwise the screen will be black).
                        
                        document.getElementById("export-menu").style.position = "relative"; //Make next menu visible
                        document.getElementById("export-menu").style.display = "flex"; //Remove the export data menu

                        document.getElementById("searching").style.opacity = 0; //Remove the "Searching for QR code" message
                        document.getElementById("success").style.opacity = 1; //Reveal the "QR Code Successfully Scanned" message

                        outputData(code.data); //Output the QR code's data to the user
                        storeCode(code.data); //Store the QR code in history
                        displayCodes(); //Refresh the QR code history

                        document.getElementById("export-menu").style.visibility = "visible"; //Let the user export the code's data

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

                    document.getElementById("waiting").style.display = "none"; //Remove "Waiting for Camera Access"
                    document.getElementById("loading-bar").style.display = "none"; //Remove Loading Bar

                    //Alert the user that the application cannot proceed
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
}

function restart() {
    
    videoStream.style.display = "block"; //Return the camera - this takes the longest, so it must be first
    
    document.getElementById("export-menu").style.visibility = "hidden"; //Make export data menu invisible
    document.getElementById("export-menu").style.display = "none"; //Ensure menu does not affect camera <video>
    document.getElementById("data-container").innerText = ""; //Empty contents of QR Data display
    
    document.getElementById("loading-bar").style.display = "block"; //Re-add the loading bar
    document.getElementById("waiting").style.display = "block"; //Re-add the Waiting for Camera Access message

    start(); //Call the initial function all over again
}

export { restart }; //qr-export.js calls the restart function as the restart button is on its menu