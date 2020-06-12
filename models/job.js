const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for jobs. */

class Job {
    /** get all jobs: returns [job, ...] */
    static async getAll(data) {
        let baseQuery = `SELECT id, title, company_handle FROM jobs`;
        let whereExpressions = [];
        let queryValues = [];

        //For the possible search terms, add to whereExpressions and queryValues to generate the correct SQL

        if (data.min_salary) {
            queryValues.push(+data.min_salary);
            whereExpressions.push(`salary >=$${queryValues.length}`);
        }

        if (data.max_equity) {
            queryValues.push(+data.max_salary);
            whereExpressions.push(`equity <=$${queryValues.length}`);
        }

        if (data.search) {
            queryValues.push(`%${data.search}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }
        let finalQuery =
            baseQuery +
            whereExpressions.join(" AND ") +
            " ORDER BY date_posted";

        const jobsRes = await db.query(finalQuery, queryValues);
        return jobsRes.rows;
    }

    /** get job by id: returns job */
    static async getById(id) {
        const jobResponse = await db.query(
            `SELECT id, title, salary, equity, company_handle, date_posted FROM jobs WHERE id=$1`,
            [id]
        );

        const job = jobResponse.rows[0];

        if (!job) {
            throw new ExpressError(`No such job: ${id}`, 404);
        }

        const companiesResponse = await db.query(
            `SELECT name, num_employees, description, logo_url 
              FROM companies 
              WHERE handle = $1`,
            [job.company_handle]
        );

        job.company = companiesResponse.rows[0];

        return job;
    }
    /** create a job: returns job */
    static async createJob(data) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle) 
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [data.title, data.salary, data.equity, data.company_handle]
        );
        return result.rows[0];
    }

    /** update a job */
    static async update(id, data) {
        let { query, values } = sqlForPartialUpdate("jobs", data, "id", id);
        const result = await db.query(query, values);
        const job = result.rows[0];

        if (!job) {
            throw new ExpressError(`${id} does not exist`, 404);
        }

        return job;
    }
    /** remove a job */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs WHERE id=$1 RETURNING id`,
            [id]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`${id} does not exist`, 404);
        }
    }

    /** Apply for job: update db, returns undefined. */

    static async apply(id, username, state) {
        const result = await db.query(
            `SELECT id 
            FROM jobs 
            WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw ExpressError(`There exists no job '${id}`, 404);
        }

        await db.query(
            `INSERT INTO applications (job_id, username, state)
            VALUES ($1, $2, $3)`,
            [id, username, state]
        );
    }
}

module.exports = Job;
