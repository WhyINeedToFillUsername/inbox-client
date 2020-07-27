var express = require('express');
var router = express.Router();

function checkSession(req, res, next) {
  if (req.session.solidSession) {
    next();
  } else {
    console.error("no session!");
    res.redirect("/");
  }
}

router.get('/', checkSession, function (req, res, next) {
  let webId = req.session.solidSession.webId;
  res.render('inbox/index', {title: 'inbox - monitored inboxes', webId: webId});
});

router.get('/send', checkSession, function (req, res, next) {
  let webId = req.session.solidSession.webId;
  res.render('inbox/send', {title: 'inbox - send notification', webId: webId});
});

router.get('/detail/:iri', checkSession, function (req, res, next) {
  let iri = req.params.iri;
  let webId = req.session.solidSession.webId;
  res.render('inbox/detail', {title: 'inbox', iri: decodeURIComponent(iri), webId: webId});
});

module.exports = router;
