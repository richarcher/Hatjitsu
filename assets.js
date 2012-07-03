// assets.js
module.exports = function(assets) {
  assets.root = __dirname;
  assets.addJs('/app/lib/jquery.cookie/jquery.cookie.js');
  assets.addJs('/app/lib/underscore.min.js');
  assets.addJs('/app/lib/angular/angular.js');

  assets.addJs('/app/js/app.js');
  assets.addJs('/app/js/controllers.js');
  assets.addJs('/app/js/directives.js');
  assets.addJs('/app/js/filters.js');
  assets.addJs('/app/js/services.js');

  // assets.addCss('/public/bootstrap/bootstrap.min.css');
  // assets.addCss('/app/styles/screen.styl');
}