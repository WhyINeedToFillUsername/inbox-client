var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('inbox/index', {title: 'inbox - monitored inboxes'});
});

router.get('/send', function (req, res, next) {
  res.render('inbox/send', {title: 'inbox - send notification'});
});

router.get('/detail/:iri', function (req, res, next) {
  let iri = req.params.iri;
  res.render('inbox/detail', {title: 'inbox', iri: decodeURIComponent(iri)});
});

module.exports = router;
