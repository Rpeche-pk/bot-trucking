const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {idleStart, idleStop, idleReset} = require("../../utils/idle.util");
const REGEX_MENU = /\/menu/i;
const REGEX_EXIT = /\/salir/i;

const chooseOption = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions,provider, gotoFlow, globalState}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer);
        //await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 800, ctx})
    })
    .addAnswer([
        "💁🏽‍♀️ Si desea hacer otra consulta, escriba:",
        "╠ Escriba /menu ,para volver al menú principal",
        "╙ Escriba /salir ,para salir del sistema",
    ], {capture: true, delay: 1000},async (ctx, {extensions,fallBack, provider,globalState, gotoFlow}) => {
        idleReset(ctx, gotoFlow,globalState.getMyState().timer);
        const {menuOptions} = require("../menuflow/menu.flow")
        const {logoutFlow} = require("../optionsflow/signout.flow")
        const key = ctx?.key;
        await provider.vendor.readMessages([key]);
        const option = ctx?.body.trim();
        if (!validateRegex(option)) {
            return fallBack({body:"💢 Ingrese una opción válida."})
        }

        switch (option) {
            case "/menu":
                console.log("Escribió /menu")
                idleStop(ctx)
                await extensions.utils.simulatingWriting(provider, {delay1: 650, delay2: 1000, ctx})
                await gotoFlow(menuOptions);
                break;
            case "/salir":
                console.log("/salir")
                idleStop(ctx)
                await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 900, ctx})
                await gotoFlow(logoutFlow);
                break;
            default:
                console.error("Error en chooseOption");
                return;
        }
    });
const validateRegex=(option)=>{
    return REGEX_MENU.test(option) || REGEX_EXIT.test(option)
}
module.exports = {
    chooseOption
};