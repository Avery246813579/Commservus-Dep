var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Sessions', new Scheme({
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
    CLIENT: {
        TYPE: "INT",
        NULL: false,
        FOREIGN: {
            key: "ID",
            table: "Clients",
            onDelete: "CASCADE"
        }
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
    IP_ADDRESS: {
        TYPE: "VARCHAR",
        LENGTH: 39,
        NULL: false
    },
    DATE_CREATED: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    DATE_EXPIRES: {
        TYPE: "VARCHAR",
        LENGTH: 20
    },
    UNAUTHORIZED: {
        TYPE: "BOOLEAN",
        NULL: false
    }
}));
