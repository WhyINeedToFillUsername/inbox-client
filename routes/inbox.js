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
  let user = req.session.solidSession.webId;
  res.render('inbox/index', {title: 'inbox', user: user});
});

module.exports = router;
