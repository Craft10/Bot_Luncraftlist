const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conexión exitosa a la base de datos SQLite3');
  }
});

module.exports = db;