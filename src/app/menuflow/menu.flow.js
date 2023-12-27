const {addKeyword} = require("@bot-whatsapp/bot");
const {employeeActiveFlow} = require("../optionsflow/employee.flow")
const {logoutFlow} = require("../optionsflow/signout.flow")
const {vehicleActiveFlow,vehicleInactiveFlow} = require("../optionsflow/vehicle.flow")
const {idleReset, idleStop, idleStart} = require("../../utils/idle.util");
const Strategy= require("./strategy/Strategy.class");
let intents = 2;
const menuOptions = addKeyword("/menu", {})
    .addAction(async (ctx, {gotoFlow, globalState}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer);
    })
    .addAnswer([
            "📌Ingrese una opción, por favor:",
            "╠1️⃣ Consultar empleados *activos*",
            "╠2️⃣ Consultar vehiculos *activos*",
            "╠3️⃣ Consultar vehiculos *inactivos*",
            "╠4️⃣ Agregar un nuevo *vehículo*",
            "╠5️⃣ Dar de baja un *vehículo*",
            "╠6️⃣ Agregar registro de *mantenimiento*",
            "╠7️⃣ Eliminar *empleado*",
            "╚8️⃣ *Salir*",
        ], {capture: true, delay: 500, sensitive: true},
        async (ctx, ctxFn) => {
            const state = ctxFn.state.getMyState();
            const jid= ctx?.key?.remoteJid;
            const answer = ctx?.body.trim();
            await ctxFn.extensions.utils.wait(500);
            await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "💯"}});
            if (!ctxFn.extensions.utils.validateNumber(answer)) {
                await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state, ctx});
                intents--;
            }
            const strategy = new Strategy();
            const strategyMethod = strategy[`case${answer}`] || strategy.default();
            await strategyMethod(ctx, ctxFn);
        });


module.exports = {menuOptions};
