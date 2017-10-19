var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Event_Summaries', new Scheme({
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
    SIGNED_ID: {
        TYPE: "INT",
        FOREIGN: {
            key: "ID",
            table: "Accounts",
            onDelete: "CASCADE"
        }
    },
    SIGNED_NAME: {
        TYPE: "VARCHAR",
        LENGTH: 50
    },
    SIGNED_DATE: {
        TYPE: "VARCHAR",
        LENGTH: 20
    }
}));