const express = require("express");
const ExpressError = require("../helpers/ExpressError");
const User = require("../models/user");
const router = new express.Router();
const { validate } = require("jsonschema");
const newUserSchema = require("../schemas/newUserSchema.json");
const updateUserSchema = require("../schemas/updateUserSchema.json");
const createToken = require("../helpers/createToken");
const {ensureCorrectUser, authRequired} = require("../middleware/auth")

/** GET / => {users: [userData, ...]}  */
router.get("/", authRequired, async function (req, res, next) {
    try {
        const users = await User.getAll();
        return res.json({ users });
    } catch (e) {
        return next(e);
    }
});

/** GET /[users]  => {users: userData} */

router.get("/:username", authRequired, async function (req, res, next) {
    try {
        const { username } = req.params;
        const user = await User.getByUsername(username);

        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

/** POST /  userData => {user: newUser}  */
router.post("/", async function (req, res, next) {
    try {
        const validation = validate(req.body, newUserSchema);
        if (!validation.valid) {
            throw new ExpressError(
                validation.errors.map((e) => e.stack),
                400
            );
        }
        const newUser = await User.register(req.body);
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (e) {
        return next(e);
    }
});

/** PATCH /[username]   {userData} => {user: userData}  */
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        if ("username" in req.body || "is_admin" in req.body) {
            throw new ExpressError(
                "Username or admin status does not change",
                400
            );
        }
        const validation = validate(req.body, updateUserSchema);
        if (!validation.valid) {
            throw new ExpressError(
                validation.errors.map((e) => e.stack),
                400
            );
        }
        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

/** DELETE /[username]   => {message: "User deleted"} */

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ message: "User deleted" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
