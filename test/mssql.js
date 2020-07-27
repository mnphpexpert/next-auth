/* eslint-disable */
// Placeholder for schema test (will use test framework, this is temporary)
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');
const Adapters = require('../adapters');

const SCHEMA_FILE = path.join(__dirname, '/fixtures/schemas/mssql.json');
const expectedSchema = JSON.parse(fs.readFileSync(SCHEMA_FILE));
const TABLES = Object.keys(expectedSchema);

const user = 'sa';
const password = 'Pa55w0rd';
const port = 1433;
const host = '127.0.0.1';
const dbName = 'nextauth';

const serverUrl = `mssql://${user}:${password}@${host}:${port}`;
const databaseUrl = `mssql://${user}:${password}@${host}:${port}/${dbName}?synchronize=true`;

function printSchema() {
  return new Promise(async (resolve) => {
    /**
     * @type {import('mssql').ConnectionPool}
     */
    let connection;
    try {
      // connect to server, no db ...(it doesn't exists)
      connection = await mssql.connect(serverUrl);
      // create table before Adapter
      await connection.query(
        `if(exists(select [name] from sys.databases where name = '${dbName}'))` +
          `drop database [${dbName}];` +
          `create database [${dbName}];`
      );
      // Invoke adapter to sync schema      
      await (Adapters.Default(databaseUrl)).getAdapter();
      // query schema
      const { recordset } = await connection.query(
        `use [${dbName}]; ` +
          TABLES.map(
            (table) =>
              `select * from INFORMATION_SCHEMA.COLUMNS` +
              ` where TABLE_NAME = '${table}'`
          ).join(' UNION ALL ')
      );
      // build result
      return resolve(
        TABLES.reduce(
          (out, next) => ({
            ...out,
            [next]: collect(recordset, next),
          }),
          {}
        )
      );
    } catch (error) {
      return Promise.reject(error);
    } finally {
      if (connection) {
        connection.close();
      }
    }
  });
}
const assert = require('assert');
/** RUN */
(async () => {
  try {
    const testResultSchema = await printSchema();
    const actualTables = Object.keys(testResultSchema);
    assert.equal(
      TABLES,
      actualTables.join(),
      `MSSQL Schema: Expected tables [${TABLES.join()}]\n to be [${actualTables.join()}]`
    );
    //cheap deepEquals, with hints
    for (const tableName of TABLES) {
      const newLocal = expectedSchema[tableName];
      for (const columnName of Object.keys(newLocal)) {
        const expected = expectedSchema[tableName][columnName];
        const actual = testResultSchema[tableName][columnName];
        for (const propKey of Object.keys(expected)) {
          assert.equal(
            expected[propKey],
            actual[propKey],
            `Expected ${tableName}.${columnName}.${propKey}=${actual[propKey]}` +
              ` to be ${expected[propKey]}`
          );
        }
      }
    }
    console.log('mssql: schema ok');
  } catch (error) {
    return Promise.reject(error);
  }
})()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
/** collect results */
const collect = (records, tableName) => {
  const keys = Object.keys(expectedSchema[tableName]);
  const ret = records
    .filter((x) => x.TABLE_NAME === tableName)
    .reduce((out, x) => {
      if (keys.indexOf(x.COLUMN_NAME) === -1) return out; //map only required columns
      const nullable = x.IS_NULLABLE === 'YES';
      return {
        ...out,
        [x.COLUMN_NAME]: {
          nullable,
          type: x.DATA_TYPE,
          default: (nullable && x.COLUMN_DEFAULT) || undefined,
        },
      };
    }, {});
  return ret;
};
