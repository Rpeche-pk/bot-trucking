const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {VehicleHttp} = require("../../http/vehicle.http")

const vehicleInactiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions,provider, state, gotoFlow}) => {
        let data = [];
        const {chooseOption} = require("../optionsflow/option.flow")
        const jid = ctx?.key?.remoteJid;
        const myState = state.getMyState();
        const token = myState[ctx?.from]?.token;
        const instance =new VehicleHttp(token,"INACTIVE");
        const response = await instance.vehicleResponseApi();
        response.forEach((element) => {
            const {brand, model, year, vehicleType, patent, numberChassis} = element;
            const template = `╓ *Detalles* : ${brand} - ${model} - ${year}\n╠ *Vehiculo* : ${vehicleType} \n╠ *Placa* : ${patent}\n╙ *Chasis N°* : ${numberChassis}`;
            data.push(template);
        });
        await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
        await provider.vendor.sendMessage(jid, {text: "📌_Cantidad_ _de_ _vehiculos_ _inactivos_: " + response.length});
        await extensions.utils.simulatingReadWrite(provider, {delay1: 550, delay2: 1200, ctx});
        await provider.vendor.sendMessage(jid, {text: data.join("\n\n")});
        await extensions.utils.wait(600);
        await gotoFlow(chooseOption);
    });

const vehicleActiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions,provider, state, gotoFlow}) => {
        let data = [];
        const {chooseOption} = require("../optionsflow/option.flow")
        const jid = ctx?.key?.remoteJid;
        const myState = state.getMyState();
        const token = myState[ctx?.from]?.token;
        await extensions.utils.wait(500);
        const instance =new VehicleHttp(token,"ACTIVE");
        const responseApi = await instance.vehicleResponseApi();
        responseApi.forEach((element) => {
            const {brand, model, year, vehicleType, patent, numberChassis} = element;
            const template = `╓ *Detalles* : ${brand} - ${model} - ${year}\n╠ *Vehiculo* : ${vehicleType} \n╠ *Placa* : ${patent}\n╙ *Chasis N°* : ${numberChassis}`;
            data.push(template);
        });
        await extensions.utils.simulatingReadWrite(provider, {delay1: 600, delay2: 1000, ctx});
        await provider.vendor.sendMessage(jid, {text: "📌_Cantidad_ _de_ _vehiculos_ _activos_: " + responseApi.length});
        await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1300, ctx});
        await provider.vendor.sendMessage(jid, {text: data.join("\n\n")});
        await extensions.utils.wait(700);
        await gotoFlow(chooseOption);
    });

module.exports = {vehicleActiveFlow, vehicleInactiveFlow};