(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mouseDown = mouseDown;
exports.mouseUp = mouseUp;
exports.mouseMove = mouseMove;
exports.saveState = saveState;
exports.undoLast = undoLast;
exports.redoLast = redoLast;
var mouseX = 0;
var mouseY = 0;
var isMouseDown = false;
var redo_list = [];
var undo_list = [];
var lastX = void 0;
var lastY = void 0;
var save_redo = false;

function mouseDown(e, canvas, ctx, brushSize, brushColor) {
  var rect = canvas.getBoundingClientRect();
  var offsetX = rect.left;
  var offsetY = rect.top;

  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);

  ctx.beginPath();
  if (ctx.lineWidth !== brushSize) {
    ctx.lineWidth = brushSize;
  }
  if (ctx.strokeStyle !== brushColor) {
    ctx.strokeStyle = brushColor;
  }
  ctx.moveTo(mouseX, mouseY);
  lastX = mouseX;
  lastY = mouseY;
  isMouseDown = true;
}

function mouseUp(e, canvas, ctx, brushSize, brushColor) {
  var rect = canvas.getBoundingClientRect();
  var offsetX = rect.left;
  var offsetY = rect.top;
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);
  isMouseDown = false;
}

function mouseMove(e, canvas, ctx, brushSize, brushColor) {
  var rect = canvas.getBoundingClientRect();
  var offsetX = rect.left;
  var offsetY = rect.top;
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);
  if (isMouseDown) {
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    lastX = mouseX;
    lastY = mouseY;
  }
}

function saveState(canvas, list, save_redo) {
  if (!save_redo) {
    // emptying redo if save redo is not defined
    redo_list = [];
  }
  (list || undo_list).push(canvas.toDataURL());
}

function restoreState(canvas, ctx, pop_array, push_array) {
  if (pop_array.length) {
    saveState(canvas, push_array, true);
    var restore_state = pop_array.pop();
    var img = new Image(); // Create new img element for store canvas
    img.src = restore_state;
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    };
  }
}

function undoLast(canvas, ctx) {
  restoreState(canvas, ctx, undo_list, redo_list);
}

