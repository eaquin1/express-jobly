const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for companies. */

class Company {
    /** get all companies: returns [company, ...] */
    static async getAll(data) {
        let baseQuery = `SELECT handle, name FROM companies`;
        let whereExpressions = [];
        let queryValues = [];

        if (+data.min_employees >= +data.max_employees) {
            throw new ExpressError(
                "Min employees must be less than max employees",
                400
            );
        }

        //For the possible search terms, add to whereExpressions and queryValues to generate the correct SQL

        if (data.min_employees) {
            queryValues.push(+data.min_employees);
            whereExpressions.push(`num_employees >=$${queryValues.length}`);
        }

        if (data.max_employees) {
            queryValues.push(+data.max_employees);
            whereExpressions.push(`num_employees <=$${queryValues.length}`);
        }

        if (data.search) {
            queryValues.push(`%${data.search}%`);
            whereExpressions.push(`name ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }
        let finalQuery =
            baseQuery + whereExpressions.join(" AND ") + " ORDER BY name";
        const companiesRes = await db.query(finalQuery, queryValues);
        return companiesRes.rows;
    }

    /** get company by id: returns company */
    static async getByHandle(handle) {
        const result = await db.query(
            `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle=$1`,
            [handle]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${handle}`);
        }

        return result.rows[0];
    
    }
    /** create a company: returns company */
    static async createCompany(data) {
        const duplicateCheck = await db.query(
            `SELECT handle
            FROM companies
            WHERE handle = $1`,
            [data.handle]
        );

        if (duplicateCheck.rows[0]) {
            throw new ExpressError(
                `There already exists a company with handle '${data.handle}`,
                400
            );
        }
        const result = await db.query(
            `INSERT INTO companies(handle, name, num_employees, description, logo_url) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
            [
                data.handle,
                data.name,
                data.num_employees,
                data.description,
                data.logo_url,
            ]
        );
        return result.rows[0];
    }

    /** update a company */
    static async update(handle, data) {
        let { query, values } = sqlForPartialUpdate(
            "companies",
            data,
            "handle",
            handle
        );
        await db.query(query, values);
        const result = await db.query(query, values);
        const company = result.rows[0];

        if (!company) {
            throw new ExpressError(`${handle} does not exist`, 404);
        }

        return company;
    }

    static async remove(handle) {
        const result = await db.query(
            `DELETE FROM companies WHERE handle=$1 RETURNING handle`,
            [handle]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`${handle} does not exist`, 404);
        }
    }
}

module.exports = Company;
