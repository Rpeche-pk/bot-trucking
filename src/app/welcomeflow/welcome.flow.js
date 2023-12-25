const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const ENV = require("../../utils/enviroments.js");
const randomGreeting = require("../../utils/HourlyGreeting.js");
const {jwtDecode} = require("jwt-decode");
const greeting = randomGreeting();
const {loginFlow} = require("../loginflow/login.flow")
const {menuOptions} = require("../menuflow/menu.flow");


const {URL_IMAGE_BOT} = ENV();
const REGEX_ASESOR = "/#(asesor)$/g";
const REGEX_KEYWORD = "/#(empezar)$/g";

let userPhone = {};
let flag = 2; //intentos

//2° Dependiedo lo que escriba el usuario dentro de las palabras claves se ejecuta un flujo (#empezar o #asesor)
const offFlow = addKeyword(REGEX_ASESOR, {regex: true}).addAction(async (ctx, {flowDynamic, state}) => {
    try {
        userPhone[ctx.from] = {...userPhone[ctx.from], on: false}; //encendido true que viene a ser false xddd
        await state.update(userPhone);
        console.log("BOT APAGADO -> ", userPhone);
        await flowDynamic("En unos instantes el asesor se comunicará con usted...");
    } catch (error) {
        console.error("ERROR FLUJO offFlow", error);
    }
});

const onFlow = addKeyword(REGEX_KEYWORD, {regex: true}).addAction(async (ctx, {gotoFlow, state}) => {
    try {
        userPhone[ctx.from] = {...userPhone[ctx.from], on: true};
        await state.update(userPhone);
        console.log("BOT ENCENDIDO-> ", userPhone);
        return gotoFlow(verifyToken);
    } catch (error) {
        console.error("ERROR FLUJO onFlow", error);
    }
});


//3° Si el usuario ya está registrado se ejecuta este flujo para verificar si el token ha expirado o no y si no ha expirado se guarda en el estado del usuario
const verifyToken = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions, provider, gotoFlow, flowDynamic, state}) => {
        const fileUser = `src/app/data/${ctx?.from}.json`;
        const myState = state.getMyState();
        //VERIFICAMOS SI EL USUARIO YA ESTA REGISTRADO EN EL JSON DE USUARIOS Y SI EXISTE EL ARCHIVO JSON DE USUARIOS EN EL SISTEMA DE ARCHIVOS
        await extensions.utils.existsFile(ctx, fileUser);

        const data = await extensions.utils.readFile(fileUser);

        console.log("DATA", data)

        const token = data[ctx.from]?.token;
        console.log("TOKEN", token)

        if (!token) {
            await flowDynamic([{body: "😿 no se encuentra *registrado* *ingrese* a -> https://s12-14-t-java-react.vercel.app/ y luego *rellene* *los campos*"}]);
            return gotoFlow(startChat);
        }
        if (expiredToken(token)) {
            await flowDynamic([{body: "Oops 😿, su sesión ha expirado, por favor vuelva a iniciar sesión."}]);
            return gotoFlow(startChat);
        }
        await extensions.utils.simulatingReadWrite(provider, {delay1: 500, delay2: 600, ctx});
        await provider.vendor.sendMessage(ctx.key.remoteJid, {
            image: {url: "https://ik.imagekit.io/ljpa/zephyr-cygnus/imgBot/women.jpg"}, caption: "📌 Bienvenido de nuevo, ¿En qué puedo ayudarte?",
            mimetype: "image/jpeg",
        });
        //EL TOKEN QUE ESTA GUARDADO EN EL JSON Y NO HA EXPIRADO SE GUARDA EN EL ESTADO DEL USUARIO PARA PODER USARLO EN OTROS FLUJOS
        myState[ctx.from] = {...myState[ctx.from], token: token};
        return gotoFlow(menuOptions);
    });

