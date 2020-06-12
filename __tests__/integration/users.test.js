const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");

const {
    TEST_DATA,
    afterEachHook,
    beforeEachHook,
    afterAllHook
} = require("./config");


beforeEach(async () => {
    await beforeEachHook(TEST_DATA);
});

afterEach(async function () {
    await afterEachHook();
});

afterAll(async function () {
    await afterAllHook();
});

describe("GET all users", function () {
    it("gets a list of users", async function () {
        const resp = await request(app)
            .get("/users")
            .send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            users: [
                {
                    username: "santa",
                    first_name: "Santa",
                    last_name: "Claus",
                    email: "santa@chris.com",
                },
            ],
        });
        expect(resp.body.users[0]).not.toHaveProperty("password");
    });
});

describe("get one user", function () {
    it("gets one user", async function () {
        const resp = await request(app)
            .get(`/users/${TEST_DATA.currentUsername}`)
            .send({ _token: TEST_DATA.userToken });
        expect(resp.body).toEqual({
            user: {
                username: "santa",
                first_name: "Santa",
                jobs: [{
                  company_handle: "rithm",
                  state: null,
                  title: "Software Engineer"
                }],
                last_name: "Claus",
                email: "santa@chris.com",
                photo_url: null,
            },
        });
    });

    it("returns 404 if user is not found", async function () {
        const resp = await request(app).get(`/users/moi`).send({ _token: TEST_DATA.userToken });
        expect(resp.statusCode).toEqual(404);
    });
});

describe("POST new user", function () {
    it("creates a new user", async function () {
        const easter = {
            username: "easter",
            password: "hop",
            first_name: "Easter",
            last_name: "Bunny",
            email: "bunny@chris.com",
            is_admin: true,
        };
        const resp = await request(app).post("/users").send(easter);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toHaveProperty('token');
        const easterBunny = await User.getByUsername('easter');
        ['username', 'first_name', 'last_name'].forEach(key => {
          expect(easter[key]).toEqual(easterBunny[key]);
        });
      });
    

    it("returns 400 required password field not included", async function () {
        const resp = await request(app)
            .post("/users")
            .send({ username: 'santa',
            first_name: 'Santa',
            last_name: 'Claus',
            email: 'santa@chris.com'});
        expect(resp.statusCode).toBe(400);
    });

    it("prevents creating a user with a duplicate username", async function () {
        const resp = await request(app).post("/users").send({
            username: 'santa',
            password: 'merry',
            first_name: 'Santa',
            last_name: 'Claus',
            email: 'santa@chris.com'
        });
        expect(resp.statusCode).toBe(400);
    });
});

describe('PATCH /users/:username', function () {
    it("Updates a single a user's first_name with a selective update", async function() {
      const response = await request(app)
        .patch(`/users/${TEST_DATA.currentUsername}`)
        .send({ first_name: 'xkcd', _token: `${TEST_DATA.userToken}` });
        
      const user = response.body.user;
  
      expect(user).toHaveProperty('username');
      expect(user).not.toHaveProperty('password');
      expect(user.first_name).toBe('xkcd');
      expect(user.username).not.toBe(null);
    });
  
    it("Updates a single a user's password", async function() {
      const response = await request(app)
        .patch(`/users/${TEST_DATA.currentUsername}`)
        .send({ _token: `${TEST_DATA.userToken}`, password: 'foo12345' });
  
      const user = response.body.user;
      expect(user).toHaveProperty('username');
      expect(user).not.toHaveProperty('password');
    });
  
    it('Prevents a bad user update', async function() {
      const response = await request(app)
        .patch(`/users/${TEST_DATA.currentUsername}`)
        .send({ cactus: false, _token: `${TEST_DATA.userToken}` });
      expect(response.statusCode).toBe(400);
    });
  
    it('Forbids a user from editing another user', async function() {
      const response = await request(app)
        .patch(`/users/notme`)
        .send({ password: 'foo12345', _token: `${TEST_DATA.userToken}` });
      expect(response.statusCode).toBe(401);
    });
  
    it('Responds with a 404 if it cannot find the user in question', async function() {
      // delete user first
      await request(app)
        .delete(`/users/${TEST_DATA.currentUsername}`)
        .send({ _token: `${TEST_DATA.userToken}` });
      const response = await request(app)
        .patch(`/users/${TEST_DATA.currentUsername}`)
        .send({ password: 'foo12345', _token: `${TEST_DATA.userToken}` });
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe('DELETE /users/:username', async function() {
    it('Deletes a single a user', async function() {
      const response = await request(app)
        .delete(`/users/${TEST_DATA.currentUsername}`)
        .send({ _token: `${TEST_DATA.userToken}` });
      expect(response.body).toEqual({ message: 'User deleted' });
    });
  
    it('Forbids a user from deleting another user', async function() {
      const response = await request(app)
        .delete(`/users/notme`)
        .send({ _token: `${TEST_DATA.userToken}` });
      expect(response.statusCode).toBe(401);
    });
  
    it('Responds with a 404 if it cannot find the user in question', async function() {
      // delete user first
      await request(app)
        .delete(`/users/${TEST_DATA.currentUsername}`)
        .send({ _token: `${TEST_DATA.userToken}` });
      const response = await request(app)
        .delete(`/users/${TEST_DATA.currentUsername}`)
        .send({ _token: `${TEST_DATA.userToken}` });
      expect(response.statusCode).toBe(404);
    });
  })
