//npm packages
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//app imports
const app = require("../../app");
const db = require("../../db");

//global auth variable to store things for all the tests
const TEST_DATA = {};

// Database DDL (for tests)
// const DB_TABLES = {
//     companies: `
//   CREATE TABLE companies(
//     handle TEXT PRIMARY KEY,
//     name TEXT UNIQUE NOT NULL,
//     num_employees INTEGER,
//     description TEXT,
//     logo_url TEXT
//   )`,

//     jobs: `
//   CREATE TABLE jobs(
//     id SERIAL PRIMARY KEY,
//     title TEXT,
//     salary FLOAT,
//     equity FLOAT CHECK(equity <= 1.0),
//     company_handle TEXT NOT NULL REFERENCES companies(handle) ON DELETE CASCADE,
//     date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`,

//     users: `
//   CREATE TABLE users(
//   username TEXT PRIMARY KEY,
//   password TEXT NOT NULL,
//   first_name TEXT NOT NULL,
//   last_name TEXT NOT NULL,
//   email TEXT NOT NULL UNIQUE,
//   photo_url TEXT,
//   is_admin BOOLEAN NOT NULL DEFAULT false
//   )`,

//   applications:
//   `CREATE TABLE applications(
//     username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
//     job_id INTEGER  REFERENCES jobs ON DELETE CASCADE,
//     state TEXT,
//     created_at TIMESTAMP DEFAULT current_timestamp,
//     PRIMARY KEY(username, job_id))`

// };

// async function beforeAllHook() {
//     try {
//         await db.query(DB_TABLES["companies"]);
//         await db.query(DB_TABLES["applications"])
//         await db.query(DB_TABLES["jobs"]);
//         await db.query(DB_TABLES["users"]);
//     } catch (error) {
//         console.error(error);
//     }
// }
async function beforeEachHook(TEST_DATA) {
    try {
        // login a user, get a token, store the user ID and token
        const hashPassword = await bcrypt.hash("merry", 1);
        const newUser = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ('santa', $1, 'Santa', 'Claus', 'santa@chris.com', true) RETURNING *`,
            [hashPassword]
        );

        const resp = await request(app).post("/login").send({
            username: "santa",
            password: "merry",
        });

        TEST_DATA.userToken = resp.body.token;
        TEST_DATA.currentUsername = jwt.decode(TEST_DATA.userToken).username;

        //create a company
        const result = await db.query(
            "INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3) RETURNING *",
            ["rithm", "rithm inc", 16]
        );
        TEST_DATA.currentCompany = result.rows[0];

        //create a job
        const newJob = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('Software Engineer', 100000, 0.2, $1) RETURNING *`,
            [TEST_DATA.currentCompany.handle]
        );
        TEST_DATA.jobId = newJob.rows[0].id;

        const newJobApp = await db.query(
            "INSERT INTO applications (job_id, username) VALUES ($1, $2) RETURNING *",
            [TEST_DATA.jobId, TEST_DATA.currentUsername]
        );
        TEST_DATA.jobApp = newJobApp.rows[0];
    } catch (error) {
        console.error(error);
    }
}

async function afterEachHook() {
    //delete any data created by the test
    try {
        await db.query("DELETE FROM applications");
        await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies");
        await db.query("DELETE FROM users");
    } catch (e) {
        console.error(e);
    }
}

async function afterAllHook() {
    try {
        // await db.query("DROP TABLE IF EXISTS applications");
        // await db.query("DROP TABLE IF EXISTS jobs");
        // await db.query("DROP TABLE IF EXISTS users");
        // await db.query("DROP TABLE IF EXISTS companies");

        await db.end();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    afterAllHook,
    afterEachHook,
    TEST_DATA,
    //beforeAllHook,
    beforeEachHook,
};
