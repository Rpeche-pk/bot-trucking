const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {simulatingReadWrite} = require("../../helpers/helpers")


const logoutFlow = addKeyword(EVENTS.ACTION,{})
    .addAction(async (ctx, {provider,flowDynamic, state,endFlow}) => {
        try {
            const from = ctx?.from
            const myState = state.getMyState();
            myState[from] = {...myState[from], on: false}
            console.log("BOT APAGADO -> ", myState);
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
            await flowDynamic([{body:"Gracias por usar nuestros servicios, hasta pronto 👋🏽"}]);
            return await endFlow();
        } catch (error) {
            console.error("ERROR FLUJO offFlow", error);
        }
    });

module.exports = {logoutFlow};