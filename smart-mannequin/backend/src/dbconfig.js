const mysql = require('mysql2')
require('dotenv').config({path: './.env'})

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 4023),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'dbsensorsm',
  timezone: '+07:00',
  dateStrings: true,
})

// const result = pool.query('SHOW TABLES;', (err, res) => {
//   console.log(res)
// })
// console.log(result);

// db.connect(err => {
//   if (err) throw err
//   console.log('Connected to database!')
// })

module.exports = db.promise()

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database!');
    connection.release();
  }
})
