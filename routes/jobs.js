/** Routes for jobs. */

const express = require("express");
const router = express.Router({ mergeParams: true });

const { adminRequired, authRequired } = require("../middleware/auth");

const Job = require("../models/job");
const { validate } = require("jsonschema");
const ExpressError = require("../helpers/expressError")
const newJobSchema = require("../schemas/newJobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json");



/** GET / => {jobs: [jobData, ...]}  */
router.get("/", authRequired, async function(req, res, next){
    try{
        const jobs = await Job.getAll(req.query)
        return res.json({jobs})
    }
    catch(e){
        return next(e)
    }
})

/** GET /[jobs]  => {jobs: jobData} */
router.get("/:id", authRequired, async function(req, res, next){
    try{
        const {id} = req.params
        const result = await Job.getById(id)
        
        return res.json({result})
    }
    catch(e){
        return next(e)
    }
})


/** POST /  JobData => {Job: newJob}  */
router.post("/", adminRequired, async function(req, res, next){
    try{
        const validation = validate(req.body, newJobSchema)
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400) 
            }
        
        const results = await Job.createJob(req.body)
        return res.status(201).json({job: results })
    }
    catch(e){
        return next(e)
    }
})

/** PATCH /[id]   {jobData} => {job: jobData}  */
router.patch("/:id", adminRequired, async function(req, res, next){
    try{
        if ('id' in req.body){
            throw new ExpressError('ID does not change', 400)
        }
        const validation = validate(req.body, updateJobSchema)
        if (!validation.valid) {
            return next({
                status: 400,
                error: validation.errors.map(e => e.stack)
            })
        }
        const results = await Job.update(req.params.id, req.body)
        return res.json({job: results })
    }
    catch(e){
        return next(e)
    }
})


/** DELETE /[id]   => {message: "Job deleted"} */
router.delete("/:id", adminRequired, async function(req, res, next){
    try{
       await Job.remove(req.params.id)
        return res.json({message: "Job deleted"})
    }
    catch(e){
        return next(e)
    }
})

/** POST /[id]/apply  {state} => {message: state} */

router.post('/:id/apply', authRequired, async function(req, res, next) {
    try {
      const state = req.body.state || 'applied';
      await Job.apply(req.params.id, res.locals.username, state);
      return res.json({ message: state });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router