const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

const {
    TEST_DATA,
    afterEachHook,
    beforeEachHook,
    afterAllHook,
} = require("./config");


beforeEach(async () => {
    await beforeEachHook(TEST_DATA);
});

describe("GET all companies", function () {
    it("Gets a list of companies", async function () {
        const resp = await request(app)
            .get("/companies")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            companies: [{ handle: "rithm", name: "rithm inc" }],
        });
    });

    it("uses search parameters", async function () {
        const resp = await request(app)
            .get("/companies?search=inc")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            companies: [{ handle: "rithm", name: "rithm inc" }],
        });
    });

    it("uses min employees search parameter", async function () {
        const resp = await request(app)
            .get("/companies?min_employees=15")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.body).toEqual({
            companies: [{ handle: "rithm", name: "rithm inc" }],
        });
    });
});

describe("POST new companies", function () {
    it("Creates a new company", async function () {
        const pp = {
            handle: "pp",
            name: "pied piper",
            num_employees: 4,
            _token: TEST_DATA.userToken,
        };
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
            .send({ handle: "hooli", _token: TEST_DATA.userToken });
        expect(resp.statusCode).toBe(400);
    });
});

describe("PATCH company", function () {
    it("updates a company", async function () {
        const resp = await request(app).patch(`/companies/rithm`).send({
            name: "apple inc",
            num_employees: 1900,
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company.num_employees).toBe(1900);
    });

    it("returns 400 for bad update", async function () {
        const resp = await request(app).patch("/companies/rithm").send({
            name: "apple inc",
            num_employees: "Sam Jones",
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(400);
    });

    it("responds with a 404 when company not found", async function () {
        const resp = await request(app).patch("/companies/hooli").send({
            name: "hooli",
            description: "huge",
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE company", function () {
    it("deletes a company", async function () {
        const resp = await request(app)
            .delete(`/companies/rithm`)
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toBe(200);
    });
    
    it("Responds with a 404 if it cannot find the company in question", async function () {
        // delete company first
        const response = await request(app).delete(`/companies/notme`).send({
            _token: TEST_DATA.userToken,
        });
        expect(response.statusCode).toBe(404);
    });
});

afterEach(async function () {
    await afterEachHook();
});

afterAll(async function () {
    await afterAllHook();
});
