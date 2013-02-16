/*jslint browser: true */
/*global Modernizr */

Modernizr.addTest('checked', function () {
  return Modernizr.testStyles("#modernizr div {width:10px;} #modernizr input:checked ~ div {width: 20px;}", function (elem) {
    var chx = document.createElement('input'),
      div = document.createElement('div');

    chx.setAttribute("type", "checkbox");
    chx.setAttribute("checked", "checked");
    elem.appendChild(chx);
    elem.appendChild(div);

    return elem.lastChild.offsetWidth > 10;
  });
});

Modernizr.load([
  {
    test : Modernizr.mq('only all'),
    nope : '/lib/respond.min.js'
  }
]);