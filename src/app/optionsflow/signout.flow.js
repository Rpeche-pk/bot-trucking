const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const REGESX_EXIT= '/#exit/g';
const logoutFlow = addKeyword(REGESX_EXIT,{regex: true})
    .addAction(async (ctx, {extensions,provider,flowDynamic, state,endFlow}) => {
        try {
            const from = ctx?.from;
            const jid= ctx?.key?.remoteJid;
            const myState = state.getMyState();
            await provider.vendor.readMessages([ctx?.key]);
            myState[from] = {...myState[from], on: false}
            console.log("BOT APAGADO desde flujo LogoutFlow-> ", myState);
            await extensions.utils.simulatingWriting(provider, {delay1: 558, delay2: 1000, ctx});
            await flowDynamic([{body:"Gracias por usar nuestros servicios, hasta pronto 👋🏽"}]);
            await extensions.utils.simulatingWriting(provider, {delay1: 559, delay2: 850, ctx});
            await flowDynamic([{body:"👾 @Author @Rpeche-pk"}]);
            await extensions.utils.simulatingWriting(provider, {delay1: 550, delay2: 1100, ctx});
            const baileys = await provider.vendor.sendMessage(jid, {
                text: "https://github.com/Rpeche-pk",
            });
            await extensions.handler.sendMessageWoot(baileys, ctx?.from, ctx?.pushName);
            return endFlow();
        } catch (error) {
            console.error("ERROR FLUJO offFlow", error);
        }
    });

const timeoutFlow= addKeyword(EVENTS.ACTION,{})
    .addAction(async (ctx, {extensions,provider,endFlow}) => {
        try {
            const jid = ctx?.key?.remoteJid;
            await extensions.utils.simulatingWriting(provider, {delay1: 650, delay2: 1000, ctx})
            const baileys= await provider.vendor.sendMessage(jid, {text: "❌ Se ha agotado el tiempo de respuesta ❌"});
            await extensions.handler.sendMessageWoot(baileys, ctx?.from, ctx?.pushName);
            return endFlow();
        } catch (e) {
            console.error("Error en el flujo timeoutFlow", e)
        }
    });
module.exports = {logoutFlow,timeoutFlow};