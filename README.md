# jopier 

<p>Jopier is a lightweight end to end Content Management System (CMS) for use in websites 
web applications and hybrid apps.</p>

<p>On the front end, Jopier offers a configurable angular solution that does not force its 
universe on the applications that use it.  Even non-angular sites can use Jopier if they 
can include the angular library and provide the angular bootstrapping.</p>

<p>On the back end, which is optional, Jopier-REST provides a fully functional, configurable 
Node-Express-Mongo implementation that provides storage and retrieval services.  Alternatively, 
a site may implement its own REST services based on the specification here or use Jopier-REST 
with other node endpoint solutions (even barebones).</p>

<p>One of Jopier's goals is to play hand in hand with angular-translate, since content management 
and translations are often related.  Exceptions if any, are noted in this document.</p>

## Show Me The Money Usage

If you don't want to pour through documentation, this section is for you.

### Steps

  - Ensure you have a vanilla mongodb installed and running (port 27017)
  - Have a node instance installed, with Expres
  - Install jopierREST in your server side project
  
        npm install jopierREST --save
        
  - Add the following middleware to Express, either at the app or route level. 
    If you use angular-fullstack, that's in app.js or routes.js:
  
        // At the top of the module:
        
        var Jopier = require('JopierREST');
        var jopier = new Jopier();
        
        // Where middleware is configured
        
        
        app.route(jopier.allPath()).get(jopier.all);
        app.route(jopier.getPath()).get(jopier.get);
        app.route(jopier.postPath()).post(jopier.post);
        
  - You're all done with server side! Now on to client side.
  
  - Pick your favorite angular based website or webapp.  Alternatively, build a barebones index.html with some div's, span's, p's whatever.  You just need a front end that you deploy per your process.
  
  - Get jopier from bower or download from Github
  
        bower install jopier --save
        
        or
        
        git clone https://github.com/FranzZemen/jopier
        
  - If you're using bower, than your build process is likely already setup to include the .js and .css.  If not,
    make sure your index.html includes jopier.css and jopier.js.  (If your build process doesn't minify, I'll add a 
    .min version later, but its not a large library).
    
  - Make sure your angular app module includes 'jopier' as a module dependency:
  
        angular.module('yourAppName', [
            'other modules....',  
            'jopier',
            'other modules....']);
  
        
  - Add a control to turn jopier on or off:
  
        <button ng-click="toggleJopier()">Toggle Jopier</button>
  
  - Provide the implementation for toggleJoppier() in a controller or directive, at your option:
  
          $scope.toggleJopier = function() {
              if ($('.jopier-button').is(':visible')) {
                  $scope.$root.$broadcast('jopier-hide');
              } else {
                  $scope.$root.$broadcast('jopier-show');
              }
          };
        
  - Now for the actual CMS part, go to any tag, say a span, and include the directive jopier="SOME_KEY" where SOME_KEY is a content
  key.  Let's say its "INTRO":
  
        <span jopier="INTRO">This was text that was there before Jopier</span>
        
    
  - Build and deploy your front end in whichever way you normally do.
  
  - Toggle Joppier on.  You should see a Joppier button near the span.
  
  - Click on the Joppier button, form should appear for editing its content.  Since Joppier
  will not find the content yet, because it doesn't exist, it will have taken the content
  from within the span.  If you hit save, it will save that to mongo.  Or you can change it
  and save your change to mongo.
  
  - Open your mongo client.  Run:
  
        use jopier
        db.jopier.find()
  
  - Your content should be there.  You'll notice the top level has a siteKey
  that identifies where this content is published.  
  
  
        
  
  

## Usage

### As a directive: 

Place the directive 'jopier' on the element that contains content.  Use the content key as the element's value.  

    <h1 jopier>INTRODUCTION.TITLE</h1>

Sometime the content is a function of something, so you also use angular expressions 

    <h1 jopier>{{some expression that results in 'INTRODUCTION.TITLE'}}</h1>
    <!-- or for one time bindings: -->
    <h1 jopier>{{::some expression that results in 'INTRODUCTION.TITLE'}}</h1>

## Compatible with angular-translate

jopier is compatible with most of angular-translate as follows:

  1.  On element directives: 
    - jopier supports the common form, which is to enclose the key in the element's inner html.  jopier will execute at a higher priority (1000) - it will detect that there is a translate directive and it will grab the key before angular-translate can replace the value with the translation.
  2. 


### Directives

angular-translate supports several forms to specify the translation key.  Currently, jopier only supports the 
most common method, which is to place the key as the element's value.  

    <h1 jopier translate>{{some expression that results in 'INTRODUCTION.TITLE'}}</h1>
    <!-- or for one time bindings: -->
    <h1 jopier translate>{{::some expression that results in 'INTRODUCTION.TITLE'}}</h1>
