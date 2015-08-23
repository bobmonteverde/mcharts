
/* ****
 * Basic Tooltips
 *   no outside dependencies
 *   currently exposes functionality at window.mc.tooltip
 *****/

(function(window, document, mc) {
  'use strict';


  let mctooltip   = {};
  let removeDelay = 500; // ms to wait before removing a tooltip

  // Make window.mc if it doesn't exist (if you are using this without mCharts)
  // if (!mc) mc = window.mc = {};

  // Expose mctooltip at window.mc.tooltip
  mc.tooltip = mctooltip;


  // mctooltip.show = function(pos, content, gravity, dist, parent, classes) {
  mctooltip.show = function(o) {
    let pos        = o.pos;
    let content    = o.content;
    let gravity    = o.gravity || 's';
    let dist       = typeof o.dist === 'undefined' ? 10 : o.dist;
    let parent     = o.parent;
    let classes    = o.classes;
    let container  = document.createElement('div');
    let body       = parent;
    let windowSize = getWindowSize();
    let scrollTop  = window.scrollY;
    let scrollLeft = window.scrollX;
    let width;
    let height;
    let left;
    let top;
    let tLeft;
    let tTop;

    function calcPos() {
      switch (gravity) {
        case 'e':
          left   = pos[0] - width - dist;
          top    = pos[1] - (height / 2);
          tLeft  = left + offsetLeft(container);
          tTop   = top + offsetTop(container);
          if (tLeft < scrollLeft) // check if left edge is off screen
            left = pos[0] > scrollLeft - dist ?
                     pos[0] + dist :
                     scrollLeft - tLeft + left;
          if (tTop < scrollTop) // check if top edge is off screen
            top  = scrollTop - tTop + top;
          if (height > scrollTop + windowSize.height - tTop) // check if bottom edge is off screen
            top  = scrollTop + windowSize.height - tTop + top - height;
          break;

        case 'w':
          left   = pos[0] + dist;
          top    = pos[1] - (height / 2);
          tLeft  = left + offsetLeft(container);
          tTop   = top + offsetTop(container);
          if (width > windowSize.width + scrollLeft - tLeft) // check if right edge is off screen
            left = pos[0] - width - dist; // TODO: flip gravity, consider checking if left is larger than right
          if (tTop < scrollTop) // check if top edge is off screen
            top  = scrollTop + 5;
          if (height > scrollTop + windowSize.height - tTop) // check if bottom edge is off screen
            top  = scrollTop - height - 5; // TODO: flip gravity
          break;

        case 'n':
          left   = pos[0] - (width / 2);
          top    = pos[1] + dist;
          tLeft  = left + offsetLeft(container);
          tTop   = top + offsetTop(container);
          if (tLeft < scrollLeft) // check if left edge is off screen
            left = scrollLeft - tLeft + left;
          if (width > windowSize.width - tLeft) // check if right edge is off screen
            left = left + windowSize.width - tLeft - width;
          if (height > scrollTop + windowSize.height - tTop) { // check is bottom edge goes off screen
            if (scrollTop - tTop < scrollTop + windowSize.height - tTop - height) { // check if bottom edge is off screen
              gravity = 's';
              calcPos();
            } else {
              top  = scrollTop + windowSize.height - tTop + top - height;
            }
          }
          break;

        default: // case 's':
          left   = pos[0] - (width / 2);
          top    = pos[1] - height - dist;
          tLeft  = left + offsetLeft(container);
          tTop   = top + offsetTop(container);
          if (tLeft < scrollLeft) // check if left edge is off screen
            left = scrollLeft - tLeft + left;
          if (width > windowSize.width - tLeft) // check if right edge is off screen
            left = left + windowSize.width - tLeft - width;
          if (scrollTop > tTop) { // check if top edge is off screen
            if (scrollTop - tTop < scrollTop + windowSize.height - tTop - height) {
              gravity = 'n';
              calcPos();
            } else {
              top  = scrollTop;
            }
          }
          break;
      }
    }


    // Account for scroll bars
    // TODO: do this only when scrollbars take up space
    if (window.innerHeight < document.body.scrollHeight)
      windowSize.width -= 16;
    if (window.innerWidth < document.body.scrollWidth)
      windowSize.height -= 16;


    // If the parent element is an SVG element, place tooltip in the <body> element.
    if (!parent || parent.tagName.match(/g|svg/i)) {
      body = document.getElementsByTagName('body')[0];
      parent = false;
    }


    container.innerHTML     = content;
    container.style.left    = 0;
    container.style.top     = 0;
    container.style.opacity = 0;
    container.className     = 'mc-tooltip ' +
                              (classes ? classes : 'mc-xy-tooltip') +
                              ' mc-tooltip-gravity-' + gravity;


    body.appendChild(container);


    // These can't be calculated until the container is appended
    width  = parseInt(container.offsetWidth, 10);
    height = parseInt(container.offsetHeight, 10);


    calcPos();


    // TODO: decide if I need to set className twice
    container.className = `mc-tooltip ${classes ? classes : 'mc-xy-tooltip'}` +
                          `mc-tooltip-gravity-${gravity}`;

    container.style.left          = left + 'px';
    container.style.top           = top + 'px';
    container.style.opacity       = 1;
    container.style.position      = 'absolute';
    container.style.pointerEvents = 'none';



    // Recursively calculate top offset of an element from the body
    function offsetTop(elem) {
      let top = 0;

      do {
        if (!isNaN(elem.offsetTop)) top += elem.offsetTop;
      } while (elem = elem.offsetParent);

      return top;
    }


    // Recursively calculate left offset of an element from the body
    function offsetLeft(elem) {
      let left = 0;

      do {
        if (!isNaN(elem.offsetLeft)) left += elem.offsetLeft;
      } while (elem = elem.offsetParent);

      return left;
    }

    return container;
  };


  mctooltip.cleanup = function() {
    let tooltips = document.getElementsByClassName('mc-tooltip');
    let purging  = [];
    let removeMe;

    for (let i = 0; i < tooltips.length; i++) {
      purging.push(tooltips[i]);
      tooltips[i].style.transitionDelay = '0 !important';
      tooltips[i].style.opacity = 0;
      // Mark tooltips for removal by this class (so others cleanups won't find it)
      tooltips[i].className = 'mc-tooltip-pending-removal'; // TODO: see if this screws up styles because it's removing the mc-tooltip class
    }

    setTimeout(function() {
      while (removeMe = purging.pop()) {
        removeMe.parentNode.removeChild(removeMe);
      }
    }, removeDelay);
  };



  //TODO: probably use import to get windowSize from utils.js
  // Duplicate of mc.utils.windowSize, here so there are no outside dependencies
  function getWindowSize() {
    // Sane defaults
    var size = { width: 640, height: 480 };

    // Earlier IE uses Doc.body
    if (document.body && document.body.offsetWidth) {
      size.width  = document.body.offsetWidth;
      size.height = document.body.offsetHeight;
    }

    // IE can use depending on mode it is in
    if (document.compatMode === 'CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth) {
      size.width  = document.documentElement.offsetWidth;
      size.height = document.documentElement.offsetHeight;
    }

    // Most recent browsers use
    if (window.innerWidth && window.innerHeight) {
      size.width  = window.innerWidth;
      size.height = window.innerHeight;
    }

    return size;
  }

})(window, document, mc);
