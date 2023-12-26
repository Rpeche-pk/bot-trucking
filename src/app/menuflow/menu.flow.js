const {addKeyword} = require("@bot-whatsapp/bot");
const {employeeActiveFlow} = require("../optionsflow/employee.flow")
const {logoutFlow} = require("../optionsflow/signout.flow")
const {vehicleActiveFlow,vehicleInactiveFlow} = require("../optionsflow/vehicle.flow")
const {idleReset, idleStop, idleStart} = require("../../utils/idle.util");
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

            switch (answer) {
                case "1":
                    console.log("1️⃣ Consultar empleados activos")
                    idleStop(ctx)
                    await ctxFn.gotoFlow(employeeActiveFlow);
                    break;
                case "2":
                    idleStop(ctx)
                    console.log("2️⃣ Consultar vehiculos activos")
                    await ctxFn.gotoFlow(vehicleActiveFlow)
                    break;
                case "3":
                    idleStop(ctx)
                    console.log("3️⃣ Consultar vehiculos inactivos")
                    await ctxFn.gotoFlow(vehicleInactiveFlow)
                    break;
                case "4":
                    console.log("4️⃣ Dar de baja un vehículo")
                    await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
                    return ctxFn.endFlow();
                case "5":
                    console.log("5️⃣ Dar de baja un vehículo")
                    await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
                    return ctxFn.endFlow();
                case "6":
                    await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
                    return ctxFn.endFlow();
                case "7":
                    console.log("8️⃣ Eliminar empleado")
                    await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
                    return ctxFn.endFlow();
                case "8":
                    console.log("SALIR DEL SISTEMA - ON")
                    await ctxFn.gotoFlow(logoutFlow);
                    break;
                default:
                    console.error("Error en menuOptions");
                    return;
            }
        });


module.exports = {menuOptions};
