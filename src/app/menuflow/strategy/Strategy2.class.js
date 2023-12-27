const {idleStop} = require("../../../utils/idle.util");
const {employeeActiveFlow} = require("../../optionsflow/employee.flow");
const {vehicleActiveFlow, vehicleInactiveFlow} = require("../../optionsflow/vehicle.flow");
const {logoutFlow} = require("../../optionsflow/signout.flow");
const strategies = {
    "1": async (ctx, ctxFn) => {
        console.log("1️⃣ Consultar empleados activos");
        idleStop(ctx);
        await ctxFn.gotoFlow(employeeActiveFlow);
    },
    "2": async (ctx, ctxFn) => {
        idleStop(ctx);
        console.log("2️⃣ Consultar vehiculos activos");
        await ctxFn.gotoFlow(vehicleActiveFlow);
    },
    "3": async (ctx, ctxFn) => {
        idleStop(ctx);
        console.log("3️⃣ Consultar vehiculos inactivos");
        await ctxFn.gotoFlow(vehicleInactiveFlow);
    },
    // ... Define más estrategias para otras opciones del menú
};

// Estrategia por defecto para opciones no manejadas
const defaultStrategy = async (ctx, ctxFn) => {
    console.error("Error en menuOptions");
};

// Estrategia para opción "4"
strategies["4"] = strategies["5"] = strategies["6"] = async (ctx, ctxFn) => {
    console.log("📌 Aún falta implementar esta funcionalidad");
    await ctxFn.provider.vendor.sendMessage(ctx?.key?.remoteJid, { text: "📌 Aún falta implementar esta funcionalidad" });
    return ctxFn.endFlow();
};

// Estrategia para opción "7"
strategies["7"] = async (ctx, ctxFn) => {
    console.log("8️⃣ Eliminar empleado");
    await ctxFn.provider.vendor.sendMessage(ctx?.key?.remoteJid, { text: "📌 Aún falta implementar esta funcionalidad" });
    return ctxFn.endFlow();
};

// Estrategia para opción "8"
strategies["8"] = async (ctx, ctxFn) => {
    console.log("SALIR DEL SISTEMA - ON");
    await ctxFn.gotoFlow(logoutFlow);
};

// Estrategia por defecto para opciones no manejadas
strategies.default = defaultStrategy;