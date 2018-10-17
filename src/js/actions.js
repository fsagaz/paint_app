"use strict";
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let redo_list = [];
let undo_list = [];
let lastX;
let lastY;
let save_redo = false;

export function mouseDown(e, canvas, ctx, brushSize, brushColor) {
  let rect = canvas.getBoundingClientRect();
  let offsetX = rect.left;
  let offsetY = rect.top;

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


export function mouseUp(e, canvas, ctx, brushSize, brushColor) {
  let rect = canvas.getBoundingClientRect();
  let offsetX = rect.left;
  let offsetY = rect.top;
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);
  isMouseDown = false;

}

export function mouseMove(e, canvas, ctx, brushSize, brushColor) {
  let rect = canvas.getBoundingClientRect();
  let offsetX = rect.left;
  let offsetY = rect.top;
  mouseX = parseInt(e.clientX - offsetX);
  mouseY = parseInt(e.clientY - offsetY);
  if (isMouseDown) {
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    lastX = mouseX;
    lastY = mouseY;

  }
}

export function saveState(canvas, list, save_redo) {
  if (!save_redo) {// emptying redo if save redo is not defined
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
    img.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    };
  }
}

export function undoLast(canvas, ctx) {
  restoreState(canvas, ctx, undo_list, redo_list);
}

export function redoLast(canvas, ctx) {
  restoreState(canvas, ctx, redo_list, undo_list);
}
