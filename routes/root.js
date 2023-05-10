const express = require('express');
const router = express.Router();
const path = require('path');

// Set up a route for the root URL and index.html using a simpler regex pattern
router.get(/^\/(index.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
  });
  
  module.exports = router;