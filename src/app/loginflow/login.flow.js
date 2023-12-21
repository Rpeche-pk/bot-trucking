const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {
    validateEmail,
    wait,
    simulatingReadWrite,
    simulatingWriting,
    regexPassword,
} = require("../../helpers/helpers")
const {startLogin} = require("../../http/login.http")
const {menuOptions} = require("../menuflow/menu.flow")

const validateInfo = addKeyword(EVENTS.ACTION,{})
    .addAction(async (ctx, {provider, state, gotoFlow}) => {
        const jid = ctx?.key?.remoteJid;
        const myState = state.getMyState();
        const {email, password} = myState[ctx?.from];
        const response = await startLogin(email, password);
        const {name, lastName, companyName} = response.user;
        myState[ctx?.from] = {...myState[ctx?.from], token: response.token};
        await simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx})
        const responseWA = await provider.vendor.sendMessage(jid, {text: `📌 Bienvenido ${name} ${lastName} de la compañia ${companyName} 🤝🏽`});
        await wait(500);
        await provider.vendor.sendMessage(jid, {react: {key: responseWA.key, text: "👍🏽"}});
        await simulatingWriting(provider, {delay1: 500, delay2: 1100, ctx});
        await wait(500);
        await gotoFlow(menuOptions);
    });

const loginFlow = addKeyword(EVENTS.ACTION,{})
    .addAnswer("📌╠ Ingrese su username o email:", {capture: true, delay: 500},
        async (ctx, {provider,fallBack, state}) => {
            const username = ctx?.body.trim();
            const from = ctx?.from
            const myState = state.getMyState();
            if (!validateEmail(username)) {
                return fallBack("💢 Ingrese un correo válido. ejm: example@dominio.com")
            }
            myState[from] = {...myState[from], email: username}
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1300, ctx})
        })
    .addAnswer("📌╠ Ingrese su password:", {capture: true},
        async (ctx, {provider, state, fallBack}) => {
            const password = ctx?.body.trim();
            const jid = ctx?.key?.remoteJid;
            const id = ctx?.key?.id;
            const from = ctx?.from;
            const myState = state.getMyState();
            myState[from] = {...myState[from], password: password}
            await wait(1000);

            if (!regexPassword(password)) return fallBack("💢 La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial")

            await provider.vendor.chatModify(
                {
                    clear: {messages: [{id: id, fromMe: true, timestamp: new Date(Date.now() + 10 * 1000).getTime()}]},
                    delete: true
                },
                jid
            )
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
            await provider.vendor.sendMessage(jid, {text: "😉 Elimina el mensaje que enviaste, por seguridad 👆🏽"});
            await wait(1500);
            //provider.vendor.sendMessage(jid, { delete: reponseWA.key })
            //console.log("TIMESTAMP", new Date(Date.now() + 60 * 1000).getTime())
        })
    .addAction(async (ctx, {provider, gotoFlow}) => {
        const id = ctx?.key?.remoteJid
        try {
            await wait(800);
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
            const response = await provider.vendor.sendMessage(id, {text: "⏱ Comprobando Credendiales ⏲"})
            await wait(1500);
            await provider.vendor.sendMessage(id, {delete: response.key})
            await gotoFlow(validateInfo);
        } catch (e) {
            console.error("ERROR FLUJO loginFlow", e);
        }
    });
module.exports = {loginFlow, validateInfo};