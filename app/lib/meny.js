/*!
 * meny 0.3
 * http://lab.hakim.se/meny
 * MIT licensed
 *
 * Created by Hakim El Hattab, http://hakim.se
 */
var MenySystem = function(){
  that = this;

  that.meny = document.querySelector( '.meny' );

  that.activateX = 40;
  that.deactivateX = that.meny.offsetWidth || 180;
  that.touchStartX = null;
  that.touchMoveX = null;
  that.isActive = false;

  that.supports3DTransforms = 'WebkitPerspective' in document.body.style ||
                'MozPerspective' in document.body.style ||
                'msPerspective' in document.body.style ||
                'OPerspective' in document.body.style ||
                'perspective' in document.body.style;

  document.addEventListener( 'touchstart', that.onTouchStart, false );
  document.addEventListener( 'touchend', that.onTouchEnd, false );

  // Fall back to more basic CSS
  if( !that.supports3DTransforms ) {
    document.documentElement.className += 'meny-no-transform';
  }

};

MenySystem.prototype.onTouchStart = function(event) {
  that.touchStartX = event.touches[0].clientX;
  that.touchMoveX = null;

  if( that.isActive || that.touchStartX < that.activateX ) {
    document.addEventListener( 'touchmove', that.onTouchMove, false );
  }
}

MenySystem.prototype.onTouchMove = function(event) {
  that.touchMoveX = event.touches[0].clientX;

  if( that.isActive && that.touchMoveX < that.touchStartX - that.activateX ) {
    that.deactivate();
    event.preventDefault();
  }
  else if( that.touchStartX < that.activateX && that.touchMoveX > that.touchStartX + that.activateX ) {
    that.activate();
    event.preventDefault();
  }
}

MenySystem.prototype.onTouchEnd = function(event) {
  document.addEventListener( 'touchmove', that.onTouchMove, false );

  // If there was no movement that was a tap
  if( that.touchMoveX === null ) {
    // Hide the menu when tapping on the content area
    if( that.touchStartX > that.deactivateX ) {
      that.deactivate();
    }
    // Show the meny when tapping on the left edge
    else if( that.touchStartX < that.activateX * 2 ) {
      that.activate();
    }
  }
}

MenySystem.prototype.activate = function() {
  if( that.isActive === false ) {
    that.isActive = true;
    console.log(that.isActive);

    // Add the meny-active class and clean up whitespace
    document.documentElement.className = document.documentElement.className.replace( /\s+$/gi, '' ) + ' meny-active';
  }
}

MenySystem.prototype.deactivate = function() {
  console.log('deactivate');
  if( that.isActive === true ) {
    that.isActive = false;

    // Remove the meny-active class
    document.documentElement.className = document.documentElement.className.replace( 'meny-active', '' );
  }
}