const {addKeyword} = require("@bot-whatsapp/bot");
const {idleStart, idleStop} = require("../../utils/idle.util");
const strategy = require("./strategy/Strategy.class");
const {OptionNotValidException} = require("../../exceptions/handler/GlobalExceptionHandler.class");
let intents = 2;
const menuOptions = addKeyword("/menu", {})
    .addAction(async (ctx, {gotoFlow, globalState}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer);
    })
    .addAnswer([
            "📌Ingrese una opción del *1* al *8*, por favor:",
            "╠1️⃣ Consultar empleados *activos*",
            "╠2️⃣ Consultar vehiculos *activos*",
            "╠3️⃣ Consultar vehiculos *inactivos*",
            "╠4️⃣ Agregar un nuevo *vehículo*",
            "╠5️⃣ Dar de baja un *vehículo*",
            "╠6️⃣ Crear perfil de *empleado*",
            "╠7️⃣ SUBIR *IMAGEN* AL *SERVIDOR*",
            "╚8️⃣ *Salir*",
        ], {capture: true, delay: 500, sensitive: true},
        async (ctx, ctxFn) => {
            try {
                const state = ctxFn.state.getMyState();
                const jid = ctx?.key?.remoteJid;
                const answer = ctx?.body.trim();
                await ctxFn.extensions.utils.wait(500);
                await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "💯"}});
                if (!ctxFn.extensions.utils.validateNumber(answer)) {
                    await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state, ctx});
                    intents--;
                }
                console.log("ESTADO DESDE MENU OPTIONS", state, answer)
                const strategyMethod = strategy[`case${answer}`] || strategy.default();
                await strategyMethod(ctx, ctxFn);
            } catch (e) {
                console.error("ERROR FLUJO menuOptions", e.message,e.timestamp)
                await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1100, ctx});
                e instanceof OptionNotValidException ? await ctxFn.provider.vendor.sendMessage(ctx?.key?.remoteJid, {"text": "‼ "+e.message}) : console.error(e);
                return ctxFn.fallBack();
            }

        });


module.exports = {menuOptions};
