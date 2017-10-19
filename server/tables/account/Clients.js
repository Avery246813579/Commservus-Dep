var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Clients', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    UNIQUE_ID: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 64
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
    ENTRY: {
        TYPE: "VARCHAR",
        LENGTH: 39
    },
    DEVICE: {
        TYPE: "VARCHAR",
        LENGTH: 50
    }
}));