'use strict';

var express = require('express');
var controller = require('./jenkins.controller');

var router = express.Router();

router.get('/', controller.jenkinses_list);
router.post('/', controller.jenkins_create);
router.get('/:id', controller.jenkins_display);
router.put('/:id', controller.jenkins_update);
router.delete('/:id', controller.jenkins_delete);
router.post('/:id/soft-restart', controller.jenkins_softRestart);
router.post('/:id/hard-restart', controller.jenkins_hardRestart);
router.post('/:id/shutdown', controller.jenkins_hardRestart);
router.get('/:id/last-update', controller.jenkins_lastupdate);
router.get('/:id/plugins', controller.jenkins_plugins_display);
router.delete('/:id/jobs/:jobName', controller.jenkins_job_delete);
router.get('/:id/jobs/:job-id/build-info', controller.jenkins_job_buildinfo);
router.put('/:id/jobs/:jobName/build', controller.jenkins_job_build);
router.put('/:id/jobs/:job-id/build-parameters', controller.jenkins_job_buildwithparams);
router.post('/:id/jobs/:jobName/copy', controller.jenkins_job_copy);
router.put('/:id/jobs/:jobName/enable', controller.jenkins_job_enable);
router.put('/:id/jobs/:jobName/disable', controller.jenkins_job_disable);
router.get('/:id/jobs/:jobName/xml-config', controller.jenkins_job_xmlconfig_display);
router.put('/:id/jobs/:job-id/xml-config', controller.jenkins_job_xmlconfig_update);
router.post('/:id/jobs/:jobName/copy/:newJobName', controller.copy_job_betwen_jenkinses);
router.post('/test-ssh-connection', controller.jenkins_test_ssh_connection);
router.post('/migrate', controller.jenkins_migrate);
router.post('/schedule', controller.jenkins_job_schedule);
router.post('/schedule/add', controller.jenkins_job_schedule_add);
router.post('/schedule/build', controller.jenkins_job_schedule_build);
router.get('/schedule/get', controller.schedule_list);

module.exports = router;
