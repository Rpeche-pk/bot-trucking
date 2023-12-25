const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");

const logoutFlow = addKeyword(EVENTS.ACTION,{})
    .addAction(async (ctx, {extensions,provider,flowDynamic, state,endFlow}) => {
        try {
            const from = ctx?.from
            const jid= ctx?.key?.remoteJid
            const myState = state.getMyState();
            myState[from] = {...myState[from], on: false}
            console.log("BOT APAGADO desde flujo LogoutFlow-> ", myState);
            await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1200, ctx});
            await flowDynamic([{body:"Gracias por usar nuestros servicios, hasta pronto 👋🏽"}]);
            await flowDynamic([{body:"👾 @Author @Rpeche-pk"}]);
            await provider.vendor.sendMessage(jid, {
                text: "https://github.com/Rpeche-pk",
            });
            return endFlow();
        } catch (error) {
            console.error("ERROR FLUJO offFlow", error);
        }
    });

module.exports = {logoutFlow};