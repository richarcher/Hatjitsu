var resizer = function () {
  var size = window.getComputedStyle(document.body,':after').getPropertyValue('content');
  if (size == 'widescreen') {
    $("body").removeClass().addClass("three-column");
  } else if (size == 'narrow'){
    $("body").removeClass().addClass("narrow-screen");
  } else {
    $('body').removeClass();
  }
}

var showCardPanel = function() {
  $('body').removeClass("active-settings").toggleClass("active-cardPanel");
}

var showVotePanel = function() {
  $('body').removeClass("active-settings").removeClass("active-cardPanel");
}

var showSettings = function() {
  $('body').removeClass("active-cardPanel").toggleClass("active-settings");
}