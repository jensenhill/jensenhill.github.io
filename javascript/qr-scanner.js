import { outputData, findType, outputType } from './qr-output.js';

//console.log(jsQR); //jsQR library successfully loaded?
let stream;
let terminate = false;

//Is JavaScript executed?
console.log("JAVA SCRIPT SUCCESSFULLY EXECUTED.")

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
            document.getElementById("status").innerText = "QR Code not detected"; //Update #output from 'awaiting camera' to 'no QR code found'
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
                    
                    var removeStatus = document.getElementById("status");
                    removeStatus.remove(); //Remove the error status as QR successfully scanned.
                    
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
                document.getElementById("status").innerText = "Access to the camera has been denied."; //Inform user that we cannot access camera
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
                    document.getElementById("status").innerText = "No camera was detected on this device."; //Inform user that we cannot access camera
                }
            }
        })
    }

    //WHERE outputData used to be
