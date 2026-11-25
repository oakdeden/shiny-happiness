var mysql = require('mysql2/promise')

// On Hostinger Node apps, use 127.0.0.1 — not srvNNNN.hstgr.io (that host is for remote clients only).
var pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv1623.hstgr.io',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5
})

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

function assertConfig() {
  var missing = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(function (key) {
    return !process.env[key]
  })
  if (missing.length) {
    throw new Error('Missing database environment variables: ' + missing.join(', '))
  }
}

function run(sql, params) {
  return pool.execute(sql, params || []).then(function (result) {
    return result[0]
  })
}

function all(sql, params) {
  return pool.execute(sql, params || []).then(function (result) {
    return result[0]
  })
}

function get(sql, params) {
  return all(sql, params).then(function (rows) {
    return rows[0]
  })
}

var ready = Promise.resolve()
  .then(function () {
    assertConfig()
    return run(
      `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(254) NOT NULL,
        student_status VARCHAR(3) NOT NULL,
        comments TEXT NOT NULL,
        created_at VARCHAR(40) NOT NULL,
        CONSTRAINT feedback_student_status_check CHECK (student_status IN ('yes', 'no'))
      )`
    )
  })
  .then(function () {
    return run(
      `CREATE TABLE IF NOT EXISTS wyr_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(500) NOT NULL,
        answer1 VARCHAR(255) NOT NULL,
        answer2 VARCHAR(255) NOT NULL,
        UNIQUE KEY wyr_questions_question_unique (question)
      )`
    )
  })
  .then(function () {
    return run(
      `CREATE TABLE IF NOT EXISTS body_calculations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        height DOUBLE NOT NULL,
        weight DOUBLE NOT NULL,
        bmi DOUBLE NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at VARCHAR(40) NOT NULL
      )`
    )
  })
  .then(function () {
    return get('SELECT COUNT(*) AS count FROM wyr_questions')
  })
  .then(function (row) {
    if (row && Number(row.count) > 0) return

    return seedQuestions.reduce(function (chain, item) {
      return chain.then(function () {
        return run(
          `INSERT IGNORE INTO wyr_questions (question, answer1, answer2)
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
      return result.insertId
    })
  })
}

var lastWyrId = -1

function getRandomWyrQuestion() {
  return ready
    .then(function () {
      return all('SELECT id, question, answer1, answer2 FROM wyr_questions ORDER BY id')
    })
    .then(function (rows) {
      if (!rows.length) {
        throw new Error('No would-you-rather questions in the database')
      }

      if (rows.length === 1) {
        lastWyrId = rows[0].id
        return {
          question: rows[0].question,
          answer1: rows[0].answer1,
          answer2: rows[0].answer2
        }
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
      return result.insertId
    })
  })
}

module.exports = {
  ready: ready,
  saveFeedback: saveFeedback,
  getRandomWyrQuestion: getRandomWyrQuestion,
  saveBodyCalculation: saveBodyCalculation,
  databaseName: process.env.DB_NAME || null
}
