const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const REGEX_MENU = /\/menu/i;
const REGEX_EXIT = /\/salir/i;


const chooseOption = addKeyword(EVENTS.ACTION, {})
    .addAnswer([
        "💁🏽‍♀️ Si desea hacer otra consulta, escriba:",
        "╠*/menu* - Para volver al menú principal",
        "╙*/salir* - Para salir del sistema",
    ], {capture: true, delay: 1000},async (ctx, {fallBack, provider, gotoFlow}) => {
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
                await gotoFlow(menuOptions);
                break;
            case "/salir":
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