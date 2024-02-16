![QR Inspector Logo Banner](https://github.com/jensenhill/jensenhill.github.io/blob/96f4482d460bc31ed2b7f814e7225470bbbb3b5e/assets/Banner%20White.png)

QR Inspector is a single page web application (SPA) designed to improve QR code transparency. Before execution, users can see the QR code contents, such as a full URL or Wi-Fi network credentials, allowing them to assess its validity. For URLs, the website contents will be automatically scanned for malware using the VirusTotal API. These changes aim to facilitate users to protect their device's security, helping them avoid scams, malware and everything in between.

# Installation
The application must be run on a server; it uses JavaScript modules, which require the HTTP(S) protocol. Please follow the instructions below for running the application on a live server using Visual Studio Code (VS Code).

## Installing VS Code
1. Download and install the latest version for your operating system (https://code.visualstudio.com/Download).
2. Navigate to Explorer, on the left tab, and select Clone Repository.
3. Once prompted, enter in the repository URL: https://github.com/jensenhill/jensenhill.github.io
4. Once prompted, open the repository and select "_Yes, I trust the authors."_

  You should now see the project files appear on the left.

  ![image](https://github.com/jensenhill/jensenhill.github.io/assets/91635059/a64c55f3-dfaa-421b-a7a0-b6b0233b3a15)

## Modifying the program code
The application requires an API key, which has been omitted from the repository for security reasons.
1. Copy the API key from this document on the UoP Sharepoint:
   - https://liveplymouthac-my.sharepoint.com/:w:/g/personal/jensen_hill_students_plymouth_ac_uk/ESDDYyRtrGJKsnG2ZZEVo9wBzKKVVnrH8bjzRIWhwYJ-pQ?e=GRse1Z
   - Note: You must be a member of the UoP organisation (Microsoft) to access this file.
2. On VS Code, insert the API key into url-scan.js (javascript > url-scan.js) where indicated on line 2.

  A screenshot on the Sharepoint document shows how it should look.

## Running the live server
1. Navigate to Extensions, on the left tab, and install the "Live Server" extension.
2. After installation, you should notice the button "Go Live" has appeared (bottom right).

  ![image](https://github.com/jensenhill/jensenhill.github.io/assets/91635059/0c9630a8-5cb4-4b1b-973b-4a33f41d9634)

  You are now ready to click "Go Live" to execute the application, which should automatically open in a browser.
  
  

> Have any questions? [Visit the Wiki](https://github.com/jensenhill/jensenhill.github.io/wiki)
