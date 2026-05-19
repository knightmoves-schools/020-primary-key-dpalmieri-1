const fs = require('fs')
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function runScript(db, script) {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getColumnInfo = (db, tableName) => {
  const sql = `PRAGMA table_info("${tableName}");`
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

describe('the SQL in the `exercise.sql` file', () => {
  let db;
  let scriptPath;
  let cleanupPath;

  beforeAll( async () => {
    const dbPath = path.resolve(__dirname, '..', 'lesson20.db');
    db = new sqlite3.Database(dbPath);

    scriptPath = path.resolve(__dirname, '..', 'exercise.sql');
    cleanupPath = path.resolve(__dirname, '..', 'cleanup.sql');
    await runScript(db, cleanupPath);
  });

  afterAll( async () => {
    await runScript(db, cleanupPath);
    db.close();
  });

  test('Should create a table named Shipping with the following columns; ITEMID, CUSTOMERID ORDERDATE and SHIPDATE and make one of the columns a primary key.', async () => {
    const results = await runScript(db, scriptPath);
    
    const tableName = 'Shipping';
    const columnsResult = await getColumnInfo(db, tableName)
    console.log(columnsResult);

    const expectedColumns = ['ID', 'CUSTOMER_ID', 'ORDER_DATE', 'SHIP_DATE'];
    let containsAllColumns = true;
    columnsResult.forEach((column) => {
      if(!expectedColumns.includes(column.name))
        containsAllColumns = false;
    })
    expect(containsAllColumns).toBe(true);

    const primaryKeys = columnsResult.filter(row => row.pk !== 0);
    expect(primaryKeys.length).toBe(1);
    expect(primaryKeys[0].name).toBe('ID')
  });
});

