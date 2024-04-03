//IMPORTANT - You need to insert the API key below. This only needs to be done once.
const API_KEY = "INSERT HERE";

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
            "x-apikey": API_KEY, //API key (line 2)
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
                    "x-apikey": API_KEY, //API key (line 2)
                    "content-type": "application/x-www-form-urlencoded"
                },
            };

            //Allow time for VirusTotal to scan the URL
            setTimeout(() => {

                axios
                .request(secondConfigs)
                .then(function (response) { //Promise chain again, execute if successful
                    
                    const detailedResults = response.data; //Extract the scan results from JSON

                    console.log(detailedResults);


                    if (detailedResults.data.attributes.status == "completed") {
                        const detectedEngines = detailedResults.data.attributes.results; //Extract number of triggers detected
                        
                        document.getElementById("malware-badge").remove(); //Remove the loading icon

                        var risk = calculateRisk(detectedEngines,url);

                        //Change the prompt that opens when a user clicks the URL
                        var urlElement = document.getElementById("URL");
                        if (risk == 0) { //If safe, remove prompt
                            urlElement.removeAttribute("onclick");
                        } else { //Assume dangerous, so re-word prompt
                            urlElement.setAttribute("onclick",`return confirm('This URL has a risk of ${risk}%. Are you sure you want to proceed?')`);
                        }

                        //Get the full entries for all malicious and suspicious entries - used to output the detailed results
                        var triggeredEngines = Object.values(detectedEngines).filter((result) => result.category === "malicious" || result.category === "suspicious");

                        outputRisk(risk);
                        scanDisclaimer(); //Output a disclaimer
                        scanDetails(triggeredEngines, url); //Output the detailed scan results
                        attempts = 0; //Reset attempts back to 0

                    } else {
                        console.log(detailedResults.data.attributes.status);
                        if (attempts < 2) {
                            attempts++;
                            setTimeout(() => {
                                scanURL(url);
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

            },3000); //delay 3 secs

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

    //Check VirusTotal analysis - weighting log(count) * 20% [malicious] (or 10% [suspicious])
    const numMalicious = Object.values(detectedEngines).filter((result) => result.category === "malicious").length;
    score += Math.log(numMalicious + 1) * 0.2;

    const numSuspicious = Object.values(detectedEngines).filter((result) => result.category === "suspicious").length;
    score += Math.log(numSuspicious + 1) * 0.1;

    //Testing:
    //console.log(`(Malicious) Detected by ${numMalicious} engines.`);
    //console.log(`(Suspicious) Detected by ${numSuspicious} engines.`);

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
        label += ("(Nothing Suspicious)");
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

function scanDetails(triggeredEngines, url) {

    //Create details tab
    var tab = document.createElement("sl-details");
    tab.setAttribute("summary","View Detailed Risks");
    tab.style.backgroundColor = "yellow";
    tab.style.border = "2px solid black";
    tab.style.borderRadius = "6px";

    const numMalicious = Object.values(triggeredEngines).filter((result) => result.category === "malicious").length;
    const numSuspicious = Object.values(triggeredEngines).filter((result) => result.category === "suspicious").length;
    
    //Check if there were any triggered engines to display
    if (numMalicious > 0 || numSuspicious > 0) {
        tab.innerText = `This URL has been categorised as malicious by ${numMalicious} engine(s) and suspicious by ${numSuspicious} engine(s).`;

        //Remember to output the results of the homograph check
        if (detectCyrillic(url) == false) {
            tab.innerText += "The URL does not contain any disingenuous (non-ASCII) characters.";
        } else {
            tab.innerText += "The URL contained disingenuous (non-ASCII) characters. Whilst it may seem genuine - it could be a homograph attack.";
        }

        //Create table of engines
        var table = document.createElement("table");
        table.style.marginTop = 
        table.id = "scan-table";

        //Create table header:
        //===================
        //| Engine | Threat | 
        //===================
        var tableRow = document.createElement("tr");
        var tableHeader = document.createElement("th");
        
        tableHeader = document.createElement("th");
        tableHeader.innerText = "Engine";
        tableRow.appendChild(tableHeader);

        tableHeader = document.createElement("th");
        tableHeader.innerText = "Threat";
        tableRow.appendChild(tableHeader);


        table.appendChild(tableRow); //Append header (row) to table

        //Add each entry to the table for all triggered engines
        for (let i = 0; i < triggeredEngines.length; i++) {

            var tableRow = document.createElement("tr"); //Create the row
            var tableData = document.createElement("td"); //Create the table data cell

            //Add engine name
            tableData = document.createElement("td");
            tableData.innerText = triggeredEngines[i].engine_name;
            tableRow.appendChild(tableData);

            //Add threat
            tableData = document.createElement("td");
            tableData.innerText = triggeredEngines[i].result;
            tableRow.appendChild(tableData);

            //Add the row to the table
            table.appendChild(tableRow);
        }

        tab.appendChild(table); //Add the complete table to the tab

    } else { //No triggered engines to display
        tab.innerText = `This URL was not categorised as malicious or suspicious by engines.`;

        //Remember to output the results of the homograph check
        if (detectCyrillic(url) == false) {
            tab.innerText += "The URL does not contain any disingenuous (non-ASCII) characters.";
        } else {
            tab.innerText += "The URL contained disingenuous (non-ASCII) characters. Whilst it may seem genuine - it could be a homograph attack.";
        }
    }
    
    var div = document.getElementById("data-container");
    div.insertBefore(tab,div.lastChild);

}

export { scanURL }; //=> qr-output