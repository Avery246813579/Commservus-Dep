var JSSQL = require('jssql');
var Scheme = JSSQL.Scheme;
var Table = JSSQL.Table;

module.exports = new Table('Organization_Groups', new Scheme({
    ID: {
        TYPE: "INT",
        AI: true,
        INDEX: "PRIMARY KEY",
        NULL: false
    },
    NAME: {
        TYPE: "VARCHAR",
        NULL: false,
        LENGTH: 36
    },
    ORGANIZATION_ID: {
        TYPE: "INT",
        NULL: false,
        FOREIGN: {
            key: "ID",
            table: "Organizations",
            onDelete: "CASCADE"
        }
    },
    PASSWORD: {
        TYPE: "VARCHAR",
        LENGTH: 20
    }
}));