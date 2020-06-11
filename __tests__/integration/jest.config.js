//npm packages
const request = require('supertest')

//app imports
const app = require('../../app')
const db = require('../../db')

//global auth variable to store things for all the tests
const TEST_DATA = {}

async function beforeEachHook(TEST_DATA){
    try {
        const result = await db.query(
            'INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3) RETURNING *', ['rithm', 'rithm inc', 16]
        )
        TEST_DATA.currentCompany = result.rows[0];

    const newJob = await db.query(
      "INSERT INTO jobs (title, salary, equity, company_handle) VALUES ('Software Engineer', 100000, 0.2, $1) RETURNING *",
      [TEST_DATA.currentCompany.handle]
    );
    TEST_DATA.jobId = newJob.rows[0].id;

    } catch(error) {
        console.error(error)
    }
}

async function afterEachHook() {
    //delete any data created by the test
    try{
    await db.query("DELETE FROM jobs")
    await db.query("DELETE FROM companies")
    } catch(e){
        console.error(e)
    }
}

async function afterAllHook() {
    try {
      await db.end();
    } catch (err) {
      console.error(err);
    }
  }

  module.exports = {
    afterAllHook,
    afterEachHook,
    TEST_DATA,
    beforeEachHook
  };