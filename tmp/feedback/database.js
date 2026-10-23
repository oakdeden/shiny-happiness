var fs = require('fs')
var path = require('path')
var sqlite3 = require('sqlite3').verbose()

var databasePath = path.resolve(
  process.env.FEEDBACK_DB_PATH || path.join(__dirname, 'data', 'feedback.sqlite')
)

fs.mkdirSync(path.dirname(databasePath), { recursive: true })

var database = new sqlite3.Database(databasePath)

var ready = new Promise(function (resolve, reject) {
  database.run(
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      student_status TEXT NOT NULL CHECK (student_status IN ('yes', 'no')),
      comments TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    function (error) {
      if (error) return reject(error)
      resolve()
    }
  )
})

function saveFeedback(values) {
  return ready.then(function () {
    return new Promise(function (resolve, reject) {
      database.run(
        `INSERT INTO feedback (name, email, student_status, comments, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          values.name,
          values.email,
          values.studentStatus,
          values.comments,
          new Date().toISOString()
        ],
        function (error) {
          if (error) return reject(error)
          resolve(this.lastID)
        }
      )
    })
  })
}

module.exports = { saveFeedback: saveFeedback }
