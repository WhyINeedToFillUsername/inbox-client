var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', {title: 'inbox - login'});
});

router.post('/login', function (req, res, next) {
  console.log("logged in: " + req.body.webId);
  req.session.solidSession = req.body;
  res.status(200).send('OK');
});

module.exports = router;
