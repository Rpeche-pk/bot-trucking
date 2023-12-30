const {idleStop} = require("../../../utils/idle.util");
const {employeeActiveFlow} = require("../../optionsflow/employee.flow");
const {vehicleActiveFlow, vehicleInactiveFlow,vehicleDeleteFlow} = require("../../optionsflow/vehicle.flow");
const {OptionNotValidException} = require("../../../exceptions/handler/GlobalExceptionHandler.class");
const {vehicleCreateFlow} = require("../../optionsflow/createVehicle.flow");
const {employeeCreateFlow} = require("../../optionsflow/createEmployee.flow");
const {logoutFlow} = require("../../optionsflow/signout.flow");
const {uploadImageToServerFlow} = require("../../optionsflow/uploadimage.flow");

class Strategy {

    constructor() {
        if (!Strategy.instance) {
            Strategy.instance = this;
        }
        return Strategy.instance;
    }
    case1 = async (ctx, ctxFn) => {
        console.log("1️⃣ Consultar empleados activos")
        idleStop(ctx)
        return ctxFn.gotoFlow(employeeActiveFlow);
    }

    case2 = async (ctx, ctxFn) => {
        idleStop(ctx)
        console.log("2️⃣ Consultar vehiculos activos")
        return ctxFn.gotoFlow(vehicleActiveFlow)
    }

    case3 = async (ctx, ctxFn) => {
        idleStop(ctx);
        console.log("3️⃣ Consultar vehiculos inactivos");
        return ctxFn.gotoFlow(vehicleInactiveFlow);
    }

    case4 = async (ctx, ctxFn) => {
        console.log("4️⃣ Agregar un nuevo *vehículo*");
        idleStop(ctx);
        return ctxFn.gotoFlow(vehicleCreateFlow);
    }

    case5 = async (ctx, ctxFn) => {
        console.log("5️⃣ Dar de baja un vehículo")
        idleStop(ctx);
        return ctxFn.gotoFlow(vehicleDeleteFlow);
    }

    case6 = async (ctx, ctxFn) => {
        console.log("6️⃣ Crear perfil de empleado")
        idleStop(ctx);
        return ctxFn.gotoFlow(employeeCreateFlow);
    }

    case7 = async (ctx, ctxFn) => {
        console.log("7️⃣ SUBIR IMAGEN AL SERVIDOR")
        idleStop(ctx);
        return ctxFn.gotoFlow(uploadImageToServerFlow);
    }

    case8 = async (ctx, ctxFn)=> {
        console.log("8️⃣ Salir")
        idleStop(ctx)
        return ctxFn.gotoFlow(logoutFlow);
    }

    default= ()=> {
        console.error("Error en menuOptions");
        throw new OptionNotValidException("Opción no válida");
    }
}
const strategy = new Strategy();
//Object.freeze(strategy)
module.exports = strategy;
