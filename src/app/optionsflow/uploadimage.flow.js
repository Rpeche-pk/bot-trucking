const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {idleStart, idleReset, idleStop} = require("../../utils/idle.util");
const {uploadToServerImage} = require("../../utils/uploadImages");

let intents = 2;
const uploadImageToServerFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, ctxFn) => {
        idleStart(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
    })
    .addAction(async (ctx, ctxFn) => {
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 950, ctx});
        return ctxFn.flowDynamic([{body: "📌 *Con esta funcionalidad puedes subir tu imagen y te devolvera tu link https* : \n\n 📷 *Envíe una imagen*"}]);
    })
    .addAction({capture:true},async (ctx, ctxFn) => {
        const {chooseOption} = require("./option.flow");
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!ctx?.message?.imageMessage) {
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 800, ctx});
            await ctxFn.flowDynamic([{body: "💁🏻‍♀️ Ingrese una imagen válida, por favor"}]);
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
            intents--;
            return
        }
        const response = await uploadToServerImage(ctx,false);
        await ctxFn.extensions.utils.simulatingReadWrite(ctxFn.provider, {delay1: 500, delay2: 1100, ctx});
        await ctxFn.flowDynamic([{body: `✅ Imagen subida con éxito \n 📷 ${response["url"]}`}]);
        idleStop(ctx);
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1200, ctx});
        return ctxFn.gotoFlow(chooseOption);
    });

module.exports = {uploadImageToServerFlow}