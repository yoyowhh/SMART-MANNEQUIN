'use strict'

const db = require('../../dbconfig')

// constructor
const Mannequin = function (mannequin) {
  this.id = mannequin.id
  this.description = mannequin.description
}

Mannequin.index = async () => {
  try {
    const query = `SELECT * FROM mannequin`

    const [rows, fields] = await db.execute(query)

    return {
      status: 'ok',
      message: 'success to retrieve all mannequin data',
      data: rows,
    }
  } catch (err) {
    console.error('Error in Mannequin.index:', err)
    throw err
  }
}

Mannequin.show = async (id) => {
  try {
    const query = `SELECT * FROM mannequin WHERE id = ?`
    const [rows, fields] = await db.execute(query, [id])

    if (rows.length === 0) {
      throw { kind: 'not_found' }
    }

    return {
      status: 'ok',
      message: 'success to retrieve mannequin data',
      data: rows[0],
    }
  } catch (err) {
    console.error('Error in Mannequin.show:', err)
    throw err
  }
}

module.exports = Mannequin