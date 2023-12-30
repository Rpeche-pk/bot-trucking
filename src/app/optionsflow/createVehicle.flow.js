const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const VehicleHttp = require("../../http/vehicle.http")
const {idleStart, idleReset, idleStop} = require("../../utils/idle.util");

let intents = 5;
let intents2 = 3;
const data = {
    1: "Camioneta",
    2: "Camión",
    3: "Automóvil",
    4: "Combi",
    5: "Acoplado",
    6: "Semiremolque"
};
const fuelType = {
    1: "Gasoil(Gasolina)",
    2: "Diesel",
    3: "Gas",
    4: "Gas licuado de petróleo",
    5: "Gas natural vehicular"
}

const vehicleValidateDataFlow = addKeyword(EVENTS.ACTION, {})
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        const myState = ctxFn.state.getMyState();
        const data = myState[ctx?.from]?.data;
        const answer = ctx?.body.trim();
        const validOption = answer >= 1 && answer <= 2;
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!ctxFn.extensions.utils.validateNumber(answer) && !validOption) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state: myState, ctx});
            intents--;
            return
        }
        const token = myState[ctx?.from]?.token;

        if (answer === "2") {
            return ctxFn.gotoFlow(vehicleCreateFlow);
        }
        const {chooseOption} = require("./option.flow");
        const instance = new VehicleHttp(token, "CREATED");
        await instance.createVehicle(data);
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        await ctxFn.flowDynamic([{body: "⏲ Procesando la información ⏳"}]);
        await ctxFn.extensions.utils.wait(500);
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        await ctxFn.flowDynamic([{body: "📌 _Vehiculo_ _agregado_ _con_ _éxito_"}]);
        idleStop(ctx);
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 720, delay2: 1150, ctx});
        return ctxFn.gotoFlow(chooseOption);
    })


