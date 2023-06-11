const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res) => {
    try {
        const results = await db.query(
            `SELECT * FROM companies`
        );
        return res.json({companies: results.rows})
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM companies WHERE type=$1, [req.params.code]`);

        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${req.params.code}`, 404);
        }
        return res.json({company: result.rows[0]});
    }   catch (e) {
        return next (e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const result = await db.query('INSERT INTO companies (doe, name, description) VALUES ($1, $2, $3) RETURNING code, name description', [code, name, description]);
        
        return res.status(201).json({company: result.rows[0]});
    }   catch (e) {
        return next (e);
    }
});

router.patch('/:code', async (req, res, next) => {
    try { 
        const { name, description } = req.body;
        const result = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, req.params.code]);

        if (result.rows.lenth === 0) {
            throw new ExpressError('No such company: ${req.params.code}', 404);
        }
        return res.json({company: result.rows[0]});
    }   catch (e) {
        return next (e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
      const result = await db.query(
        'DELETE FROM companies WHERE code = $1 RETURNING code',
        [req.params.code]
      );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such company: ${req.params.code}`, 404);
      }
  
      return res.json({status: 'deleted'});
    } catch (e) {
      return next(e);
    }
  });
  

module.exports = router;
