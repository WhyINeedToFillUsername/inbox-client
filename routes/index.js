var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('home', {title: 'inbox - login'});
});

router.post('/login', function (req, res, next) {
  console.log("logged in: " + req.body.webId);
  res.status(200).send('OK');
});

router.post('/logout', function (req, res, next) {
  res.status(200).send('OK');
});

module.exports = router;
