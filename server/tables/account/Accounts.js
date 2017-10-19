var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Accounts', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    USERNAME: {
        TYPE: "VARCHAR",
        LENGTH: 16,
        NULL: false
    },
    EMAIL: {
        TYPE: "VARCHAR",
        LENGTH: 254
    },
    LOGO: {
        TYPE: "VARCHAR",
        LENGTH: 150
    },
    BIO: {
        TYPE: "VARCHAR",
        LENGTH: 150
    },
    DISPLAY_NAME: {
        TYPE: "VARCHAR",
        LENGTH: 70,
        NULL: false
    },
    DATE_CREATED: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    DATE_UPDATED: {
        TYPE: "VARCHAR",
        LENGTH: 20,
        NULL: false
    },
    CONFIRMED: {
        TYPE: "BOOLEAN",
        NULL: false
    }
}));