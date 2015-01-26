# jopier  DO NOT CLONE DEVELOPMENT IN PROGESS (UNUSABLE)

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
