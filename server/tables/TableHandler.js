function TableHandler() {
    var JSSQL = require('jssql');
    var Database = JSSQL.Database;

    var _Database;
    if (typeof process.env.RDS_HOSTNAME == "undefined") {
        _Database = new Database({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'CSU'
        });

        console.log('Commservus >> We are running off local.');
    } else {
        _Database = new Database({
            host: process.env.RDS_HOSTNAME,
            user: process.env.RDS_USERNAME,
            password: process.env.RDS_PASSWORD,
            database: process.env.RDS_DB_NAME
        });

        console.log('Commservus >> We are running off a server.');
    }

    _Database.table([
        /* Account Routes */
        require('./account/Accounts'),
        require('./account/Passwords'),
        require('./account/Clients'),
        require('./account/Sessions'),
        require('./account/Emails'),

        /* General */
        require('./general/Tokens'),
        require('./general/Whitelist'),
        require('./general/Admins'),

        /* Organization Roues */
        require('./organization/Organizations'),
        require('./organization/Organization_Groups'),
        require('./organization/Organization_Members'),

        /* Events */
        require('./event/Events'),
        require('./event/Event_Summaries'),
        require('./event/Event_Applications'),
        require('./event/Event_Admins'),

        require('./organization/Organization_Pins')
    ]);

    setTimeout(function(){
        var Admins = require('./general/Admins');
        var Accounts = require('./account/Accounts');
        var Whitelist = require('./general/Whitelist');

        Accounts.find({USERNAME: "avery246813579"}, function(aErr, aRows){
            if(aErr){
                return;
            }

            if(aRows.length < 1){
                return;
            }

            Admins.find({ACCOUNT_ID: aRows[0]['ID']}, function(adErr, adRows){
                if(adErr){
                    return;
                }

                if(adRows.length > 0){
                    return;
                }

                Admins.insert({ACCOUNT_ID: aRows[0]['ID']}, function(aErr){});
            })
        });

        Whitelist.find({TYPE: 1, CONTENT: "avery246813579@gmail.com"}, function(wErr, wRows){
            if(wErr){
                return;
            }

            if(wRows.length > 1){
                return;
            }

            Whitelist.insert({TYPE: 1, CONTENT: "avery246813579@gmail.com"}, function(wErr){});
        });
    }, 1000);
}

module.exports = TableHandler;
