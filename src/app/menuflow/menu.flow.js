const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {validateNumber, tryAgain} = require("../../helpers/helpers")
const {employeeActiveFlow} = require("../optionsflow/employee.flow")
let intents = 2;
const menuOptions = addKeyword(EVENTS.ACTION, {})
    .addAnswer([
            "📌Ingrese una opción, por favor:",
            "╠1️⃣ Consultar empleados *activos*",
            "╠2️⃣ Consultar vehiculos *activos*",
            "╠3️⃣ Consultar vehiculos *inactivos*",
            "╠4️⃣ Agregar un nuevo *vehículo*",
            "╠5️⃣ Dar de baja un *vehículo*",
            "╠6️⃣ Agregar registro de *mantenimiento*",
            "╠7️⃣ Otras *consultas*",
            "╚8️⃣ Eliminar *empleado*",
        ], {capture: true, delay: 1100, sensitive: true},
        async (ctx, ctxFn) => {
            const state = ctxFn.state.getMyState();
            const answer = ctx?.body.trim();
            if (!validateNumber(answer)) {
                await tryAgain(intents, ctxFn, {state, ctx});
                intents--;
            }
            switch (answer) {
                case "1":
                    console.log("1️⃣ Consultar empleados activos")
                    await ctxFn.gotoFlow(employeeActiveFlow);
                    break;
                case "2":
                    console.log("2️⃣ Consultar vehiculos activos")
                    break;
                case "3":
                    console.log("3️⃣ Consultar vehiculos inactivos")
                    break;
                case "4":
                    console.log("4️⃣ Dar de baja un vehículo")
                    break;
                case "5":
                    console.log("5️⃣ Dar de baja un vehículo")
                    break;
                case "6":
                    console.log("6️⃣ Agregar registro de mantenimiento")
                    break;
                case "7":
                    console.log("7️⃣ Otras consultas")
                    break;
                case "8":
                    console.log("8️⃣ Eliminar empleado")
                    break;
                default:
            }
        });


module.exports = {menuOptions};
