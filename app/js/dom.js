/*jslint indent: 2, browser: true */
/*global angular, $, document */

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
    $(document).click(function () {
      $(obj.dd).removeClass('active');
    });
  }
};
