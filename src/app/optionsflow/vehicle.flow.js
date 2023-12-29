const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const VehicleHttp = require("../../http/vehicle.http")
const VehicleNotFoundException = require("../../exceptions/handler/GlobalExceptionHandler.class");

const vehicleDeleteFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {provider}) => {
        await provider.vendor.readMessages([ctx?.key]);
    })
    .addAnswer("📌Ingrese el *ID* del vehiculo que desea eliminar:"
        , {capture: true, delay: 500, sensitive: true}
        , async (ctx, {extensions, provider, state,gotoFlow, endFlow}) => {
            try {
                const {chooseOption} = require("../optionsflow/option.flow");
                const jid = ctx?.key?.remoteJid;
                const idVehicle = ctx?.body.trim();
                const token = extractToken(ctx, state);
                const instance = new VehicleHttp(token,'DELETE');
                // todo lanza un exception personalizado si no encuentra el vehiculo
                await instance.deleteVehicle(idVehicle);

                await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
                const responseWA = await provider.vendor.sendMessage(jid, {"text": "📌_Vehiculo_ _eliminado_ _con_ _éxito_"});
                await provider.vendor.sendMessage(jid, {react: {key: responseWA?.key, text: "✅"}});
                await extensions.utils.wait(500);
                await gotoFlow(chooseOption);
            } catch (e) {
                console.error("ERROR FLUJO vehicleDeleteFlow", e.message)
                e instanceof VehicleNotFoundException ? await provider.vendor.sendMessage(ctx?.key?.remoteJid, {"text": "‼ "+e.message}) : console.error(e);
                return endFlow();
            }
        });

const vehicleInactiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions, provider, state, gotoFlow}) => {
        const {chooseOption} = require("../optionsflow/option.flow");
        const token =extractToken(ctx, state);
        await extensions.utils.wait(350);
        const instance = new VehicleHttp(token, "INACTIVE");
        await vehicleStatus({
            ctx,
            instance,
            provider,
            extensions
        })
        await gotoFlow(chooseOption);
    });

const vehicleActiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions, provider, state, gotoFlow}) => {
        const {chooseOption} = require("../optionsflow/option.flow")
        const token = extractToken(ctx, state);
        await extensions.utils.wait(450);
        const instance = new VehicleHttp(token, "ACTIVE");
        await vehicleStatus({
            ctx,
            instance,
            provider,
            extensions
        })
        await gotoFlow(chooseOption);
    });


// todo funciones auxiliares para el flujo de vehiculos activos e inactivos (vehicleActiveFlow, vehicleInactiveFlow)
async function vehicleStatus(obj) {
    const {ctx, instance, provider, extensions} = obj;
    let getRandomDelay = (max, min) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    let data= [];
    const flag = instance.getFlag();
    const jid = ctx?.key?.remoteJid;
    const responseApi = await instance.vehicleResponseApi();

    responseApi.forEach((element) => {
        const {brand, model, year, vehicleType, patent, numberChassis} = element;
        const template = `╓ *Detalles* : ${brand} - ${model} - ${year}\n╠ *Vehiculo* : ${vehicleType} \n╠ *Placa* : ${patent}\n╙ *Chasis N°* : ${numberChassis}`;
        data.push(template);
    });
    await extensions.utils.simulatingReadWrite(provider, {delay1: getRandomDelay(800,500), delay2: getRandomDelay(1200,900), ctx});
    await provider.vendor.sendMessage(jid, {text: `📌 _Cantidad de_ _vehiculos_ _${flag}_: ` + "*"+responseApi.length+"*"});
    await extensions.utils.simulatingReadWrite(provider, {delay1: getRandomDelay(950,750), delay2: getRandomDelay(1300,1000), ctx});
    await provider.vendor.sendMessage(jid, {text: data.join("\n\n")});
    await extensions.utils.wait(550);
}
const extractToken = (ctx, state) => {
    const myState = state.getMyState();
    return myState[ctx?.from]?.token;
}
module.exports = {vehicleActiveFlow, vehicleInactiveFlow,vehicleDeleteFlow};