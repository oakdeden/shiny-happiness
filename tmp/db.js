var fs = require('fs')
var path = require('path')
var sqlite3 = require('sqlite3').verbose()

var databasePath = path.resolve(
  process.env.ITEC_DB_PATH ||
    process.env.FEEDBACK_DB_PATH ||
    path.join(__dirname, 'data', 'itec.sqlite')
)

fs.mkdirSync(path.dirname(databasePath), { recursive: true })

var database = new sqlite3.Database(databasePath)

var seedQuestions = [
  {
    question: 'Be able to speak every language or play every instrument?',
    answer1: 'Speak every language',
    answer2: 'Play every instrument'
  },
  {
    question: 'Have unlimited concert tickets or unlimited plane tickets?',
    answer1: 'Unlimited concert tickets',
    answer2: 'Unlimited plane tickets'
  },
  {
    question: 'Live in a cabin in the woods or a loft in a busy city?',
    answer1: 'Cabin in the woods',
    answer2: 'Loft in a busy city'
  },
  {
    question: 'Never have to sleep or never have to eat?',
    answer1: 'Never have to sleep',
    answer2: 'Never have to eat'
  },
  {
    question: 'Only read fiction for a year or only read nonfiction for a year?',
    answer1: 'Only fiction',
    answer2: 'Only nonfiction'
  }
]

function run(sql, params) {
  return new Promise(function (resolve, reject) {
    database.run(sql, params || [], function (error) {
      if (error) return reject(error)
      resolve(this)
    })
  })
}

function all(sql, params) {
  return new Promise(function (resolve, reject) {
    database.all(sql, params || [], function (error, rows) {
      if (error) return reject(error)
      resolve(rows)
    })
  })
}

function get(sql, params) {
  return new Promise(function (resolve, reject) {
    database.get(sql, params || [], function (error, row) {
      if (error) return reject(error)
      resolve(row)
    })
  })
}

var ready = run(
  `CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_status TEXT NOT NULL CHECK (student_status IN ('yes', 'no')),
    comments TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`
)
  .then(function () {
    return run(
      `CREATE TABLE IF NOT EXISTS wyr_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL UNIQUE,
        answer1 TEXT NOT NULL,
        answer2 TEXT NOT NULL
      )`
    )
  })
  .then(function () {
    return run(
      `CREATE TABLE IF NOT EXISTS body_calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        bmi REAL NOT NULL,
        category TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    )
  })
  .then(function () {
    return get('SELECT COUNT(*) AS count FROM wyr_questions')
  })
  .then(function (row) {
    if (row && row.count > 0) return

    return seedQuestions.reduce(function (chain, item) {
      return chain.then(function () {
        return run(
          `INSERT OR IGNORE INTO wyr_questions (question, answer1, answer2)
           VALUES (?, ?, ?)`,
          [item.question, item.answer1, item.answer2]
        )
      })
    }, Promise.resolve())
  })

function saveFeedback(values) {
  return ready.then(function () {
    return run(
      `INSERT INTO feedback (name, email, student_status, comments, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        values.name,
        values.email,
        values.studentStatus,
        values.comments,
        new Date().toISOString()
      ]
    ).then(function (result) {
      return result.lastID
    })
  })
}

var lastWyrId = -1

function getRandomWyrQuestion() {
  return ready.then(function () {
    return all('SELECT id, question, answer1, answer2 FROM wyr_questions ORDER BY id')
  }).then(function (rows) {
    if (!rows.length) {
      throw new Error('No would-you-rather questions in the database')
    }

    if (rows.length === 1) {
      lastWyrId = rows[0].id
      return rows[0]
    }

    var choice
    do {
      choice = rows[Math.floor(Math.random() * rows.length)]
    } while (choice.id === lastWyrId)

    lastWyrId = choice.id
    return {
      question: choice.question,
      answer1: choice.answer1,
      answer2: choice.answer2
    }
  })
}

function saveBodyCalculation(values) {
  return ready.then(function () {
    return run(
      `INSERT INTO body_calculations (height, weight, bmi, category, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        values.height,
        values.weight,
        values.bmi,
        values.category,
        new Date().toISOString()
      ]
    ).then(function (result) {
      return result.lastID
    })
  })
}

module.exports = {
  ready: ready,
  saveFeedback: saveFeedback,
  getRandomWyrQuestion: getRandomWyrQuestion,
  saveBodyCalculation: saveBodyCalculation,
  databasePath: databasePath
}
