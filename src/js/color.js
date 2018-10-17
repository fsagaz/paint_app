"use strict";

export function pick_color(e, x, y, ctx) {
  let color_pressed = document.querySelectorAll('.selected');
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

export function generate_colors(array_colors, default_color) {
  console.log(array_colors);
  for (let i = 0; i < array_colors.length; i++) {
    let divColor = document.createElement('div');

    if (array_colors[i] === default_color) {
      divColor.className = 'circle color_button selected';
    } else {
      divColor.className = 'circle color_button';
    }
    divColor.style.cssText = 'background:' + array_colors[i];
    let attData = divColor.setAttribute('data', array_colors[i]);
    document.getElementById('list_colors').appendChild(divColor);
  }
}
