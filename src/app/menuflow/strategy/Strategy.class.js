const {idleStop} = require("../../../utils/idle.util");
const {employeeActiveFlow} = require("../../optionsflow/employee.flow");
const {vehicleActiveFlow, vehicleInactiveFlow} = require("../../optionsflow/vehicle.flow");
const GlobalExceptionHandler = require("../../../exceptions/handler/GlobalExceptionHandler.class");

class Strategy {

    async case1(ctx, ctxFn) {
        console.log("1️⃣ Consultar empleados activos")
        idleStop(ctx)
        return ctxFn.gotoFlow(employeeActiveFlow);
    }

    async case2(ctx,ctxFn) {
        idleStop(ctx)
        console.log("2️⃣ Consultar vehiculos activos")
        return ctxFn.gotoFlow(vehicleActiveFlow)
    }

    async case3(ctx,ctxFn) {
        idleStop(ctx);
        console.log("3️⃣ Consultar vehiculos inactivos");
        return ctxFn.gotoFlow(vehicleInactiveFlow);
    }

    async case4(ctx,ctxFn) {
        console.log("4️⃣ Dar de baja un vehículo")
        const jid = ctx?.key?.remoteJid;
        await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
        return ctxFn.endFlow();
    }

    async case5(ctx,ctxFn) {
        console.log("5️⃣ Dar de baja un vehículo")
        const jid = ctx?.key?.remoteJid;
        await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
        return ctxFn.endFlow();
    }

    async case6(ctx,ctxFn) {
        const jid = ctx?.key?.remoteJid;
        await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
        return ctxFn.endFlow();
    }

    async case7(ctx, ctxFn) {
        console.log("8️⃣ Eliminar empleado")
        const jid = ctx?.key?.remoteJid;
        await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
        return ctxFn.endFlow();
    }

    async case8(ctx,ctxFn) {
        console.log("8️⃣ Eliminar empleado")
        const jid = ctx?.key?.remoteJid;
        await ctxFn.provider.vendor.sendMessage(jid, {text: "📌 Aún falta implementar esta funcionalidad"});
        return ctxFn.endFlow();
    }

    default() {
        console.error("Error en menuOptions");
        throw new GlobalExceptionHandler("Opción no válida");
    }
}

module.exports = Strategy;
