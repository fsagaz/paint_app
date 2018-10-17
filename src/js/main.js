"use strict";
import {mouseUp, mouseDown, mouseMove,saveState,undoLast,redoLast} from './actions.js'; //actions for drawing and undo or redo
import {pick_color} from './color.js'; // pick color
import {generate_colors} from './color.js'; // set colors
import {erase} from './erase.js'; // erase all
import {stroke_it} from './stroke_it.js'; //change stroke


let canvas = document.getElementById('canvas_paint');
let ctx = canvas.getContext('2d');
ctx.lineJoin = 'round';
var w = canvas.width;
var h = canvas.height;
let array_colors = ['#f21515', '#f1b315', '#e9f015', '#ff33cc', '#15ef39', '#15a3ef', '#7314ef', '#669900', '#000'];
let default_color = '#000';
let x;
let y;


var init = function() { // main function to start the app
  generate_colors(array_colors, default_color);
  let colors = document.getElementsByClassName('color_button'); //TODO ideally we can set a json file for changing/configure dom elements dinamically
  let clear = document.getElementById('clear');
  let stroke = document.getElementsByClassName("stroke");
  let undo = document.getElementById('undo');
  let redo = document.getElementById('redo');

  if (colors.length !== 0) {// adding colors and setting interaction with them
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', function(e) {
        if (e.target && e.target.getAttribute('data')) {
          let color = e.target.getAttribute('data');
          pick_color(e, x, y, ctx);
        }
      })
    }
  } else {
    console.log('something went wrong generating colors');
  }



  for (let i = 0; i < stroke.length; i++) {
    stroke[i].addEventListener('click', function(e) {
      if (e.target && e.target.id) { //allways check target event for avoiding undefined errors
        stroke_it(e, ctx, y);
      }
    });
  }

  clear.addEventListener('click', function(e) {
    if (e.target && e.target.id) {
      erase(ctx, w, h);
    }
  });

  canvas.addEventListener('mousemove', function(e) {
    if (e.target && e.target.id) {
    mouseMove( e, canvas, ctx, ctx.lineWidth,ctx.strokeStyle );
  }
  });
  canvas.addEventListener('mousedown', function(e) {
    if (e.target && e.target.id) {
    mouseDown( e, canvas, ctx, ctx.lineWidth,ctx.strokeStyle );
    saveState(canvas);
  }
  });
  canvas.addEventListener('mouseup', function(e) {
    if (e.target && e.target.id) {
    mouseUp( e, canvas, ctx, ctx.lineWidth,ctx.strokeStyle );
    }
  });

  undo.addEventListener('click', function(e) {
    if (e.target && e.target.id) {
      undoLast(canvas,ctx);
    }
  });

  redo.addEventListener('click', function(e) {
    if (e.target && e.target.id) {
      redoLast(canvas, ctx);
    }
  });

};



init();
