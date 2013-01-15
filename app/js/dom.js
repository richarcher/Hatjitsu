function DropDown(el) {
  this.dd = el;
  this.val = '';
  this.initEvents();
}
DropDown.prototype = {
  initEvents : function() {
    var obj = this;
    $(document).on('click', '#dd' ,function(event){
      $(this).toggleClass('active');
      return false;
    });

    $(document).on('click', '.dropdown > li', function(){
      $( '#dd span' ).text( $(this).text() + ' pack');
    });
  },
  getValue : function() {
    return this.val;
  },
  getIndex : function() {
    return this.index;
  }
}