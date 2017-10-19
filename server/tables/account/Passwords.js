var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Passwords', new Scheme({
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
    CONTENT: {
        TYPE: "VARCHAR",
        LENGTH: 128,
        NULL: false
    },
    DATE_CHANGED: {
        TYPE: "VARCHAR",
        LENGTH: 20
    }
}));