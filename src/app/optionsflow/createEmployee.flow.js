const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {idleStart, idleReset, idleStop} = require("../../utils/idle.util");
const {uploadToServerImage} = require("../../utils/uploadImages");
const {employeeCreateHttp} = require("../../http/user.http");
const {NotFoundDataException} = require("../../exceptions/handler/GlobalExceptionHandler.class");
const {chooseOption} = require("./option.flow");
let intents = 2;

const roleEmployeeFlow = {
    "1": "DRIVER",
    "2": "OWNER",
    "3": "MAINTENANCE"
}

const employeePhotoFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {gotoFlow, globalState}) => {
      idleStart(ctx, gotoFlow, globalState.getMyState().timer);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        let response;
        let myState;
        try {
            idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
            myState = ctxFn.state.getMyState();

            await ctxFn.provider.vendor.readMessages([ctx?.key]);
            if (!ctx?.message?.imageMessage) {
                await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 800, ctx});
                await ctxFn.flowDynamic([{body: "💁🏻‍♀️ Ingrese una foto válida, por favor"}]);
                await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
                intents--;
                return
            }
            //todo resetear intents
            intents = 2;
            response = await uploadToServerImage(ctx, false);
            const token = myState[ctx?.from].token;

            myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, photo: response["url"]}};
            console.log("flujo employeePhotoFlow-> ", myState)

            await employeeCreateHttp(token,myState[ctx?.from].data);

        } catch (e) {
            console.log("ERROR FLUJO employeePhotoFlow que no es un error, salta el error por culpa del servico de email del backend", e.message);
            const {chooseOption} = require("./option.flow");
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1100, ctx});
            await ctxFn.flowDynamic([{body: `✅ Perfíl creado con éxito \n 📷 ${response["url"]}`}]);
            console.log("flujo employeePhotoFlow-> ", myState)
            idleStop(ctx);
            await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1200, ctx});
            return ctxFn.gotoFlow(chooseOption);
        }

    })


//todo crear flujo para crear empleado y subir foto de empleado
const employeeCreateFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {gotoFlow, globalState}) => {
        idleStart(ctx, gotoFlow, globalState.getMyState().timer);
    })
    .addAction(async (ctx, {extensions, provider}) => {
        await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 850, ctx})
        await provider.vendor.sendMessage(ctx?.key?.remoteJid, {text: "📌 _Ingrese los_ _siguientes datos_ _del_ _empleado_:"}, {quoted: ctx});
        await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 800, ctx});
        await provider.vendor.sendMessage(ctx?.key?.remoteJid, {text: "📌 *Nombre del Empleado* : Ejemplo: _María Angela_"});
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
        const body = ctx?.body.trim();
        const myState = ctxFn.state.getMyState();
        const regexName = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\- ]{2,50}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexName.test(body)) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
            intents--;
            return
        }
        //todo resetear intents
        intents = 2;
        myState[ctx?.from] = {...myState[ctx?.from], data: {name: body}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1100, ctx});
        return ctxFn.flowDynamic([{body: "📌 *Apellido del Empleado* : Ejemplo: Afinskaya"}])
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
        const body = ctx?.body.trim();
        const myState = ctxFn.state.getMyState();
        const regexLastName = new RegExp(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\- ]{2,50}$|^$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexLastName.test(body)) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
            intents--;
            return
        }
        //todo resetear intents
        intents = 2;
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, lastName: body}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1000, ctx});
        return ctxFn.flowDynamic([{body: "📌 *Correo Electrónico del Empleado* : Ejemplo: example@domain.com"}]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
        const body = ctx?.body.trim();
        const myState = ctxFn.state.getMyState();
        const regexEmail = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexEmail.test(body)) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
            intents--;
            return
        }
        //todo resetear intents
        intents = 2;
        myState[ctx?.from] = {...myState[ctx?.from], data: {...myState[ctx?.from].data, email: body}};
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 500, delay2: 1000, ctx});
        return ctxFn.flowDynamic([{body: "📌 Escoge el *rol* del empleado: \n╠1️⃣ *Chofer*\n╠2️⃣ *Gerente*\n╚3️⃣ *Jefe de Mantenimiento*"}]);
    })
    .addAction({capture: true}, async (ctx, ctxFn) => {
        idleReset(ctx, ctxFn.gotoFlow, ctxFn.globalState.getMyState().timer);
        const body = ctx?.body.trim();
        const myState = ctxFn.state.getMyState();
        const regexRole = new RegExp(/^[1-3]$/);
        await ctxFn.provider.vendor.readMessages([ctx?.key]);
        if (!regexRole.test(body)) {
            await ctxFn.extensions.utils.tryAgain(intents, ctxFn, {ctx});
            intents--;
            return
        }
        //todo resetear intents
        intents = 2;
        myState[ctx?.from] = {
            ...myState[ctx?.from],
            data: {...myState[ctx?.from].data, roleName: roleEmployeeFlow[body]}
        };
        await ctxFn.extensions.utils.simulatingWriting(ctxFn.provider, {delay1: 600, delay2: 1100, ctx});
        await ctxFn.flowDynamic([{body: "📷 *Suba una foto del empleado(a)*"}]);
        idleStop(ctx)
        return ctxFn.gotoFlow(employeePhotoFlow);
    })


module.exports = {employeeCreateFlow, employeePhotoFlow};