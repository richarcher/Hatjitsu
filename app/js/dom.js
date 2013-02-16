/*jslint indent: 2, browser: true */
/*global angular, $, document */

$(function () {
  $('.no-js-hide').removeClass('no-js-hide');
});

function DropDown(el) {
  this.dd = el;
  this.val = '';
  this.initEvents();
}
DropDown.prototype = {
  initEvents : function () {
    var obj = this;
    $(document).on('click', this.dd, function (event) {
      $(this).toggleClass('active');
      return false;
    });
    $(document).on('click', '.dropdown > li', function () {
      $('span', obj.dd).text($(this).text() + ' pack');
    });
    $(document).click(function () {
      $('.dropdown-wrapper', obj.dd).removeClass('active');
    });
  }
};

function ScrollIntoView(el) {
  this.el = el;
}
ScrollIntoView.prototype = {
  now : function () {
    $('body').animate({ scrollTop : this.el.offset().top }, 'slow');
  }
};