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
  res.render('inbox/index', {title: 'inbox', webId: webId});
});

// get monitored inboxes
router.get('/monitor', checkSession, function (req, res, next) {
  let monitoredInboxes = req.session.monitoredInboxes;
  if (!monitoredInboxes) monitoredInboxes = [];

  res.json(monitoredInboxes);
});

// add new monitored inbox
router.post('/monitor', checkSession, function (req, res, next) {
  if (!req.is('application/json')) res.status(400).send('Bad Request');

  let monitoredInboxes = req.session.monitoredInboxes;
  if (!monitoredInboxes) monitoredInboxes = [];

  const newInboxIri = req.body.inboxIri;
  monitoredInboxes.push(newInboxIri);

  req.session.monitoredInboxes = monitoredInboxes;

  res.status(204).end();
});

module.exports = router;
