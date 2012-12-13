/* jshint jquery:true */
/* Author: Dave Rupert
*  License: WTFPL
*  Liberally pinched and readapted with thanks
----------------------*/

(function($){
  'use strict';

  $.fn.dataCodeBlock = function(){

    // Yoinked from Prototype.js
    var escapeHTML = function( code ) {
      return code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    };
    var lastIndentationSize = function ( ary ){
      if (ary.length <= 1){
        return 0;
      }
      var str = ary[ary.length-1]
      var string = "";
      var spaces = str.match(/ /g) === null ? 0 : str.match(/ /g).length;
      for (var i = 0; i < spaces; i++) {
        string += " ";
      };
      return string;
    };
    var reIndent = function ( str, sub ){
      var intIndexOfMatch = str.indexOf( sub );
      while (intIndexOfMatch != -1){
        str = str.replace( sub, "" )
        intIndexOfMatch = str.indexOf( sub );
      }
      return str;
    };

    return $('[data-codeblock]').each(function(){
      var target = $(this).data('codeblock')
        , html = $(this).clone().removeAttr('data-codeblock')[0].outerHTML
        , codeblock = $('<pre><code>')
        , indentation = html.split("\n")
        , whitespace = lastIndentationSize( indentation )
        , newhtml = html;

      if ( whitespace.length ) {
        newhtml = reIndent( html, whitespace);
      }

      codeblock.find('code').append( escapeHTML(newhtml) );

      if(target) {
        $(target).append(codeblock);
      } else {
        $(this).after(codeblock);
      }
    });

  };

  // Self Execute!!
  $.fn.dataCodeBlock();
})(jQuery);



$(document).ready(function(){
  $('#toggleFlipper01').click(function(){
    $('#toggleFlippee01').toggleClass('flipped');
  });
  $('#toggleFlipper02').click(function(){
    $('#toggleFlippee02').toggleClass('flipped');
  });
  $('#toggleFlipper03').click(function(){
    $('#toggleFlippee03').toggleClass('flipped');
  });
  $('#toggleFlipper04').click(function(){
    $('#toggleFlippee04').toggleClass('flipped');
  });
  $('#toggleFlipper05').click(function(){
    $('#toggleFlippee05').toggleClass('flipped-stagger');
  });
});