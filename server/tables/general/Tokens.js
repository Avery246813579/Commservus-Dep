var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

/*
Type 0 - Account
Type 1 - Organization
 */
module.exports = new Table('Tokens', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    ACCOUNT_ID: {
        TYPE: "INT",
        FOREIGN: {
            key: "ID",
            table: "Accounts",
            onDelete: "CASCADE"
        }
    },
    TYPE: {
        TYPE: "INT",
        LENGTH: 2,
        NULL: false
    },
    TOKEN: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 24
    },
    DATE_CREATED: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 20
    },
    DATE_ASSIGNED: {
        TYPE: "VARCHAR",
        LENGTH: 20
    }
}));