const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {idleStart, idleStop, idleReset} = require("../../utils/idle.util");
const REGEX_MENU = /\/menu/i;
const REGEX_EXIT = /\/salir/i;

const chooseOption = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {gotoFlow, globalState}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer);
    })
    .addAnswer([
        "💁🏽‍♀️ Si desea hacer otra consulta, escriba:",
        "╠/*menu* - Para volver al menú principal",
        "╙/*salir* - Para salir del sistema",
    ], {capture: true, delay: 1000},async (ctx, {fallBack, provider,globalState, gotoFlow}) => {
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
                await gotoFlow(menuOptions);
                break;
            case "/salir":
                idleStop(ctx)
                console.log("/salir")
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