// todo CREATE VEHICLE FLOW
const vehicleCreateFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {globalState,extensions, provider,gotoFlow}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer)
        const jid = ctx?.key?.remoteJid;
        await extensions.utils.simulatingReadWrite(provider, {delay1: 550, delay2: 800, ctx});
        await provider.vendor.sendMessage(jid, {"text": "📌 _Ingrese_ _los_ _siguientes_ _datos_ _del_ _vehiculo_ _que_ _desea_ _agregar_:"});
        await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 800, ctx});
        await provider.vendor.sendMessage(jid, {"text": "📌 *Tipo de vehiculo* Ingrese un número del *1* al *6*:\n" + "╠1️⃣ Camioneta\n╠2️⃣ Camión\n╠3️⃣ Auto\n╠4️⃣ Combi\n╠5️⃣ Acoplado\n╙6️⃣ Semiremolque"});
    })
    .addAction({"capture": true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        const state = ctxFn.state.getMyState();
        //todo validar que sea un numero(cadena guiño guiño)
        const answer = ctx?.body.trim();
        const validOption = answer >= 1 && answer <= 6;
        if (!ctxFn.extensions.utils.validateNumber(answer) && !validOption) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state, ctx});
            intents--;
            return;
        }
        //todo resetear intents
        intents = 5;
        state[ctx?.from] = {...state[ctx?.from], data: {vehicleType: data[answer]}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 800, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese la *marca del vehículo*, *modelo* ,*patente* y *Año* de fabricación del vehículo:\n" + "╘ _Ejemplo_ no olvidé las *comas*: Chevrolet ,Camaro Z28, ABC123, 2015",
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [brand, model, patent, year] = body.map(item => item.trim());
        const regexMarca = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s ]{2,20}$|^$/);
        const regexModel = new RegExp(/^[a-zA-Z0-9 ]{3,15}$|^$/);
        const regexPatent = new RegExp(/^[A-Za-z0-9]{6,7}$|^$/);
        const regexYear = new RegExp(/^\d{4}$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexMarca.test(brand)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 800, ctx});
            await ctxFn.flowDynamic([{body: "💢 Marca; No se permite caracteres especiales, ni números. Mínimo 3 caracteres"}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx, state: myState});
            intents--;
            return
        }
        if (!regexModel.test(model)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 750, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, ingrese correctamente el modelo."}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx, myState});
            intents--;
            return
        }
        if (!regexPatent.test(patent)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 550, delay2: 700, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, la patente debe constar de 6 a 7 caracteres alfanumericos."}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx, myState});
            intents--;
            return
        }
        if (!regexYear.test(year)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 650, ctx});
            await ctxFn.flowDynamic([{body: "💢 Ingrese un año válido. Debe constar de 4 dígitos."}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx, myState});
            intents--;
            return
        }
        //todo resetear intents
        intents = 5;
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, brand, model, patent, year}};
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        console.log("ESTADO DESDE VEHICLE CREATE FLOW", myState)
        return ctxFn.flowDynamic([{
            body: "📌 Tipo de combustible del vehículo:\n" + "╠1️⃣ Gasoil(Gasolina)\n╠2️⃣ Diesel\n╠3️⃣ Gas\n╠4️⃣ Gas licuado de petróleo\n╙5️⃣ Gas natural vehicular",
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        const myState = ctxFn.state.getMyState();
        const answer = ctx?.body.trim();
        const validOption = answer >= 1 && answer <= 5;
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!ctxFn.extensions.utils.validateNumber(answer) && !validOption) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state: myState, ctx});
            intents--;
            return
        }
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, fuelType: fuelType[answer]}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese el *número* o *identificación* del chasis del vehículo seguido de una coma la *marca del chasis*:\n" + "╘ _Ejemplo_ no olvidé las *comas*: 1HGBH41JXMN109186, Scania"
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [numberChassis, brandChassis] = body.map(item => item.trim());
        const regexNumberChassis = new RegExp(/^[a-zA-Z0-9]{17}$|^$/);
        const regexBrandChassis = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s ]{2,20}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexNumberChassis.test(numberChassis)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, el número de chasis debe constar de 17 carácteres alfanuméricos."}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        if (!regexBrandChassis.test(brandChassis)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, ingrese correctamente la marca del chasis."}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        //todo resetear intents
        intents2 = 3;
        myState[ctx?.from] = {
            ...myState[ctx?.from],
            data: {...myState[ctx?.from].data, numberChassis: numberChassis.toUpperCase(), brandChassis}
        };
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese el *número* de motor y la *marca* del motor del vehículo:\n" + "╘ _Ejemplo_ no olvidé las *comas*: UQA12398A, BMW"
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [numberMotor, brandMotor] = body.map(item => item.trim());
        const regexNumberMotor = new RegExp(/^[a-zA-Z0-9]{9}$|^$/);
        const regexBrandMotor = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s ]{2,20}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexNumberMotor.test(numberMotor)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, el número de motor debe constar de 9 caracteres alfanumericos."}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        if (!regexBrandMotor.test(brandMotor)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, ingrese correctamente la marca del motor."}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        //todo resetear intents
        intents2 = 3;
        myState[ctx?.from] = {
            ...myState[ctx?.from],
            data: {...myState[ctx?.from].data, numberMotor: numberMotor.toUpperCase(), brandMotor}
        };
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese la *cantidad de ejes* y la *fecha* de la *Revisión Técnica Vehicular* yyyy-MM-dd:\n" + "╘ _Ejemplo_ no olvidé las *comas*: [*1* - *9*], 1996-09-14"
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer)
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [axle, dateVtv] = body.map(item => item.trim());
        const regexNumberAxis = new RegExp(/^[1-9]{1,2}$|^$/);
        const regexTechnicalReview = new RegExp(/^\d{4}[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexNumberAxis.test(axle)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, la cantidad de ejes debe constar de 1 a 2 caracteres alfanumericos."}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        if (!regexTechnicalReview.test(dateVtv)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 Ingrese una fecha válida. Debe separarlo por -> \"-\" Ejemplo: 2023-05-12"}]);
            await ctxFn.extensions.utils.tryAgain(intents2, ctxFn, {state: myState, ctx});
            intents2--;
            return
        }
        //todo resetear intents
        intents2 = 3;
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, axle, dateVtv}};
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        await ctxFn.flowDynamic([{
            body: "📋 *Descripción del vehiculo*: " + "\n"
                + "╠ _Vehículo_: " + '*' + myState[ctx?.from].data.vehicleType + '*' + "\n"
                + "╠ _Marca del Vehículo_: " + '*' + myState[ctx?.from].data.brand + '*' + "\n"
                + "╠ _Modelo_: " + '*' + myState[ctx?.from].data.model + '*' + "\n"
                + "╠ _Patente_: " + '*' + myState[ctx?.from].data.patent + '*' + "\n"
                + "╠ _Año_: " + '*' + myState[ctx?.from].data.year + '*' + "\n"
                + "╠ _Tipo de gasolina_: " + '*' + myState[ctx?.from].data.fuelType + '*' + "\n"
                + "╠ _Número Chasis_: " + '*' + myState[ctx?.from].data.numberChassis + '*' + "\n"
                + "╠ _Marca del Chasis_: " + '*' + myState[ctx?.from].data.brandChassis + '*' + "\n"
                + "╠ _Número de motor_: " + '*' + myState[ctx?.from].data.numberMotor + '*' + "\n"
                + "╠ _Marca del Motor_: " + '*' + myState[ctx?.from].data.brandMotor + '*' + "\n"
                + "╠ _Número de ejes_: " + '*' + myState[ctx?.from].data.axle + '*' + "\n"
                + "╙ _Fecha Revisión Técnica Vehicular_: " + '*' + myState[ctx?.from].data.dateVtv + '*' + "\n"
                + "¿Son correctos los datos ingresados? Ingrese un número del 1 al 2: \n" + "╠1️⃣ Si\n" + "╙2️⃣ No"
        }]);
        console.log("ESTADO DESDE VEHICLE CREATE FLOW", myState)
        return ctxFn.gotoFlow(vehicleValidateDataFlow);
    });


module.exports = {vehicleCreateFlow, vehicleValidateDataFlow};