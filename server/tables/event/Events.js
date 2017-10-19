var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Events', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    NAME: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 128
    },
    DESCRIPTION: {
        TYPE: "TEXT",
        NULL: false
    },
    LOCATION: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 128
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
    ORGANIZATION_ID: {
        TYPE: "INT",
        FOREIGN: {
            key: "ID",
            table: "Organizations",
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
    TYPE: {
        TYPE: "TINYINT",
        LENGTH: 1,
        NULL: false
    },
    TAGS: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 128
    },
    CANCELLED_DATE: {
        TYPE: "VARCHAR",
        LENGTH: 20
    }
}));