'use strict';

var jenkinses = require('../controllers/jenkinses');

// Jenkins authorization helpers

module.exports = function(Jenkinses, app, auth) {

  app.route('/jenkinses')
    .get(jenkinses.all)
    .post(auth.requiresLogin, jenkinses.create);
  app.route('/jenkinses/:jenkinsId')
    .get(jenkinses.show)
    .put(auth.requiresLogin, jenkinses.update)
    .delete(auth.requiresLogin, jenkinses.destroy);

  // Finish with setting up the jenkinsId param
  app.param('jenkinsId', jenkinses.jenkins);
};
