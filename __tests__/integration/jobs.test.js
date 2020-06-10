process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeEach(async function() {
    let companyResult = await db.query(`
    INSERT INTO companies(handle, name, num_employees) VALUES
     ('apple', 'apple inc', 1500),
     ('nike', 'nike inc', 200),
     ('ibm', 'ibm inc', 9000),
     ('starbucks', 'starbucks inc', 500);
    `);

    let jobResult = await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ('software engineer', 79000.0, 0.2, 'ibm'),
        ('shoe expert', 50000.0, 0.3, 'nike')`
    )
})


afterEach(async function() {
    //delete any data created by the test
    
    await db.query("DELETE FROM jobs")
    await db.query("DELETE FROM companies")
})

afterAll(async function () {
    //close db
    
    await db.end()
})

describe("GET all jobs", function () {
    it("Gets a list of jobs", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [
                { title: "software engineer", company_handle: "ibm" },
                { title: "shoe expert", company_handle: "nike" },
            
            ]
        });
    });

    it("uses search parameters", async function () {
        const resp = await request(app).get("/jobs?search=shoe");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: [{title: "shoe expert", company_handle: "nike" }],
        });
    });

    it("uses min salary search parameter", async function () {
        const resp = await request(app).get("/jobs?min_salary=51000");
        expect(resp.body).toEqual({
            jobs: [
                { title: "software engineer", company_handle: "ibm" }
            ],
        });
    });
});

// describe("POST new jobs", function () {
//     it("Creates a new job", async function () {
//         const pp = { handle: "pp", name: "pied piper", num_employees: 4 };
//         const resp = await request(app).post("/jobs").send(pp);
//         expect(resp.statusCode).toBe(201);
//         expect(resp.body.company.name).toContain("pied piper");

//         const companyQuery = await db.query(
//             `SELECT name, handle FROM jobs WHERE handle='pp'`
//         );
//         expect(companyQuery.rows[0]).toEqual({
//             handle: "pp",
//             name: "pied piper",
//         });
//     });

//     it("returns 400 if name is not validated", async function () {
//         const resp = await request(app)
//             .post("/jobs")
//             .send({ handle: "hooli" });
//         expect(resp.statusCode).toBe(400);
//     });
// });

// describe("PATCH company", function () {
//     it("updates a company", async function () {
//         const resp = await request(app).patch(`/jobs/apple`).send({
//             "name": "apple inc", "num_employees": 1900
//         });
//         expect(resp.statusCode).toBe(200)
//         expect(resp.body.company.num_employees).toBe(1900)
//     });

//     it("returns 400 for bad update", async function() {
//         const resp = await request(app).patch('/jobs/apple').send({
//             "name": "apple inc",
//             "num_employees": "Sam Jones"
//         })
//         expect(resp.statusCode).toBe(400)
//     })

//     it("responds with a 404 when company not found", async function() {
//         const resp = await request(app).patch('/jobs/hooli').send({
//             "name": "hooli", "description": "huge"
//         })
//         expect(resp.statusCode).toBe(404)
//     })
// });

// describe("DELETE company", function(){
//     it("deletes a company", async function() {
//         const resp = await request(app).delete(`/jobs/apple`)
//         expect(resp.statusCode).toBe(200)
//     })
// })
