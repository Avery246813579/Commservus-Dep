var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

/*
0 - Domains
1 - Emails
 */
module.exports = new Table('Whitelist', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    TYPE: {
        TYPE: "INT",
        NULL: false,
        LENGTH: 1
    },
    CONTENT: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 128
    }
}));