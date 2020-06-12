const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");

const BCRYPT_WORK_FACTOR = 10;

/** Collection of related methods for users. */

class User {
    /** authenticate user with username, password. Returns user or throws err. */

    static async authentication(data) {
        //try to find the user first
        const result = await db.query(
            `SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username=$1`,
            [data.username]
        );

        const user = result.rows[0];

        if (user) {
            //compared hashed password to a new hash from password
            const isValid = await bcrypt.compare(data.password, user.password);
            if (isValid) {
                return user;
            }
        }
        throw new ExpressError("Invalid Password", 401);
    }

    /** Register user with data. Returns new user data. */
    static async register(data) {
        const duplicateCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [data.username]
        );

        if (duplicateCheck.rows[0]) {
            throw new ExpressError(
                `There is already a user with the username ${data.username}`,
                400
            );
        }

        const hashedPassword = await bcrypt.hash(
            data.password,
            BCRYPT_WORK_FACTOR
        );

        const result = await db.query(
            `INSERT INTO users 
             (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
            [
                data.username,
                hashedPassword,
                data.first_name,
                data.last_name,
                data.email,
                data.photo_url,
                data.is_admin,
            ]
        );

        return result.rows[0];
    }
    /** get all users: returns [user, ...] */
    static async getAll() {
        const results = await db.query(
            `SELECT username, first_name, last_name, email
                FROM users`
        );

        return results.rows;
    }

    /** get user by id: returns user */
    static async getByUsername(username) {
        const userResult = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
                FROM users
                WHERE username = $1`,
            [username]
        );

        const user = userResult.rows[0];

        if (!user) {
            throw new ExpressError(`No such username: ${username}`, 404);
        }

        const userJobsRes = await db.query(
            `SELECT j.title, j.company_handle, a.state 
                  FROM applications AS a
                  JOIN jobs AS j ON j.id = a.job_id
                  WHERE a.username = $1`,
            [username]
        );
        user.jobs = userJobsRes.rows;
        return user;
    }

    /** update a user
     * This is a partial update, based on what the user passes in
     */
    static async update(username, data) {
        let { query, values } = sqlForPartialUpdate(
            "users",
            data,
            "username",
            username
        );
        const result = await db.query(query, values);
        const user = result.rows[0];

        if (!user) {
            throw new ExpressError(`${username} does not exist`, 404);
        }

        delete user.password;
        delete user.is_admin;
        return user;
    }

    /** remove a user */
    static async remove(username) {
        const result = await db.query(
            `DELETE FROM users WHERE username=$1 RETURNING username`,
            [username]
        );

        if (result.rows.length == 0) {
            throw new ExpressError(`{username} does not exist`, 404);
        }
    }
}

module.exports = User;
