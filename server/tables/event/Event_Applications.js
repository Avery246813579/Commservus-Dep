var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

/*
Status:
0 - Waiting
1 - Accepted
2 - Denied
3 - Cancelled
 */
module.exports = new Table('Event_Applications', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    ACCOUNT_ID: {
        TYPE: "INT",
        NULL: false,
        FOREIGN: {
            key: "ID",
            table: "Accounts",
            onDelete: "CASCADE"
        }
    },
    EVENT_ID: {
        TYPE: "INT",
        NULL: false,
        FOREIGN: {
            key: "ID",
            table: "Events",
            onDelete: "CASCADE"
        }
    },
    START_TIME: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    END_TIME: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    STATUS: {
        TYPE: "TINYINT",
        LENGTH: 1
    },
    STATED_BY: {
        TYPE: "INT",
        FOREIGN: {
            key: "ID",
            table: "Accounts",
            onDelete: "CASCADE"
        }
    }
}));