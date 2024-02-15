var attempts = 0;

function scanURL(url) {
    
    if (attempts == 0) {
        scanLoading(); //Inform user that we are attempting to scan the URL (for the first time)
    }

    //Inject URL into HTTP 'POST'
    const urlParameter = new URLSearchParams();
    urlParameter.set("url", url);

    //Set our HTTP request configs in the object "firstConfigs"
    const firstConfigs = {
        method: "POST", //Client => VirusTotal Endpoint (=> Client, handshake only)
        url: "https://www.virustotal.com/api/v3/urls", //VirusTotal API endpoint
        headers: {
            accept: "application/json",
            "x-apikey": ${{ API_KEY }}, //Hide API key as secret token
            "content-type": "application/x-www-form-urlencoded"
        },
        data: urlParameter, //Insert the URL (to be scanned) into the body
    };

    // - Now that we have configured the URL scan request, we can submit it.
    // - We will receive a handshake, containing the scan ID (location of results).
    // - We can create a request to see the scan results, using our generated ID.
    axios
        .request(firstConfigs)
        .then(function (response) { //Promise chain, execute if successful
            var analysisId = response.data.data.id; //Extract the scan ID from the JSON response

            //Set our HTTP request configs in the object "secondConfigs"
            const secondConfigs = {
                method: "GET", //We're getting data this time.
                url: `https://www.virustotal.com/api/v3/analyses/${analysisId}`, //Insert analysisID into URL
                headers: {
                    accept: "application/json",
                    "x-apikey": ${{ API_KEY }}, //Hide API key as secret token
                    "content-type": "application/x-www-form-urlencoded"
                },
            };

            //Allow time for VirusTotal to scan the URL
            setTimeout(() => {

                axios
                .request(secondConfigs)
                .then(function (response) { //Promose chain again, execute if successful
                    
                    const detailedResults = response.data; //Extract the scan results from JSON
                    if (detailedResults.data.attributes.status == "completed") {
                        const detectedEngines = detailedResults.data.attributes.results; //Extract number of triggers detected
                        
                        document.getElementById("malware-badge").remove(); //Remove the loading icon

                        var risk = calculateRisk(detectedEngines,url);
                        console.log(risk);
                        outputRisk(risk);
                        scanDisclaimer(); //Output a disclaimer
                        attempts = 0; //Reset attempts back to 0

                    } else {
                        console.log(detailedResults.data.attributes.status);
                        if (attempts < 2) {
                            attempts++;
                            setTimeout(() => {
                                scanURL();
                            }, 8000);                 
                        } else {
                            scanUnavailable();
                        }
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching analysis results:', error.message);
                    scanUnavailable(); //Inform user that we could not provide a malware scan
                });

            },5000); //delay 5 secs

        })
        .catch(function (error) {
            console.error(error);
            scanUnavailable(); //Inform user that we could not provide a malware scan
        });

}

//Generates a risk score for a URL using VirusTotal & Cyrillic detection
function calculateRisk(detectedEngines, url) {

    var score = 0;

    //Check homograph attack - weighting 40%
    if (detectCyrillic(url) == true) {
        score += 0.4;
    }

    //Check VirusTotal analysis - weighting log(count) * 20%
    const numMalicious = Object.values(detectedEngines).filter((result) => result.category === 'malicious').length;
    score += Math.log(numMalicious + 1) * 0.2;

    const numSuspicious = Object.values(detectedEngines).filter((result) => result.category === 'suspicious').length;
    score += Math.log(numSuspicious + 1) * 0.1;

    console.log(`(Malicious) Detected by ${numMalicious} engines.`);
    console.log(`(Suspicious) Detected by ${numSuspicious} engines.`);

    //Calculate percentage
    score = score * 100;
    score = Math.round(score);

    return Math.min(score,100); //Return 100% if score > 100
}

function outputRisk(risk) {
    var div = document.getElementById("data-container");
    
    var text = document.createElement("p");
    div.insertBefore(text,div.lastChild);

    var bar = document.createElement("sl-progress-bar");
    bar.setAttribute("value",risk);
    var label = "Risk Rating: " + risk + "% ";
    bar.classList.add("risk-bar");

    //Set colour of bar based on risk level
    if (risk == 0) {
        bar.style = "--track-color:forestgreen;";
        label += ("(Safe)");
    } else if (risk < 15) {
        bar.style = "--track-color:white; --indicator-color:limegreen;";
        label += ("(Likely Safe)");
    } else if (risk < 30) {
        bar.style = "--track-color:white; --indicator-color:yellowgreen;";
        label += ("(Probably Safe)");
    } else if (risk < 50) {
        bar.style = "--track-color:white; --indicator-color:orange;";
        label += ("(Probably Dangerous)");
    } else if (risk < 80) {
        bar.style = "--track-color:white; --indicator-color:crimson;";
        label += ("(Likely Dangerous)");
    } else {
        bar.style = "--track-color:white; --indicator-color:darkred;";
        label += ("(Highly Unsafe)");
    }

    bar.setAttribute("label",label);
    text.innerText = label;

    div.insertBefore(bar,div.lastChild);

}

//Homograph attacks -> check if URL contains any suspicious characters
function detectCyrillic(url) {
    //Test for valid ASCII characters (32-126).
    //Rejects greek and cyrillic characters.
    //Returns true if suspicious characters are present
    //Returns false if no suspicious characters.
    
    //Extract the host name only. Following file path in the URL may contain non-ASCII characters.
    var parts = url.split("/");
    if (parts.length >= 3) {
        var domain = parts[2];
    } else {
        var domain = url;
    }

    //$ = end of string. * = zero or more occurrences.
    return !(/^[ -~]*$/.test(domain));

}

function scanLoading() {
    
    var div = document.getElementById("data-container");
    
    /* Display loading icon */
    var spinner = document.createElement("sl-spinner");
    spinner.style = "--indicator-color: orange; margin-right:5px;"
    var scanningText = document.createElement("p");
    scanningText.innerText = "Scanning URL";

    /* Display badge */
    var malwareBadge = document.createElement("sl-tag");
    malwareBadge.id = "malware-badge";
    malwareBadge.setAttribute("title","Performing malware scan on URL");
    malwareBadge.setAttribute("variant","warning");
    malwareBadge.classList.add("url-scan");

    malwareBadge.appendChild(spinner);
    malwareBadge.appendChild(scanningText);
    div.appendChild(malwareBadge);
}

function scanUnavailable() {
    /* Change badge from 'loading' to 'unavailable' */
    var malwareBadge = document.getElementById("malware-badge");
    malwareBadge.setAttribute("variant","neutral");
    malwareBadge.innerText = "Malware Report: Unavailable.";

    attempts = 0; //Reset attempts back to 0
}

function scanDisclaimer() {
    
    /* Inform user that scan cannot be fully relied upon */
    var div = document.getElementById("data-container");
    var disclaimer = document.createElement("p");
    disclaimer.classList.add("disclaimer");

    var disclaimerIcon = document.createElement("sl-icon");
    disclaimerIcon.setAttribute("name","code-slash");
    disclaimerIcon.style = "font-size:35px;"

    var disclaimerText = document.createElement("p");
    disclaimerText.innerText = "Malware scans are not 100% accurate. Always proceed with caution.";
    disclaimerText.style = "margin-left:10px;"
    
    disclaimer.appendChild(disclaimerIcon);
    disclaimer.appendChild(disclaimerText);

    div.insertBefore(disclaimer,div.lastChild);

}

export { scanURL }; //=> qr-output