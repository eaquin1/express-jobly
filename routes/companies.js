const express = require("express")
const Company = require("../models/company")
const ExpressError = require("../helpers/expressError");
const router = new express.Router()
const {validate} = require("jsonschema")
const newCompanySchema = require("../schemas/newCompanySchema.json");
const updateCompanySchema = require("../schemas/updateCompanySchema.json");

/** GET / => {companies: [companyData, ...]}  */
router.get("/", async function(req, res, next){
    try{
        const companies = await Company.getAll(req.query)
        return res.json({companies})
    }
    catch(e){
        return next(e)
    }
})

/** GET /[handle]  => {company: companyData} */
router.get("/:handle", async function(req, res, next){
    try{
        const {handle} = req.params
        const companies = await Company.getByHandle(handle)
        return res.json({companies})
    }
    catch(e){
        return next(e)
    }
})


/** POST /  companyData => {company: newCompany}  */
router.post("/", async function(req, res, next){
    try{
        const validation = validate(req.body, newCompanySchema)
        if (!validation.valid) {
           throw new ExpressError(validation.errors.map(e => e.stack), 400)
            
        
        const results = await Company.createCompany(req.body)
        return res.status(201).json({company: results })
        }
    }
    catch(e){
        return next(e)
    }
})

/** PATCH /[handle]   companyData => {company: companyData}  */
router.patch("/:handle", async function(req, res, next){
    try{
        const validation = validate(req.body, updateCompanySchema)
        if (!validation.valid) {
            return next({
                status: 400,
                error: validation.errors.map(e => e.stack)
            })
        }
        const results = await Company.update(req.params.handle, req.body)
        return res.json({company: results })
    }
    catch(e){
        return next(e)
    }
})


/** DELETE /[handle]   => {message: "Company deleted"} */
router.delete("/:handle", async function(req, res, next){
    try{
       await Company.remove(req.params.handle)
        return res.json({message: "Company deleted"})
    }
    catch(e){
        return next(e)
    }
})

module.exports = router