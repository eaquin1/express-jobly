process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

const {
    TEST_DATA,
    afterEachHook,
    beforeEachHook,
    afterAllHook
  } = require('./jest.config');

beforeEachHook(async () => {
    await beforeEachHook(TEST_DATA)
})

describe("GET all jobs", function () {
    it("Gets a list of jobs", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [
                
                {title: "Software Engineer", id: TEST_DATA.jobId, company_handle: "rithm" }
            
            ]
        });
    });

    // it("uses search parameters", async function () {
    //     const resp = await request(app).get("/jobs?search=shoe");
    //     expect(resp.statusCode).toEqual(200);
    //     expect(resp.body).toEqual({
    //         jobs: [{title: "shoe expert", id: TEST_DATA.jobId, company_handle: "nike" }],
    //     });
    // });

    // it("uses min salary search parameter", async function () {
    //     const resp = await request(app).get("/jobs?min_salary=49000");
    //     expect(resp.body).toEqual({
    //         jobs: [
    //             {title: "shoe expert", id: TEST_DATA.jobId, company_handle: "nike" }
    //         ],
    //     });
    // });
});

// describe("POST new jobs", function () {
//     it("Creates a new job", async function () {
//         const walker = { title: "dog walker", salary: 25000, equity: 0.1, company_handle: 'starbucks' };
//         const resp = await request(app).post("/jobs").send(walker);
//         expect(resp.statusCode).toBe(201);
//         expect(resp.body.job.title).toContain("dog walker");

//         const companyQuery = await db.query(
//             `SELECT title, company_handle FROM jobs WHERE title='dog walker'`
//         );
//         expect(companyQuery.rows[0]).toContain(
//            "company_handle");
//     });

//     it("returns 400 if name is not validated", async function () {
//         const resp = await request(app)
//             .post("/jobs")
//             .send({ title: "magician" });
//         expect(resp.statusCode).toBe(400);
//     });
// });

// describe("PATCH job", function () {
//     it("updates a job", async function () {
//         const resp = await request(app).patch(`/jobs/1`).send({
//             "title": "coffee wizard"
//         });
//         expect(resp.statusCode).toBe(200)
//         expect(resp.body.job.title).toBe("coffee wizard")
//     });

//     it("returns 400 for bad update", async function() {
//         const resp = await request(app).patch('/jobs/apple').send({
//             "title": 10395
//         })
//         expect(resp.statusCode).toBe(400)
//     })

//     it("responds with a 404 when job not found", async function() {
//         const resp = await request(app).patch('/jobs/0').send({
//             "title": "robot"
//         })
//         expect(resp.statusCode).toBe(404)
//     })
// });

// describe("DELETE job", function(){
//     it("deletes a job", async function() {
//         const resp = await request(app).delete(`/jobs/${TEST_DATA.jobId}`)
//         expect(resp.statusCode).toBe(200)
//     })
// })

afterEach(async function () {
    await afterEachHook();
  });
  
  
  afterAll(async function () {
    await afterAllHook();
  });
