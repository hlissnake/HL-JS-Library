### A basic Javascript library

A DOM Library developed developed in 2011 by myself. It is my first pratical experience involving Framework design, Dom manipulation, Lazyload, Javascript extensions and Javascript module loader. Afterward, I determined to become a new front end career path.

### Intention

I'm not intent to use it in formal develop environment. It can bring out a great skills enhancement while developing a library, only by native javascript without any framework's supports.

Definitely a wonderful playground to test your design pattern and coding abilities, especially when designing a framework. I alwasy believe that, by developing your own framework, it can help developer to figure out the solutions when they face the framework's hard issues.

* current architecture design: 
    * namespace variables in global closure to define various modules (I will discard it recently) ;
    * the main design pattern: Observable, Delegate Events, MVC
* new version is in schedule: 


### Features

* Object Oriented Design, provide a Simple Class definition;
* Enhanced Javascript Object prototype: 
    * append(mixin), 
    * deep clone, 
    * array each
* Enhanced Javascript Function prototype, such as: 
    * delegate(context bind), 
    * defer(setTimeout), 
    * buffer(cannot execute in a time range), 
    * createInterval
    * intercept: AOP
    * newInstance: simulation of "new" syntax
* A simple module criteria. (It will be replace by webpack and CommonJS in next version)
* Dom manipulation, including: create/remove element, find ancestor parent, animation;


### UI Components

Various traditional UI components extend on ui.Base Class.

* Accordion
* DigitalClock
* DigitalNumber
* Grid
* Tab
* TreeView 

### Todo list

* CommonJS module style, built by webpack;
* Promise process;
* High performance aniamtion (RAF, Transition);
* Virtual Dom implementation (similar like React.js);