function redoLast(canvas, ctx) {
  restoreState(canvas, ctx, redo_list, undo_list);
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pick_color = pick_color;
exports.generate_colors = generate_colors;
function pick_color(e, x, y, ctx) {
  var color_pressed = document.querySelectorAll('.selected');
  removeSelected(color_pressed);
  ctx.strokeStyle = e.target.getAttribute('data');
  e.target.classList.add('selected');

  return ctx.strokeStyle;
}

function removeSelected(color_pressed) {
  for (var i = 0; i < color_pressed.length; i++) {
    // Remove the .active class
    color_pressed[i].classList.remove('selected');
  }
}

function generate_colors(array_colors, default_color) {
  console.log(array_colors);
  for (var i = 0; i < array_colors.length; i++) {
    var divColor = document.createElement('div');

    if (array_colors[i] === default_color) {
      divColor.className = 'circle color_button selected';
    } else {
      divColor.className = 'circle color_button';
    }
    divColor.style.cssText = 'background:' + array_colors[i];
    var attData = divColor.setAttribute('data', array_colors[i]);
    document.getElementById('list_colors').appendChild(divColor);
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.erase = erase;
function erase(ctx, w, h) {
    var m = confirm('Do you want to clear?');
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }
}

},{}],4:[function(require,module,exports){
"use strict";

var _actions = require('./actions.js');

var _color = require('./color.js');

var _erase = require('./erase.js');

var _stroke_it = require('./stroke_it.js');

//change stroke


// set colors
//actions for drawing and undo or redo
var canvas = document.getElementById('canvas_paint'); // erase all
// pick color

var ctx = canvas.getContext('2d');
ctx.lineJoin = 'round';
var w = canvas.width;
var h = canvas.height;
var array_colors = ['#f21515', '#f1b315', '#e9f015', '#ff33cc', '#15ef39', '#15a3ef', '#7314ef', '#669900', '#000'];
var default_color = '#000';
var x = void 0;
var y = void 0;

var init = function init() {
  // main function to start the app
  (0, _color.generate_colors)(array_colors, default_color);
  var colors = document.getElementsByClassName('color_button'); //TODO ideally we can set a json file for changing/configure dom elements dinamically
  var clear = document.getElementById('clear');
  var stroke = document.getElementsByClassName("stroke");
  var undo = document.getElementById('undo');
  var redo = document.getElementById('redo');

  if (colors.length !== 0) {
    // adding colors and setting interaction with them
    for (var i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', function (e) {
        if (e.target && e.target.getAttribute('data')) {
          var color = e.target.getAttribute('data');
          (0, _color.pick_color)(e, x, y, ctx);
        }
      });
    }
  } else {
    console.log('something went wrong generating colors');
  }

  for (var _i = 0; _i < stroke.length; _i++) {
    stroke[_i].addEventListener('click', function (e) {
      if (e.target && e.target.id) {
        //allways check target event for avoiding undefined errors
        (0, _stroke_it.stroke_it)(e, ctx, y);
      }
    });
  }

  clear.addEventListener('click', function (e) {
    if (e.target && e.target.id) {
      (0, _erase.erase)(ctx, w, h);
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    if (e.target && e.target.id) {
      (0, _actions.mouseMove)(e, canvas, ctx, ctx.lineWidth, ctx.strokeStyle);
    }
  });
  canvas.addEventListener('mousedown', function (e) {
    if (e.target && e.target.id) {
      (0, _actions.mouseDown)(e, canvas, ctx, ctx.lineWidth, ctx.strokeStyle);
      (0, _actions.saveState)(canvas);
    }
  });
  canvas.addEventListener('mouseup', function (e) {
    if (e.target && e.target.id) {
      (0, _actions.mouseUp)(e, canvas, ctx, ctx.lineWidth, ctx.strokeStyle);
    }
  });

  undo.addEventListener('click', function (e) {
    if (e.target && e.target.id) {
      (0, _actions.undoLast)(canvas, ctx);
    }
  });

  redo.addEventListener('click', function (e) {
    if (e.target && e.target.id) {
      (0, _actions.redoLast)(canvas, ctx);
    }
  });
};

init();

},{"./actions.js":1,"./color.js":2,"./erase.js":3,"./stroke_it.js":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stroke_it = stroke_it;
function stroke_it(obj, ctx, y) {
    y = obj.target.size;
    ctx.lineWidth = y;
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYWN0aW9ucy5qcyIsInNyYy9qcy9jb2xvci5qcyIsInNyYy9qcy9lcmFzZS5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3N0cm9rZV9pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7OztRQVVnQixTLEdBQUEsUztRQXNCQSxPLEdBQUEsTztRQVVBLFMsR0FBQSxTO1FBZUEsUyxHQUFBLFM7UUFxQkEsUSxHQUFBLFE7UUFJQSxRLEdBQUEsUTtBQWpGaEIsSUFBSSxTQUFTLENBQWI7QUFDQSxJQUFJLFNBQVMsQ0FBYjtBQUNBLElBQUksY0FBYyxLQUFsQjtBQUNBLElBQUksWUFBWSxFQUFoQjtBQUNBLElBQUksWUFBWSxFQUFoQjtBQUNBLElBQUksY0FBSjtBQUNBLElBQUksY0FBSjtBQUNBLElBQUksWUFBWSxLQUFoQjs7QUFFTyxTQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsTUFBdEIsRUFBOEIsR0FBOUIsRUFBbUMsU0FBbkMsRUFBOEMsVUFBOUMsRUFBMEQ7QUFDL0QsTUFBSSxPQUFPLE9BQU8scUJBQVAsRUFBWDtBQUNBLE1BQUksVUFBVSxLQUFLLElBQW5CO0FBQ0EsTUFBSSxVQUFVLEtBQUssR0FBbkI7O0FBRUEsV0FBUyxTQUFTLEVBQUUsT0FBRixHQUFZLE9BQXJCLENBQVQ7QUFDQSxXQUFTLFNBQVMsRUFBRSxPQUFGLEdBQVksT0FBckIsQ0FBVDs7QUFFQSxNQUFJLFNBQUo7QUFDQSxNQUFJLElBQUksU0FBSixLQUFrQixTQUF0QixFQUFpQztBQUMvQixRQUFJLFNBQUosR0FBZ0IsU0FBaEI7QUFDRDtBQUNELE1BQUksSUFBSSxXQUFKLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ2xDLFFBQUksV0FBSixHQUFrQixVQUFsQjtBQUNEO0FBQ0QsTUFBSSxNQUFKLENBQVcsTUFBWCxFQUFtQixNQUFuQjtBQUNBLFVBQVEsTUFBUjtB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LENBQVgsRUFBYyxNQUFkLEVBQXNCLEdBQXRCLEVBQTJCLElBQUksU0FBL0IsRUFBeUMsSUFBSSxXQUE3QztBQUNBLDhCQUFVLE1BQVY7QUFDRDtBQUNBLEdBTEQ7QUFNQSxTQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFVBQVMsQ0FBVCxFQUFZO0FBQzdDLFFBQUksRUFBRSxNQUFGLElBQVksRUFBRSxNQUFGLENBQVMsRUFBekIsRUFBNkI7QUFDN0IsNEJBQVMsQ0FBVCxFQUFZLE1BQVosRUFBb0IsR0FBcEIsRUFBeUIsSUFBSSxTQUE3QixFQUF1QyxJQUFJLFdBQTNDO0FBQ0M7QUFDRixHQUpEOztBQU1BLE9BQUssZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsVUFBUyxDQUFULEVBQVk7QUFDekMsUUFBSSxFQUFFLE1BQUYsSUFBWSxFQUFFLE1BQUYsQ0FBUyxFQUF6QixFQUE2QjtBQUMzQiw2QkFBUyxNQUFULEVBQWdCLEdBQWhCO0FBQ0Q7QUFDRixHQUpEOztBQU1BLE9BQUssZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsVUFBUyxDQUFULEVBQVk7QUFDekMsUUFBSSxFQUFFLE1BQUYsSUFBWSxFQUFFLE1BQUYsQ0FBUyxFQUF6QixFQUE2QjtBQUMzQiw2QkFBUyxNQUFULEVBQWlCLEdBQWpCO0FBQ0Q7QUFDRixHQUpEO0FBTUQsQ0FsRUQ7O0FBc0VBOzs7Ozs7OztRQ3pGZ0IsUyxHQUFBLFM7QUFBVCxTQUFTLFNBQVQsQ0FBbUIsR0FBbkIsRUFBdUIsR0FBdkIsRUFBMkIsQ0FBM0IsRUFBOEI7QUFDakMsUUFBRSxJQUFJLE1BQUosQ0FBVyxJQUFiO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLENBQWhCO0FBRUgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcbmxldCBtb3VzZVggPSAwO1xubGV0IG1vdXNlWSA9IDA7XG5sZXQgaXNNb3VzZURvd24gPSBmYWxzZTtcbmxldCByZWRvX2xpc3QgPSBbXTtcbmxldCB1bmRvX2xpc3QgPSBbXTtcbmxldCBsYXN0WDtcbmxldCBsYXN0WTtcbmxldCBzYXZlX3JlZG8gPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1vdXNlRG93bihlLCBjYW52YXMsIGN0eCwgYnJ1c2hTaXplLCBicnVzaENvbG9yKSB7XG4gIGxldCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBsZXQgb2Zmc2V0WCA9IHJlY3QubGVmdDtcbiAgbGV0IG9mZnNldFkgPSByZWN0LnRvcDtcblxuICBtb3VzZVggPSBwYXJzZUludChlLmNsaWVudFggLSBvZmZzZXRYKTtcbiAgbW91c2VZID0gcGFyc2VJbnQoZS5jbGllbnRZIC0gb2Zmc2V0WSk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBpZiAoY3R4LmxpbmVXaWR0aCAhPT0gYnJ1c2hTaXplKSB7XG4gICAgY3R4LmxpbmVXaWR0aCA9IGJydXNoU2l6ZTtcbiAgfVxuICBpZiAoY3R4LnN0cm9rZVN0eWxlICE9PSBicnVzaENvbG9yKSB7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYnJ1c2hDb2xvcjtcbiAgfVxuICBjdHgubW92ZVRvKG1vdXNlWCwgbW91c2VZKTtcbiAgbGFzdFggPSBtb3VzZVg7XG4gIGxhc3RZID0gbW91c2VZO1xuICBpc01vdXNlRG93biA9IHRydWU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdXNlVXAoZSwgY2FudmFzLCBjdHgsIGJydXNoU2l6ZSwgYnJ1c2hDb2xvcikge1xuICBsZXQgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgbGV0IG9mZnNldFggPSByZWN0LmxlZnQ7XG4gIGxldCBvZmZzZXRZID0gcmVjdC50b3A7XG4gIG1vdXNlWCA9IHBhcnNlSW50KGUuY2xpZW50WCAtIG9mZnNldFgpO1xuICBtb3VzZVkgPSBwYXJzZUludChlLmNsaWVudFkgLSBvZmZzZXRZKTtcbiAgaXNNb3VzZURvd24gPSBmYWxzZTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91c2VNb3ZlKGUsIGNhbnZhcywgY3R4LCBicnVzaFNpemUsIGJydXNoQ29sb3IpIHtcbiAgbGV0IHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGxldCBvZmZzZXRYID0gcmVjdC5sZWZ0O1xuICBsZXQgb2Zmc2V0WSA9IHJlY3QudG9wO1xuICBtb3VzZVggPSBwYXJzZUludChlLmNsaWVudFggLSBvZmZzZXRYKTtcbiAgbW91c2VZID0gcGFyc2VJbnQoZS5jbGllbnRZIC0gb2Zmc2V0WSk7XG4gIGlmIChpc01vdXNlRG93bikge1xuICAgIGN0eC5saW5lVG8obW91c2VYLCBtb3VzZVkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBsYXN0WCA9IG1vdXNlWDtcbiAgICBsYXN0WSA9IG1vdXNlWTtcblxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlU3RhdGUoY2FudmFzLCBsaXN0LCBzYXZlX3JlZG8pIHtcbiAgaWYgKCFzYXZlX3JlZG8pIHsvLyBlbXB0eWluZyByZWRvIGlmIHNhdmUgcmVkbyBpcyBub3QgZGVmaW5lZFxuICAgIHJlZG9fbGlzdCA9IFtdO1xuICB9XG4gIChsaXN0IHx8IHVuZG9fbGlzdCkucHVzaChjYW52YXMudG9EYXRhVVJMKCkpO1xufVxuXG5cbmZ1bmN0aW9uIHJlc3RvcmVTdGF0ZShjYW52YXMsIGN0eCwgcG9wX2FycmF5LCBwdXNoX2FycmF5KSB7XG4gIGlmIChwb3BfYXJyYXkubGVuZ3RoKSB7XG4gICAgc2F2ZVN0YXRlKGNhbnZhcywgcHVzaF9hcnJheSwgdHJ1ZSk7XG4gICAgdmFyIHJlc3RvcmVfc3RhdGUgPSBwb3BfYXJyYXkucG9wKCk7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpOyAvLyBDcmVhdGUgbmV3IGltZyBlbGVtZW50IGZvciBzdG9yZSBjYW52YXNcbiAgICBpbWcuc3JjID0gcmVzdG9yZV9zdGF0ZTtcbiAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuZG9MYXN0KGNhbnZhcywgY3R4KSB7XG4gIHJlc3RvcmVTdGF0ZShjYW52YXMsIGN0eCwgdW5kb19saXN0LCByZWRvX2xpc3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkb0xhc3QoY2FudmFzLCBjdHgpIHtcbiAgcmVzdG9yZVN0YXRlKGNhbnZhcywgY3R4LCByZWRvX2xpc3QsIHVuZG9fbGlzdCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tfY29sb3IoZSwgeCwgeSwgY3R4KSB7XG4gIGxldCBjb2xvcl9wcmVzc2VkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdGVkJyk7XG4gIHJlbW92ZVNlbGVjdGVkKGNvbG9yX3ByZXNzZWQpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEnKTtcbiAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcblxuICByZXR1cm4gY3R4LnN0cm9rZVN0eWxlO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZVNlbGVjdGVkKGNvbG9yX3ByZXNzZWQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvcl9wcmVzc2VkLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gUmVtb3ZlIHRoZSAuYWN0aXZlIGNsYXNzXG4gICAgY29sb3JfcHJlc3NlZFtpXS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZV9jb2xvcnMoYXJyYXlfY29sb3JzLCBkZWZhdWx0X2NvbG9yKSB7XG4gIGNvbnNvbGUubG9nKGFycmF5X2NvbG9ycyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlfY29sb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGRpdkNvbG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICBpZiAoYXJyYXlfY29sb3JzW2ldID09PSBkZWZhdWx0X2NvbG9yKSB7XG4gICAgICBkaXZDb2xvci5jbGFzc05hbWUgPSAnY2lyY2xlIGNvbG9yX2J1dHRvbiBzZWxlY3RlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpdkNvbG9yLmNsYXNzTmFtZSA9ICdjaXJjbGUgY29sb3JfYnV0dG9uJztcbiAgICB9XG4gICAgZGl2Q29sb3Iuc3R5bGUuY3NzVGV4dCA9ICdiYWNrZ3JvdW5kOicgKyBhcnJheV9jb2xvcnNbaV07XG4gICAgbGV0IGF0dERhdGEgPSBkaXZDb2xvci5zZXRBdHRyaWJ1dGUoJ2RhdGEnLCBhcnJheV9jb2xvcnNbaV0pO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0X2NvbG9ycycpLmFwcGVuZENoaWxkKGRpdkNvbG9yKTtcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnQgZnVuY3Rpb24gZXJhc2UoY3R4LCB3LCBoKSB7XG4gICAgdmFyIG0gPSBjb25maXJtKCdEbyB5b3Ugd2FudCB0byBjbGVhcj8nKTtcbiAgICBpZiAobSkge1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xuXG4gICAgfVxuXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbmltcG9ydCB7bW91c2VVcCwgbW91c2VEb3duLCBtb3VzZU1vdmUsc2F2ZVN0YXRlLHVuZG9MYXN0LHJlZG9MYXN0fSBmcm9tICcuL2FjdGlvbnMuanMnOyAvL2FjdGlvbnMgZm9yIGRyYXdpbmcgYW5kIHVuZG8gb3IgcmVkb1xuaW1wb3J0IHtwaWNrX2NvbG9yfSBmcm9tICcuL2NvbG9yLmpzJzsgLy8gcGljayBjb2xvclxuaW1wb3J0IHtnZW5lcmF0ZV9jb2xvcnN9IGZyb20gJy4vY29sb3IuanMnOyAvLyBzZXQgY29sb3JzXG5pbXBvcnQge2VyYXNlfSBmcm9tICcuL2VyYXNlLmpzJzsgLy8gZXJhc2UgYWxsXG5pbXBvcnQge3N0cm9rZV9pdH0gZnJvbSAnLi9zdHJva2VfaXQuanMnOyAvL2NoYW5nZSBzdHJva2VcblxuXG5sZXQgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19wYWludCcpO1xubGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuY3R4LmxpbmVKb2luID0gJ3JvdW5kJztcbnZhciB3ID0gY2FudmFzLndpZHRoO1xudmFyIGggPSBjYW52YXMuaGVpZ2h0O1xubGV0IGFycmF5X2NvbG9ycyA9IFsnI2YyMTUxNScsICcjZjFiMzE1JywgJyNlOWYwMTUnLCAnI2ZmMzNjYycsICcjMTVlZjM5JywgJyMxNWEzZWYnLCAnIzczMTRlZicsICcjNjY5OTAwJywgJyMwMDAnXTtcbmxldCBkZWZhdWx0X2NvbG9yID0gJyMwMDAnO1xubGV0IHg7XG5sZXQgeTtcblxuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkgeyAvLyBtYWluIGZ1bmN0aW9uIHRvIHN0YXJ0IHRoZSBhcHBcbiAgZ2VuZXJhdGVfY29sb3JzKGFycmF5X2NvbG9ycywgZGVmYXVsdF9jb2xvcik7XG4gIGxldCBjb2xvcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2xvcl9idXR0b24nKTsgLy9UT0RPIGlkZWFsbHkgd2UgY2FuIHNldCBhIGpzb24gZmlsZSBmb3IgY2hhbmdpbmcvY29uZmlndXJlIGRvbSBlbGVtZW50cyBkaW5hbWljYWxseVxuICBsZXQgY2xlYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXInKTtcbiAgbGV0IHN0cm9rZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzdHJva2VcIik7XG4gIGxldCB1bmRvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VuZG8nKTtcbiAgbGV0IHJlZG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVkbycpO1xuXG4gIGlmIChjb2xvcnMubGVuZ3RoICE9PSAwKSB7Ly8gYWRkaW5nIGNvbG9ycyBhbmQgc2V0dGluZyBpbnRlcmFjdGlvbiB3aXRoIHRoZW1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29sb3JzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhJykpIHtcbiAgICAgICAgICBsZXQgY29sb3IgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEnKTtcbiAgICAgICAgICBwaWNrX2NvbG9yKGUsIHgsIHksIGN0eCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdzb21ldGhpbmcgd2VudCB3cm9uZyBnZW5lcmF0aW5nIGNvbG9ycycpO1xuICB9XG5cblxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3Ryb2tlLmxlbmd0aDsgaSsrKSB7XG4gICAgc3Ryb2tlW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0LmlkKSB7IC8vYWxsd2F5cyBjaGVjayB0YXJnZXQgZXZlbnQgZm9yIGF2b2lkaW5nIHVuZGVmaW5lZCBlcnJvcnNcbiAgICAgICAgc3Ryb2tlX2l0KGUsIGN0eCwgeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQuaWQpIHtcbiAgICAgIGVyYXNlKGN0eCwgdywgaCk7XG4gICAgfVxuICB9KTtcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5pZCkge1xuICAgIG1vdXNlTW92ZSggZSwgY2FudmFzLCBjdHgsIGN0eC5saW5lV2lkdGgsY3R4LnN0cm9rZVN0eWxlICk7XG4gIH1cbiAgfSk7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0LmlkKSB7XG4gICAgbW91c2VEb3duKCBlLCBjYW52YXMsIGN0eCwgY3R4LmxpbmVXaWR0aCxjdHguc3Ryb2tlU3R5bGUgKTtcbiAgICBzYXZlU3RhdGUoY2FudmFzKTtcbiAgfVxuICB9KTtcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0LmlkKSB7XG4gICAgbW91c2VVcCggZSwgY2FudmFzLCBjdHgsIGN0eC5saW5lV2lkdGgsY3R4LnN0cm9rZVN0eWxlICk7XG4gICAgfVxuICB9KTtcblxuICB1bmRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5pZCkge1xuICAgICAgdW5kb0xhc3QoY2FudmFzLGN0eCk7XG4gICAgfVxuICB9KTtcblxuICByZWRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5pZCkge1xuICAgICAgcmVkb0xhc3QoY2FudmFzLCBjdHgpO1xuICAgIH1cbiAgfSk7XG5cbn07XG5cblxuXG5pbml0KCk7XG4iLCJleHBvcnQgZnVuY3Rpb24gc3Ryb2tlX2l0KG9iaixjdHgseSkge1xuICAgIHk9b2JqLnRhcmdldC5zaXplO1xuICAgIGN0eC5saW5lV2lkdGggPSB5O1xuXG59XG4iXX0=
