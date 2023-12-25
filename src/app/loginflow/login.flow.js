const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {startLogin} = require("../../http/login.http")
const {menuOptions} = require("../menuflow/menu.flow")
const {hashPassword} = require("../../helpers/encryptCredentials")

// Validate info user
const validateInfo = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions,provider, state, gotoFlow}) => {
        const jid = ctx?.key?.remoteJid;
        const idUser= ctx?.from;
        const myState = state.getMyState();
        const {email, password} = myState[ctx?.from];
        const response = await startLogin(email, password);
        const {name, lastName, companyName} = response.user;
        //ENCRIPTAMOS EL PASSWORD POR SEGURIDAD
        const encryptPass= await hashPassword(password)
        myState[ctx?.from] = {...myState[ctx?.from],password:encryptPass,token: response.token};
        //GUARDAMOS EL ESTADO DEL USUARIO EN UN ARCHIVO JSON
        await extensions.utils.writeFile(`src/app/data/${idUser}.json`, myState);
        await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx})
        const responseWA = await provider.vendor.sendMessage(jid, {text: `📌 Bienvenido ${name} ${lastName} de la compañia ${companyName} 🤝🏽`});
        await extensions.utils.wait(500);
        await provider.vendor.sendMessage(jid, {react: {key: responseWA.key, text: "👍🏽"}});
        await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 1100, ctx});
        await extensions.utils.wait(500);
        console.log("ESTADO DESDE VALIDATE INFO", myState)
        await gotoFlow(menuOptions);
    });

const loginFlow = addKeyword(EVENTS.ACTION, {})
    .addAnswer("📌╠ Ingrese su username o email:", {capture: true, delay: 500},
        async (ctx, {extensions,provider, fallBack, state}) => {
            const username = ctx?.body.trim();
            const from = ctx?.from
            const myState = state.getMyState();
            if (!extensions.utils.validateEmail(username)) {
                return fallBack("💢 Ingrese un correo válido. ejm: example@dominio.com")
            }
            myState[from] = {...myState[from], email: username}
            await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx})
        })
    .addAnswer("📌╠ Ingrese su password:", {capture: true},
        async (ctx, {extensions,provider, state, fallBack}) => {
            const password = ctx?.body.trim();
            const jid = ctx?.key?.remoteJid;
            const id = ctx?.key?.id;
            const from = ctx?.from;
            const myState = state.getMyState();
            myState[from] = {...myState[from], password: password}
            await extensions.utils.wait(600);

            if (!extensions.utils.regexPassword(password)) return fallBack("💢 La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial")

            await provider.vendor.chatModify(
                {
                    clear: {
                        messages: [{
                            id: id,
                            fromMe: true,
                            timestamp: new Date(Date.now() + 10 * 1000).getTime()
                        }]
                    },
                    delete: true
                },
                jid
            )
            await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1100, ctx});
            await provider.vendor.sendMessage(jid, {text: "😉 Elimina el mensaje que enviaste, por seguridad 👆🏽"});
            await extensions.utils.wait(1200);
            //provider.vendor.sendMessage(jid, { delete: reponseWA.key })
            //console.log("TIMESTAMP", new Date(Date.now() + 60 * 1000).getTime())
        })
    .addAction(async (ctx, {extensions,provider, gotoFlow}) => {
        const id = ctx?.key?.remoteJid
        try {
            await extensions.utils.wait(500);
            await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 1000, ctx});
            const response = await provider.vendor.sendMessage(id, {text: "⏱ Comprobando Credendiales ⏲"})
            await extensions.utils.wait(1100);
            await provider.vendor.sendMessage(id, {delete: response.key})
            await gotoFlow(validateInfo);
        } catch (e) {
            console.error("ERROR FLUJO loginFlow", e);
        }
    });
module.exports = {loginFlow, validateInfo};