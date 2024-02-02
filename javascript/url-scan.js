var req = new XMLHttpRequest();
req.open('GET', "http://tinyurl.com/4akm4zvr", true);
req.send(null);
req.onload = function() {
    var headers = req.getAllResponseHeaders().toLowerCase();
    console.log(headers);
    console.log(req.getResponseHeader("x-final-url"));
    var temp1 = new URL(req.getResponseHeader("x-final-url"));
    var temp2 = new URL("http://tinyurl.com/4akm4zvr");
    if (temp1.href == temp2.href) {
        console.log("Same URL");
    } else {
        console.log("WARNING: REDIRECT DETECTED");
        console.log("INITIAL URL: " + temp2);
        console.log("FINAL URL: " + temp1);
    }
};