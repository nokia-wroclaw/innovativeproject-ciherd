'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Jenkinses = new Module('jenkinses');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Jenkinses.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Jenkinses.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Jenkinses.menus.add({
    title: 'List of jenkins modules',
    link: 'all jenkinses',
    roles: ['authenticated']
 
  });
  Jenkinses.menus.add({
    'roles': ['authenticated'],
    'title': 'Add new jenkins',
    'link': 'create jenkinses'
  });  
 
  
  Jenkinses.aggregateAsset('css', 'jenkinses.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Jenkinses.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Jenkinses.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Jenkinses.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Jenkinses;
});
