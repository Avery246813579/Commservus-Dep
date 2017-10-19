var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

/*
 There are three types:
 - Authentication (0): Validating email address with account
 - Forgot (1): Forgot a password
 */
module.exports = new Table('Emails', new Scheme({
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
    EMAIL: {
        TYPE: "VARCHAR",
        LENGTH: 254
    },
    TOKEN: {
        TYPE: "VARCHAR",
        LENGTH: 64,
        NULL: false
    },
    TYPE: {
        TYPE: "TINYINT",
        LENGTH: 1,
        NULL: false
    },
    DATE_SENT: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    DATE_EXPIRES: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    }
}));
