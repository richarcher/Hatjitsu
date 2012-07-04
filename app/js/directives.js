'use strict';

/* Directives */


angular.module('pokerApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('uiShow', [function() {
    return function(scope, elm, attrs) {
      scope.$watch(attrs.uiShow, function(newVal, oldVal) {
        if (newVal) {
          elm.addClass('ui-show');
        } else {
          elm.removeClass('ui-show');
        }
      });
    };
  }]).
  directive('uiHide', [function() {
    return function(scope, elm, attrs) {
      scope.$watch(attrs.uiHide, function(newVal, oldVal) {
        if (newVal) {
          elm.addClass('ui-hide');
        } else {
          elm.removeClass('ui-hide');
        }
      });
    };
  }]).
  directive('uiEnter', [function() {
    return function(scope, elm, attrs) {
      elm.bind("keydown keypress", function(event) {
        if(event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.uiEnter);
          });
          event.preventDefault();
        }
      });
    }
  }]);