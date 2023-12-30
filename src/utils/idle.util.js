const {timeoutFlow} = require("../app/optionsflow/signout.flow");
let timers = {};

function idleStart(ctx, gotoFlow, time) {
    console.log(`INICIAMOS cuenta atrás para el usuario ${ctx.from}!`);
    timers[ctx.from] = setTimeout(() => {
        console.log(`¡Tiempo agotado para el usuario ${ctx.from}!`);
        return gotoFlow(timeoutFlow);
    }, time);
}

function idleReset(ctx, gotoFlow, time) {

    if (timers[ctx.from]) {
        console.log(`REINICIAMOS cuenta atrás para el usuario ${ctx.from}!`);
        clearTimeout(timers[ctx.from]);
    }
    idleStart(ctx, gotoFlow, time);
}

function idleStop(ctx) {
    console.log(`DETENEMOS cuenta atrás para el usuario ${ctx.from}!`);
    if (timers[ctx.from]) clearTimeout(timers[ctx.from]);
}

module.exports = {idleStart, idleStop,idleReset};
