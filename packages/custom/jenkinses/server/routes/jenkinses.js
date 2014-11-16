'use strict';

var jenkinses = require('../controllers/jenkinses');

// Jenkins authorization helpers

module.exports = function (Jenkinses, app, auth) {

    app.route('/jenkinses')
        .get(jenkinses.all)
        .post(auth.requiresLogin, jenkinses.create);

    app.route('/jenkinses/jobs')
        .get(jenkinses.jobs);

    app.route('/jenkinses/:jenkinsId')
        .get(jenkinses.show)
        .put(auth.requiresLogin, jenkinses.update)
        .delete(auth.requiresLogin, jenkinses.destroy);

    app.route('/jenkinses/:jenkinsId/status')
        .get(jenkinses.status);

    app.route('/jenkinses/:jenkinsId/jobs')
        .get(jenkinses.jobs);

    app.route('/jenkinses/jobs/:jenkinsId/:jobName/enable')
        .get(jenkinses.job_enable);

    app.route('/jenkinses/jobs/:jenkinsId/:jobName/disable')
        .get(jenkinses.job_disable);

    app.route('/jenkinses/jobs/:jenkinsId/:jobName/delete')
        .get(jenkinses.job_delete);

    app.route('/jenkinses/jobs/:jenkinsId/:jobName/build')
        .get(jenkinses.job_build);

    // Finish with setting up the jenkinsId param
    app.param('jenkinsId', jenkinses.jenkins);
};
