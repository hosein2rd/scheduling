require('dotenv').config()

module.exports = {
    "development": {
        "username": "root",
        "password": process.env.DB_PASS,
        "database": "database_development",
        "host": process.env.DB_HOST,
        "dialect": "mysql"
      },
      "test": {
        "username": "root",
        "password": process.env.DB_PASS,
        "database": "database_test",
        "host": process.env.DB_HOST,
        "dialect": "mysql"
      },
      "production": {
        "username": "root",
        "password": process.env.DB_PASS,
        "database": "database_production",
        "host": process.env.DB_HOST,
        "dialect": "mysql"
      }
}