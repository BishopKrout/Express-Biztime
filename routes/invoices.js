const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
      const result = await db.query(
        'SELECT id, comp_code FROM invoices'
      );
      return res.json({invoices: result.rows});
    } catch (e) {
      return next(e);
    }
  });
  
  router.get('/:id', async (req, res, next) => {
    try {
      const invoiceResult = await db.query(
        'SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1',
        [req.params.id]
      );
  
      const companyResult = await db.query(
        'SELECT code, name, description FROM companies WHERE code = $1',
        [invoiceResult.rows[0].comp_code]
      );
  
      if (invoiceResult.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
      }
  
      const invoice = invoiceResult.rows[0];
      invoice.company = companyResult.rows[0];
  
      return res.json({invoice: invoice});
    } catch (e) {
      return next(e);
    }
  });

  
  router.post('/', async (req, res, next) => {
    try {
      const { comp_code, amt } = req.body;
      const result = await db.query(
        'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [comp_code, amt]
      );
      return res.status(201).json({invoice: result.rows[0]});
    } catch (e) {
      return next(e);
    }
  });

  
  router.patch('/:id', async (req, res, next) => {
    try {
      const { amt } = req.body;
      const result = await db.query(
        'UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [amt, req.params.id]
      );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
      }
  
      return res.json({invoice: result.rows[0]});
    } catch (e) {
      return next(e);
    }
  });

  
  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await db.query(
        'DELETE FROM invoices WHERE id = $1 RETURNING id',
        [req.params.id]
      );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
      }
  
      return res.json({status: 'deleted'});
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:code', async (req, res, next) => {
    try {
      const companyResult = await db.query(
        'SELECT code, name, description FROM companies WHERE code = $1',
        [req.params.code]
      );
  
      const invoiceResult = await db.query(
        'SELECT id FROM invoices WHERE comp_code = $1',
        [req.params.code]
      );
  
      if (companyResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${req.params.code}`, 404);
      }
  
      const company = companyResult.rows[0];
      company.invoices = invoiceResult.rows.map(invoice => invoice.id);
  
      return res.json({company: company});
    } catch (e) {
      return next(e);
    }
  });
  

  module.exports = router;