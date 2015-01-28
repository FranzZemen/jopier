# Jopier
---

Jopier is a lightweight end to end Content Management System (CMS) for use in websites 
web applications and hybrid apps.

It consists of both a front end, pubished on Bower as 'jopier', and a back end, published on NPM as jopier-rest.  Both can be used independently with custom implementations providing 'the other side' but it is likely that most users will simply use jopier and jopier-rest.

The front end is built in Angular (currently supporting 1.3.x).  Therefore, the ideal client is an angular website, web app or hybrid app.  However, many clients not currently using Angular can easily incorporate it.  If this is the case and you are new to Angular there is a minimal install section in this document.

## Features
---
**jopier** (front end)
  1. API providing toggling of editing mode on or off.
  2. Directive allowing any element's html to be content managed, in place.
  3. Pulls content from html markup when it doesn't exist.  This is a wonderful feature for existing sites - just add the directive and your content will be pulled from what you already have published in html.  Thereafter, it ignores pre-existing html content of a element with the jopier directive.
  3. In place content editor (currently a trivial but effective implementation, see 'Backlog')
  4. Ability to place markup in content.
  5. Invokes a restful api for persistence
  6. Bulk loading of content on startup (default is each directive loads its own content when $compile'd)
  7. Configuration/Customizations:
    1. Bulk loading
    2. Element Edit control template and positioning
    3. Element Edit form template and positioning
    4. All styling via css
  8. Ability to segragate content for different sites
  9. Multple elements can have the same content.  An edit to one results in an update to all.
  10. Content keys can be expressions, thus changing the content based on the key.

**jopier-rest** (back end)
  1. Ability to define hierarchical content keys.  Hierarchical content keys are stored hierarchically in jopier-rest.
  2. MongoDB storage
  3. Ability to segregate content for different sites or endpoints
  4. Can be replaced with any other custom REST implementation.  Nothing magic about internals.
  

## Default Usage
---
This step by step is the quickest way to get started.  Depending on your current setup you should have your first editable content on your site in as little as 5 minutes.
### Pre-requisites
Skip any that you already have
  1. Vanilla version of MongoDB (installed on same host as node, port 27017)
  2. Node installed 
  3. ExpressJS installed and setup in Node
  4. Angular installed in your site
    * If you're new to angular, or your site doesn't currently use angular, you simply need to include the angular.js (see https://angularjs.org/) and:
      * Add this to your html:
             <html ng-app="someAppName">
      * Add this toyour javascript:
             angular.module('someAppName', ['jopier']); 

### Usage
**Server Side**
  1. Install jopier-rest 
     * Install from npm 
           npm install jopier-rest --save
     * Require and setup in module where you add middleware (for example, in angular-fullstack that's either app.js or routes.js)
           var Jopier = require('jopier-rest')
           var jopier = new Jopier();
           // or
           var jopier = new (require('jopier-rest'))();
  2. Add the jopier middleware to Express wherever you'd like (app or route level).  The order is important.  The getPath is more specific than the allPath so it must come first.
         
         app.get(jopier.getPath()).get(jopier.get);
         app.get(jopier.allPath()).get(jopier.all);
         app.post(jopier.postPath()).post(jopier.post);

**Front End**
  1. Get jopier (bower is recommended - it points to the lastest stable tag)
         bower install jopier --save
         or
         git clone https://github.com/FranzZemen/jopier
  2. Include jopier.js and jopier.css in your index.html or follow whatever build process you already use.
  3. Per pre-requisites above, make sure your angular app module includes 'jopier' as a module dependency:
         angular.module('yourAppName', [
            'other modules....',  
            'jopier',
            'other modules....']);
  4. Add a control to turn jopier on or off.  You can add the example button or use an existing menu system. 
         <button ng-click="toggleJopier()">Toggle Jopier</button>
  5. Provide the implementation for toggleJoppier() in a controller or directive, at your option.  :
  
        (function() {
            'use strict';

            angular.module('someApp')
                .controller('someController', ['$scope','$jopier', function ($scope, $jopier) {
                    $scope.toggleJopier = function () {
                        if ($jopier.active()) {
                            $jopier.toggleActive(false);
                        } else {
                            $jopier.toggleActive(true);
                        }
                    };
            }]);
        })();

  6. Select an html element you want content managed.  Add the jopier attribute directive with a key.
          <span jopier="INTRO">This was text that was there before Jopier</span>
  7. Build and deploy your front end in whichever way you normally do.
  8. In your browser/site, go to the control you setup above and turn Joppier on.  A Joppier button should show up near the element where we added the jopier directive.  
  9. Click on that button, a form should appear.  It should contain the key 'INTRO', and the inital (unsaved) contents will be the original contents of the element, or "This was text taht was there before Jopier".  Change it and save.  Reload your browser, and voila, you should see the new text.
  10. Open a mongo client and run:
          use jopier
          db.jopier.find()
   Your content should be there.  

## Detailed Documentation
---

### Angular Side (jopier module)
At this time, the angular side includes a directive, a service and a service provider (for site configuration).  

#### Install

    bower install jopier

#### Directive jopier
The jopier directive:
  - Is restricted to A (attribute)
  - Has an isolated scope
  - Operates at priority 10

You can turn any element's contained html into  managed content by adding the jopier attribute to that element, thus activating the jopier directive.  Content is idenfied by a key, either as an attribute or contained within the element:

        <some-element jopier key="SOME_KEY"></some-element> 
        or
        <some-element jopier>SOME_KEY</some-element>

The difference between these two approaches has consequences with respect to first time initialization.  When the key is defined in the attribute, but the content is not yet managed (as in, you just added the key and deployed), jopier will use the html contents of the element as the initial content value. This is highly beneficial for existing markup that has explicit copy in it.  
  
Keys must be assignable as JSON keys.  Keys can be hierarchical, and hierarchy is separated by ".".  For instance KEY_LEVEL_2.KEY_LEVEL_3.KEY_3.  See the mongo section below to view the default implementaton in the database.     

Note that in both cases an expression can be subsituted:

    <some-element jopier key="{{someKeyExp}}"></some-element> 
    or
    <some-element jopier>{{someKeyExp}}</some-element>

#### Service $jopier
The $jopier service has the following methods intended for client usage:
  - **$jopier.content(key)**:  
   - Retrieve the content for a given key.
   - Returns an angular promise
  
  - **$jopier.authToken(token)**:  
   - Allows the client to inject an optional authToken into the service so that any content updates can be authenticated/authorized on the server side.  Content requests are not authenticated at this time (they are the equivalent as getting your html).  
   - You should initialize this value in a controller or other service, so that it is set prior to a user actually initiating a change.  Your client is responsible for authenticating against your server and obtaining whatever authentication token you required, so you'd likely set this prior to the user editing content but just on/after successful authentication.  
   - The token is passed as json in the body, and thus available on your server side for whatever authorization middleware you use.  jopier-rest does nothing with this token.  Since it is represented by json, you can pass just about anything.
   - returns Self
   
  - **$jopier.toggleActive(onOff)**:
   - Allows client to turn on/off cms editing
   - No return value
   - Returns self
  - **jopier.active()**:
   - Returns the current cms editing state (on = true)
   

#### Provider $jopierProvider
The $jopierProvider allows you to perform site specific configuration.  It contains the following methods:

  - **$jopierProvider.preload(trueOrFalse)**:  
   - getter/setter method for preload.  When set, preloads content upon initialization.   Preload queues without blocking individual content requests until its complete, as those subsequently quued requests will likely come from the preload cache.
   - default value is true
   - getter returns current value
  - **$jopierProvider.setRestPath (path)**:
   - getter/setter method for the base rest path to invoke the back end.  
   - default value is /jopier.  This is an absolute path, not relative to html base tag.
   - getter returns current value
  - **$jopierProvider.buttonTemplate (template)**:
   -  getter/settermethod the template to use for the control that enables content to be edited on an element (every element with the directive has one).
   -  default is:
           <button class="jopier-button" ng-click="editContent()" ng-show="renderButton">Joppy It</button>
   - getter returns current value
  - **$jopierProvider.formTemplate (template)**:
   -  getter/settermethod the template to use for the content edit form for an element (every element with the directive has one).
   -  default is:
           <div class="jopier-form" ng-show="renderForm">
               <div class="jopier-form-container">
                    <form name="jopierForm" novalidate>
                        <div class="jopier-form-title"><span>Edit Content (this form is resizeable)</span></div>
                        <div class="jopier-form-control"><label>Key</label>:</div>
                        <div class="jopier-form-control"><input type="text" name="key" ng-model="key" disabled/></div>
                        <div class="jopier-form-control"><label>Content</label>:</div>
                        <div class="jopier-form-control"><textarea name="content" ng-model="content"/></div>
                        <div class="jopier-form-control jopier-form-buttons"><input type="submit" value="Save" ng-click="save()">&nbsp;&nbsp;<input type="button" value="Cancel" ng-click="cancel()"></div>
                    </form>
                </div>
            </div>
   -getter returns current value
  - **$jopierProvider.buttonOffsetLeftPixels (number)**:
   - getter/setter for the jopier button left offset from target element's absolute left position relative to the window (not parent).  This is a number in pixels, but no 'px' appended, its a number!
   - default is -10
   - getter returns current value
  - **$jopierProvider.buttonOffsetTopPixels (number)**:
   - getter/setter for the jopier button top offset from target element's absolute top position relative to the window (not parent).  This is a number in pixels, but no 'px' appended, its a number!
   - default is -25
   - getter returns current value
  - **$jopierProvider.formOffsetLeftPixels (number)**:
   - getter/setter for the jopier form left offset from target element's absolute left position relative to the window (not parent).  This is a number in pixels, but no 'px' appended, its a number!
   - default is 10
   - getter returns current value
  - **$jopierProvider.formOffsetTopPixels (number)**:
   - getter/setter for the jopier form top offset from target element's absolute top position relative to the window (not parent).  This is a number in pixels, but no 'px' appended, its a number!
   - default is 25
   - getter returns current value

#### CSS

    .jopier-button button, .jopier-form label, .jopier-form input, .jopier-form textarea, .jopier-form span {
        font-family: Arial, Helvetica, sans-serif;
    }

    .jopier-form-control label, .jopier-form-control input[type=text], .jopier-form-control textarea {
        font-size: 12px;
        width: 100%;
    }

    .jopier-form-control input[type=submit], .jopier-form-control input[type=button] {
        font-size: 12px;
        background-color: #001888;
        color: white;
    }

    .jopier-form span {
        font-size: 14px;
        font-weight: bold;
    }

    .jopier-form label {
        font-weight: bold;
    }

    .jopier-form input {
        resize: none;
     }

    .jopier-form textarea {
        resize: both; /* Javascript sizes */
        height: 200px;
    }

    .jopier-form-title {
        text-align: center;
    }

    .jopier-form-container {
        padding: 5px;
    }

    .jopier-form-control {
        padding-right: 5px;
    }

    .jopier-form-buttons {
        text-align:center;
    }

    .jopier-button {
        position:absolute;
        font-size: 10px;
        background-color: #001888;
        color: white;
        z-index: 1000;
    }

    .jopier-target {
        border-color: #001888;
        border-style: dotted;
        border-width: 1px;
        padding: 5px;
    }
    
    .jopier-target-hover {
        color: black;
        background-color: #aab2e8;
        border-style: solid;
    }
    .jopier-form {
        position:absolute;
        width : 350px;
        height : 315px;
        resize : both;
        overflow: auto;
        border-style: solid;
        border-width: 1px;
        border-color: black;
        background-color: #aab2e8;
        color: black;
        z-index: 1000;
    }

### Server Side (jopier-rest)
#### Install
    npm install jopier-rest --save

#### Jopier Class
Class interface, one instance per configuration.  Normally you'd just have one instance

    var Jopier = require ('JopierREST');
    var defaultConfig = new Jopier(); // Default configuration
    var someOtherConfig = new Jopier(siteKey, bunyanStreams, basePath, mongoUri, collection)

Usage in Express is straightfoward.  The Jopier class exposes a path for each operation as well as a corresponding implementation method (see the quick usuage example above).

##### Optional parameters

  - **siteKey**:  
   - An optional key to use as the mongo enry document identifier.  
   - Default is the inbound base path 
  -  **bunyanStreams**:  
   - An optional specification for logs.  The log system used is bunyan, so this is simply the streams option from that package.  
   - Default is stdout, level info
  - **basePath**:
   - The base path and what the allPath method returns.  The getPath and postPath method return and additional path parameter of /:key
   - Default is /jopier
  - **mongoUri**:
   -  Self explanatory.  Includes protocol,hostname, port and database.
   -  Default is mongodb://localhost/jopier
  -  **collection**:
   -  The mongo collection to use.
   -  Default is jopier

##### Methods

  - **Jopier.getPath(), Jopier.allPath(), Jopier.postPath()**
   - These three methods are for includsion in app.get/post or app.route.get/post respectively, per the quick usage example above.  The order matters as the only difference
   between the getPath and the allPath is a path parameter.
  - **Jopier.get(), Jopier,all(), Jopier.post()**  
   - These three method are the implementations for Express, per the quick usage example above.  They correspond to the path counterparts.


#### REST Interface

You don't need to worry about the mongo database if you use the optional jopier-rest backend.  However, it is documented here if needed.  Note that a custom implementatoin can change the paths.

  - **GET /jopier **
   - Returns the full hierarchical JSON document as defined in the mongo section below
   - Status 200 if found, status 404 if content not found with specific message "No content found" to distinguish from an endpoint not found, status 500 - server error
   
  - **GET /jopier/:key**
   - Returns the specific JSON content for the key:
    - {key: 'key', content: 'content'}
   - Status 200 if found, status 404 if content not found with specific message "No content found" to distinguish from an endpoint not found, status 500 - server error

  - **POST /jopier/:key**
   - Saves the specific content.  The body is json and contains {content: 'content'} and the key is the path parameter.  Note that the client can also send other stuff such as the authToken, but jopier-rest middleware does not concern itself with that.
   - Status 200 if successful.  Status 400 if body or key are empty or missing.   
   
#### Mongo Database Schema

You don't need to worry about the mongo database if you use the optional jopier-rest backend.  However, it is documented here if needed.  Basically there are two required fields, namely siteKey and content.  siteKey stores the key that was provided either optionally or by default. This is so that those wanting to segregate content somehow into different document instances can do so.   The content fields contains any number of keys, which may be hierarchical.  For instance below, the key KEY_LEVEL_2.KEY_LEVEL_3.KEY_3 is three levels deep and points to 'Some Content 3'.

    {
        "siteKey" : "/jopier",
        "content" : {
            "KEY_1" : "Some content",
            "KEY_LEVEL_2" : {
                "KEY_2" : "Some content 2"
                "KEY_LEVEL_3" : {
                        "KEY_3" : "Some Content 3"
                }
        },
}


## Backlog
---
A partial product backlog is provided here.  These are the public facing epics or stories that may be of interest.  Please do let me know if you have additional suggestions.

  1. Optional Grunt task to operate on html files server side to pre-initialize content instead of having client bulk load content on startup. 
  2. Angular interpolation and compilation of markup, in the case where new content contains angular directives etc. *
  2. Finer grained bulk loading, for instance to load content only included in the current views etc.
  3. Provide a filter to be used when the directive form is not convenient.
  4. Use a wysiwig editor in the form

   




    
    
    
    
 
