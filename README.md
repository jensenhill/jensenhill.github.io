![image](https://github.com/jensenhill/jensenhill.github.io/assets/91635059/d329470d-284b-4069-8e7f-5ef143e3823a)


QR Inspector is a single-page web application that improves QR code transparency. Before execution, users can see the QR code contents, such as a full URL or Wi-Fi network credentials, allowing them to assess its validity. For URLs, the website contents will be automatically scanned for malware using the VirusTotal API. These changes aim to facilitate users to protect their device's security, helping them avoid scams, malware and everything in between.

# Installation
The application must be run on a server; it uses JavaScript modules, which require the HTTP(S) protocol. Please follow the instructions below for running the application on a live server using Visual Studio Code (VS Code). 

> If you have already used Live Server on Visual Studio Code, then you likely won't need these instructions. However, please make sure to follow the section, `Modifying the program code`. The application will not function without adding an API key.

### What you'll need:
- Camera device (built-in camera, webcam, etc)
- Live server (e.g. Live Server extension on VS Code, see instructions for more info)
- Compatible browser ([latest version of major browsers](https://github.com/jensenhill/jensenhill.github.io/wiki/Supported-Devices-&-Browsers))
- QR Codes to test (the [wiki page](https://github.com/jensenhill/jensenhill.github.io/wiki/Sample-QR-Codes-%E2%80%90-Test-Data#examples-all-supported-types) contains a few)

## Installing VS Code
1. Download and install the latest version for your operating system (https://code.visualstudio.com/Download).
2. Navigate to Explorer, on the left tab, and select Clone Repository.
3. Once prompted, enter the repository URL: https://github.com/jensenhill/jensenhill.github.io
4. Once prompted, open the repository and select "_Yes, I trust the authors."_

  You should now see the project files appear on the left.

  ![image](https://github.com/jensenhill/jensenhill.github.io/assets/91635059/a64c55f3-dfaa-421b-a7a0-b6b0233b3a15)

## Modifying the program code
The application requires an API key, which has been omitted from the repository for **security reasons**.
1. Copy the API key from this document on the UoP Sharepoint:
   - https://liveplymouthac-my.sharepoint.com/:w:/g/personal/jensen_hill_students_plymouth_ac_uk/ESDDYyRtrGJKsnG2ZZEVo9wBzKKVVnrH8bjzRIWhwYJ-pQ
   - Note: You must be a member of the Microsoft UoP organisation to access this file.
2. On VS Code, insert the API key into url-scan.js (javascript > url-scan.js) where indicated on line 2.

  A screenshot on the Sharepoint document shows how it should look.

## Running the live server (VS Code)
1. Navigate to Extensions, on the left tab, and install the "Live Server" extension.
2. After installation, you should notice the button "Go Live" has appeared (bottom right).

  ![image](https://github.com/jensenhill/jensenhill.github.io/assets/91635059/0c9630a8-5cb4-4b1b-973b-4a33f41d9634)

  **You are now ready to click "Go Live" to execute the application.**
  
# QR Inspector Wiki  
You can view more information, troubleshooting help and test data on the Wiki page. [Visit the Wiki](https://github.com/jensenhill/jensenhill.github.io/wiki)
