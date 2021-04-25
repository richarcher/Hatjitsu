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
      const element = document.querySelector( obj.dd );
      if (element.classList.contains('active')) {
        element.classList.remove('active');
      } else {
        element.classList.add('active');
      }
      return false;
    });

    document.addEventListener( "click", (evt) => {
      const element = document.querySelector( obj.dd );
      let targetElement = evt.target; // clicked element

      do {
        if (targetElement == element) {
          return;
        }
        targetElement = targetElement.parentNode;
      } while (targetElement);

      element.classList.remove('active');
    });
  }
};
