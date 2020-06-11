const express = require("express")
const ExpressError = require('../helpers/ExpressError');
const Job = require("../models/job")
const router = new express.Router()
const {validate} = require("jsonschema")
const newJobSchema = require("../schemas/newJobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json");

/** GET / => {jobs: [jobData, ...]}  */
router.get("/", async function(req, res, next){
    try{
        const jobs = await Job.getAll(req.query)
        return res.json({jobs})
    }
    catch(e){
        return next(e)
    }
})

/** GET /[jobs]  => {jobs: jobData} */
router.get("/:id", async function(req, res, next){
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
router.post("/", async function(req, res, next){
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
router.patch("/:id", async function(req, res, next){
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
router.delete("/:id", async function(req, res, next){
    try{
       await Job.remove(req.params.id)
        return res.json({message: "Job deleted"})
    }
    catch(e){
        return next(e)
    }
})

module.exports = router