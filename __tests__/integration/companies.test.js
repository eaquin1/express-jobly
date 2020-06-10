process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeEach(async function () {
    let result = await db.query(`
    INSERT INTO companies(handle, name, num_employees) VALUES
     ('apple', 'apple inc', 1500),
     ('nike', 'nike inc', 200),
     ('ibm', 'ibm inc', 9000),
     ('starbucks', 'starbucks inc', 500);
    `);
});

afterEach(async function () {
    //delete any data created by the test
    await db.query("DELETE FROM companies");
});

afterAll(async function () {
    //close db
    await db.end();
});

describe("GET all companies", function () {
    it("Gets a list of companies", async function () {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            companies: [
                { handle: "apple", name: "apple inc" },
                { handle: "ibm", name: "ibm inc" },
                { handle: "nike", name: "nike inc" },
                { handle: "starbucks", name: "starbucks inc" },
            ],
        });
    });

    it("uses search parameters", async function () {
        const resp = await request(app).get("/companies?search=starbucks");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            companies: [{ handle: "starbucks", name: "starbucks inc" }],
        });
    });

    it("uses min employees search parameter", async function () {
        const resp = await request(app).get("/companies?min_employees=1000");
        expect(resp.body).toEqual({
            companies: [
                { handle: "apple", name: "apple inc" },
                { handle: "ibm", name: "ibm inc" },
            ],
        });
    });
});

describe("POST new companies", function () {
    it("Creates a new company", async function () {
        const pp = { handle: "pp", name: "pied piper", num_employees: 4 };
        const resp = await request(app).post("/companies").send(pp);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.company.name).toContain("pied piper");

        const companyQuery = await db.query(
            `SELECT name, handle FROM companies WHERE handle='pp'`
        );
        expect(companyQuery.rows[0]).toEqual({
            handle: "pp",
            name: "pied piper",
        });
    });

    it("returns 400 if name is not validated", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({ handle: "hooli" });
        expect(resp.statusCode).toBe(400);
    });
});

describe("PATCH company", function () {
    it("updates a company", async function () {
        const resp = await request(app).patch(`/companies/apple`).send({
            "name": "apple inc", "num_employees": 1900
        });
        expect(resp.statusCode).toBe(200)
        expect(resp.body.company.num_employees).toBe(1900)
    });

    it("returns 400 for bad update", async function() {
        const resp = await request(app).patch('/companies/apple').send({
            "name": "apple inc",
            "num_employees": "Sam Jones"
        })
        expect(resp.statusCode).toBe(400)
    })

    it("responds with a 404 when company not found", async function() {
        const resp = await request(app).patch('/companies/hooli').send({
            "name": "hooli", "description": "huge"
        })
        expect(resp.statusCode).toBe(404)
    })
});

describe("DELETE company", function(){
    it("deletes a company", async function() {
        const resp = await request(app).delete(`/companies/apple`)
        expect(resp.statusCode).toBe(200)
    })
})
