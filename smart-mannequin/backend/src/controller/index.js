'use strict'
const db = require('../dbconfig')
const Status = function (status) {
  this.status = status.server
  this.status = status.status
  this.info = status.info
}

Status.index = async () => {
  try {
    const query = `SELECT * FROM status `

    const [rows, fields] = await db.execute(query)

    return {
      status: 'ok',
      message: 'success',
      data: rows,
    }
  } catch (err) {
    console.error('Error in Status.index:', err)
    throw err
  }

}

exports.index = async (req, res) => {
  try {
    const data = await Status.index()
    res.json(data)
  } catch (err) {
    res.status(500).send(err)
  }
}