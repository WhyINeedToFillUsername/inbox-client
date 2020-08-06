# inbox-client
This project is an [Linked Data Notification](https://www.w3.org/TR/ldn/) inbox consumer + sender implementation:

<img src="ldn-overview.png" alt="Overview of Linked Data Notifications" width=400 />

## Requirements
You need to install [node.js](https://nodejs.org/) (with included [npm](https://www.npmjs.com/get-npm)).
<!--Also, you will need [Python](https://www.python.org/downloads/) of version **2.7.xx**.
because of https://github.com/digitalbazaar/rdf-canonize/issues/5-->

## Install
Run the following command in the **root folder**:
```bat
npm install
```
It installs all project dependencies, for details see https://docs.npmjs.com/cli/install.

## Build
Run the following command in the **root folder**:
```bat
npm build
```
It uses [browserirfy](http://browserify.org/) to build the project javascript bundle files.

## Run
The node.js server is set to listen on local port 3000. You can change that in the bin/www file.
Start it by this command:
```bat
npm start
```
Then go to http://localhost:3000/. Click on the "Enable notifications" button to request permission.

Please note that request for notifications won't work in browser "private" mode.

## Test
Application uses [Nightwatch.js](https://nightwatchjs.org/) framework for E2E tests.
Run tests using
```bat
npm test
```

## Documentation
All application logic is in javascript in the /modules folder. 
