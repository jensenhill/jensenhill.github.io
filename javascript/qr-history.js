//localStorage.clear(); //Testing

//Check if the user has previously enabled history tracking
if (localStorage.getItem("saveDataEnabled") == "true") {
    console.log("We've been here before...");

    //With help from: https://stackoverflow.com/questions/76139980/
    


} else {
    
    //Create the button
    var enableButton = document.createElement("button");
    enableButton.textContent = "Enable History Tracking";
    enableButton.addEventListener("click",function() {

        localStorage.setItem("saveDataEnabled","true"); //Remember their choice

        var data = {"name":"Bobby"};
        var a = document.createElement("a");
        a.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data)));
        a.setAttribute("download","history.json");
        a.click();
        enableButton.remove();

    });
    
    var div = document.getElementById("history-container");
    div.appendChild(enableButton);
}





