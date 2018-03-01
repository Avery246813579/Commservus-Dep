# Commservus
Commservus is a project I wrote for my school back in high school. A community service organization could create an account and host events, and students could find those events. A students hours would be tracked and a school could track their hours. If you would like to see the mobile app view the [Commservus Xamarin project](https://github.com/Avery246813579/Commservus-Xamarin).

## About the Code Base
This codebase contains both a server in Node.js and a website in a custom render engine I wrote (I have switched to React on my most resent projects). I have a custom Authenication in my server which authenticates based on client and session tokens given by the server. I run a MySQL back end using my [JSSQL](https://github.com/Avery246813579/JSSQL) npm package. I also host a Socket.io server for real time updates with both the app and website. 

I use Mocha and Chai for unit testing in this project. 

## Installation
1. Clone the project ``git clone https://github.com/Avery246813579/Commservus.git``
1. Install the Node Modules ``npm install``

If you want to run the project use the command:
```shell
    npm start
```


If you want to test the project use the command:
```shell
    npm test
```

Note: Make sure you have your database configured in server/tables/TableHandler.js