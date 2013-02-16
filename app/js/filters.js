/*jslint indent: 2, browser: true */
/*global angular, $ */

'use strict';

/* Filters */

angular.module('pokerApp.filters', []).
  filter('interpolate', ['version', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);
