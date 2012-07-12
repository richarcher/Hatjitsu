(function($) {
  $.fn.fastClick = function(handler) {
    return $(this).each(function() {
      new FastButton($(this)[0], handler);
    });
  };
}(jQuery));