//4° Si el usuario no está registrado se ejecuta este flujo
const startChat = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions, provider, gotoFlow, flowDynamic, state}) => {
        try {
            const randomImage = randomImages();
            await extensions.utils.simulatingReadWrite(provider, {
                delay1: 500,
                delay2: 1500,
                ctx
            });
            await flowDynamic([
                {
                    body:
                        greeting[Math.floor(Math.random() * greeting.length)] +
                        ` Soy maipevi su asistente de confianza 💁🏽‍♀️, espero poder ayudarle con sus consultas.
                \nDebe hacer login para poder acceder a los servicios de la plataforma. 😿 Si no se encuentra *registrado* *ingrese* a -> https://s12-14-t-java-react.vercel.app/`,
                    media: `${randomImage}`,
                },
            ]);
            await state.update(userPhone)
            await extensions.utils.wait(600);
            return gotoFlow(loginFlow);
        } catch
            (error) {
            console.error("ERROR FLUJO startChat", error);
        }
    });

//1° primero se ejcuta este flujo al escribir cualquier cosa
const welcomeFlow = addKeyword([EVENTS.WELCOME, EVENTS.VOICE_NOTE], {})
    .addAction(async (ctx, ctxFn) => {
        try {
            const phoneNumber = ctx?.from;
            console.log(`\nRevisando si ${phoneNumber} está encendido...`);

            const status = userPhone[phoneNumber];

            console.log("Estado del telefono ", phoneNumber, status);

            /*if (!Object.prototype.hasOwnProperty.call(userPhone, 'on')){
                console.log("Añadiendo propiedad on ,welcomeFlow, no existe la propiedad on -> ", userPhone);
                userPhone[phoneNumber] = {...userPhone[phoneNumber], on: true};
            }*/

            if (typeof status === "undefined") {
                //!estado || !estado.encendido
                userPhone[phoneNumber] = {...userPhone[phoneNumber], on: true};
                await ctxFn.state.update(userPhone);
                console.log(userPhone)
            }

            if (!userPhone[phoneNumber].on) {
                console.log("BOT APAGADO desde welcomeFlow -> ", userPhone);
                return ctxFn.endFlow();
            }
            await ctxFn.extensions.utils.simulatingReadWrite(ctxFn.provider, {
                delay1: 500,
                delay2: 1000,
                ctx
            });
        } catch (error) {
            console.error("ERROR FLUJO welcomeFlow", error);
        }
    })
    .addAnswer(
        "💬 _Escribe_ *#empezar* _para_ _iniciar_ _la_ _conversación_ _dentro_ _del_ _sistema_ _trucking_ _o_ *#asesor* _para_ _escribirle_ _a_ _un_ _humano_",
        {delay: 500, capture: true}
    ).addAction(async (ctx, {extensions, state, provider, fallBack, flowDynamic, endFlow, gotoFlow}) => {
        const answer = ctx?.body.trim();
        const phoneNumber = ctx?.from;
        const id = ctx?.key?.remoteJid
        console.log("intentos", flag);
        try {
            if (answer.includes("#asesor") || answer.includes("#empezar")) {
                switch (answer) {
                    case "#asesor":
                        return gotoFlow(offFlow);
                    case "#empezar":
                        return gotoFlow(onFlow);
                    default:
                        break;
                }
            }
            if (flag > 0) {
                let msgIntents = flag === 1 ? "Tienes 1 intento." : `Tienes ${flag} intentos.`;
                flag--;
                await extensions.utils.simulatingReadWrite(provider, {
                    delay1: 500,
                    delay2: 1500,
                    ctx
                });
                await flowDynamic(msgIntents);
                return fallBack();
            } else {
                userPhone[phoneNumber] = {...userPhone[phoneNumber], on: false};
                await state.update(userPhone);
                await extensions.utils.simulatingReadWrite(provider, {
                    delay1: 500,
                    delay2: 1000,
                    ctx
                });
                await provider.vendor.sendMessage(id, {text: "❌ Su solicitud ha sido cancelada ❌ , escriba #empezar"}, {quoted: ctx});
                return endFlow();
            }
        } catch (error) {
            console.error("ERROR FLUJO welcomeFlow", error)
        }

    });

function randomImages() {
    return URL_IMAGE_BOT[Math.floor(Math.random() * URL_IMAGE_BOT.length)];
}

function expiredToken(token) {
    const decoded = jwtDecode(token);
    const now = new Date();
    console.log("Fecha actual: ", now.getTime() / 1000);
    console.log("Fecha expiración: ", decoded.exp);
    return decoded.exp < now.getTime() / 1000;
}

module.exports = {welcomeFlow, onFlow, offFlow, startChat, verifyToken};
