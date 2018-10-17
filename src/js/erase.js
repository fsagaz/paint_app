"use strict";
export function erase(ctx, w, h) {
    var m = confirm('Do you want to clear?');
    if (m) {
        ctx.clearRect(0, 0, w, h);

    }

}
