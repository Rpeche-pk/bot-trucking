const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const VehicleHttp = require("../../http/vehicle.http")

let intents = 5;
let intents2 = 3;
const data = {
    1: "Camioneta",
    2: "Camión",
    3: "Auto",
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
const vehicleCreateFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions, provider}) => {
        const jid = ctx?.key?.remoteJid;
        await extensions.utils.simulatingReadWrite(provider, {delay1: 550, delay2: 800, ctx});
        await provider.vendor.sendMessage(jid, {"text": "📌 _Ingrese_ _los_ _siguientes_ _datos_ _del_ _vehiculo_ _que_ _desea_ _agregar_:"});
        await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 800, ctx});
        await provider.vendor.sendMessage(jid, {"text": "📌 *Tipo de vehiculo* Ingrese un número del *1* al *6*:\n" + "╠1️⃣ Camioneta\n╠2️⃣ Camión\n╠3️⃣ Auto\n╠4️⃣ Combi\n╠5️⃣ Acoplado\n╙6️⃣ Semiremolque"});
    })
    .addAction({"capture": true}, async (ctx, ctxFn) => {
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        const state = ctxFn.state.getMyState();
        //todo validar que sea un numero(cadena guiño guiño)
        const answer = ctx?.body.trim();
        const validOption = answer >= 1 && answer <= 6;
        if (!ctxFn.extensions.utils.validateNumber(answer) && !validOption) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {state, ctx});
            intents--;
        }
        state[ctx?.from] = {...state[ctx?.from], data: {vehicleType: data[answer]}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 800, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese la *marca del vehículo*, *modelo* ,*patente* y *Año* de fabricación del vehículo:\n" + "╘ _Ejemplo_ no olvidé las *comas*: Chevrolet ,Camaro Z28, ABC123, 2015",
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
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
            await ctxFn.flowDynamic([{body: "💢 Marca; No se permite caracteres especiales, ni números."}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx, state:myState});
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

        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, brand, model, patent, year}};
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        console.log("ESTADO DESDE VEHICLE CREATE FLOW", myState)
        return ctxFn.flowDynamic([{
            body: "📌 Tipo de combustible del vehículo:\n" + "╠1️⃣ Gasoil(Gasolina)\n╠2️⃣ Diesel\n╠3️⃣ Gas\n╠4️⃣ Gas licuado de petróleo\n╙5️⃣ Gas natural vehicular",
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
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
            body: "📌 Ingrese el *número*, la *marca* de chasis del vehículo:\n" + "╘ _Ejemplo_ no olvidé las *comas*: 123456789, Scania"
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [numberChassis, brandChassis] = body.map(item => item.trim());
        const regexNumberChassis = new RegExp(/^[0-9]{9,17}$|^$/);
        const regexBrandChassis = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s ]{2,20}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexNumberChassis.test(numberChassis)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, el número de chasis debe constar de 9 a 17 caracteres alfanumericos."}]);
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
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, numberChassis, brandChassis}};
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        return ctxFn.flowDynamic([{
            body: "📌 Ingrese el *número* de motor y la *marca* del motor del vehículo:\n" + "╘ _Ejemplo_ no olvidé las *comas*: 123456789, Scania"
        }]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        const jid = ctx?.key?.remoteJid;
        const myState = ctxFn.state.getMyState();
        const body = ctx?.body.trim().split(",");
        let [numberMotor, brandMotor] = body.map(item => item.trim());
        const regexNumberMotor = new RegExp(/^[0-9]{9,17}$|^$/);
        const regexBrandMotor = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\\s ]{2,20}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexNumberMotor.test(numberMotor)) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
            await ctxFn.flowDynamic([{body: "💢 No se permite caracteres especiales, el número de motor debe constar de 9 a 17 caracteres alfanumericos."}]);
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
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, numberMotor, brandMotor}};
        await ctxFn.provider.vendor.sendMessage(jid, {react: {key: ctx?.key, text: "⏱"}});
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 950, ctx});
        console.log("ESTADO DESDE VEHICLE CREATE FLOW", myState)
        return ctxFn.flowDynamic([{
            body: myState[ctx?.from].data + "\n" + "¿Los datos son correctos? *SI*/*NO*"
        }]);
    });


module.exports = {vehicleCreateFlow};