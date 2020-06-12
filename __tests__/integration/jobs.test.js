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

describe("POST new jobs", function () {
    it("Creates a new job", async function () {
        console.log(TEST_DATA);
        const walker = {
            title: "dog walker",
            company_handle: "rithm",
            salary: 25000,
            equity: 0.1,
            _token: TEST_DATA.userToken,
        };

        const resp = await request(app).post("/jobs").send(walker);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.job.title).toContain("dog walker");

        const companyQuery = await db.query(
            `SELECT title, company_handle FROM jobs WHERE title='dog walker'`
        );
        expect(companyQuery.rows[0]).toEqual({
            company_handle: "rithm",
            title: "dog walker",
        });
    });

    it("returns 400 if title is not submitted", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                salary: 99999,
                equity: 0.2,
                company_handle: TEST_DATA.currentCompany.handle,
                _token: TEST_DATA.userToken,
            });
        expect(resp.statusCode).toBe(400);
    });
});

describe("GET all jobs", async function () {
    it("Gets a list of jobs", async function () {
        const resp = await request(app)
            .get("/jobs")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: "Software Engineer",
                    id: TEST_DATA.jobId,
                    company_handle: "rithm",
                },
            ],
        });
    });

    it("uses search parameters", async function () {
        const resp = await request(app)
            .get("/jobs?search=engineer")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: "Software Engineer",
                    id: TEST_DATA.jobId,
                    company_handle: "rithm",
                },
            ],
        });
    });

    it("uses min salary search parameter", async function () {
        const resp = await request(app)
            .get("/jobs?min_salary=49000")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: "Software Engineer",
                    id: TEST_DATA.jobId,
                    company_handle: "rithm",
                },
            ],
        });
    });
});

describe("PATCH job", function () {
    it("updates a job", async function () {
        const resp = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
            title: "coffee wizard",
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.job.title).toBe("coffee wizard");
    });

    it("returns 400 for bad update", async function () {
        const resp = await request(app).patch("/jobs/apple").send({
            title: 10395,
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(400);
    });

    it("responds with a 404 when job not found", async function () {
        const resp = await request(app).patch("/jobs/0").send({
            title: "robot",
            _token: TEST_DATA.userToken,
        });
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE job", function () {
    it("deletes a job", async function () {
        const resp = await request(app)
            .delete(`/jobs/${TEST_DATA.jobId}`)
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toBe(200);
    });
});

afterEach(async function () {
    await afterEachHook();
});

afterAll(async function () {
    await afterAllHook();
});
