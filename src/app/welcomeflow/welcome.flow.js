const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const ENV = require("../../utils/enviroments.js");
const randomGreeting = require("../../utils/HourlyGreeting.js");
const greeting = randomGreeting();
const REGEX_ASESOR = "/#(asesor)$/g";
const REGEX_KEYWORD = "/#(empezar)$/g";
const {simulatingReadWrite} = require("../../helpers/helpers.js");
const {loginFlow} = require("../loginflow/login.flow")
const {wait} = require("../../helpers/helpers.js");

const {URL_IMAGE_BOT} = ENV();

let userPhone = {};
let flag = 2; //intentos

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
        return gotoFlow(startChat);
    } catch (error) {
        console.error("ERROR FLUJO onFlow", error);
    }
});

const startChat = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, {provider, gotoFlow, flowDynamic,state}) => {
        try {
            await simulatingReadWrite(provider, {
                delay1: 500,
                delay2: 1500,
                ctx
            });
            await flowDynamic([
                {
                    body:
                        greeting[Math.floor(Math.random() * greeting.length)] +
                        ` Soy maipevi su asistente de confianza 💁🏽‍♀️, espero poder ayudarle con sus consultas.
                \nDebe hacer login para poder acceder a los servicios de la plataforma. 😿`,
                    media: `${URL_IMAGE_BOT}`,
                },
            ]);
            await state.update(userPhone)
            await wait(600);
            return gotoFlow(loginFlow);
        } catch
            (error) {
            console.error("ERROR FLUJO startChat", error);
        }
    })
;


const welcomeFlow = addKeyword([EVENTS.WELCOME, EVENTS.VOICE_NOTE])
    .addAction(async (ctx, ctxFn) => {
        try {
            const phoneNumber = ctx?.from;
            console.log(`\nRevisando si ${phoneNumber} está encendido...`);

            const status = userPhone[phoneNumber];
            console.log(status);

            if (typeof status === "undefined") {
                //!estado || !estado.encendido
                userPhone[phoneNumber] = {...userPhone[phoneNumber], on: true};
            }
            if (!userPhone[ctx.from].on) {
                console.log("BOT APAGADO desde welcomeFlow -> ", userPhone);
                return ctxFn.endFlow();
            }
            await simulatingReadWrite(ctxFn.provider, {
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
    ).addAction(async (ctx, {provider, fallBack, flowDynamic, endFlow, gotoFlow}) => {
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
                await simulatingReadWrite(provider, {
                    delay1: 500,
                    delay2: 1500,
                    ctx
                });
                await flowDynamic(msgIntents);
                return fallBack();
            } else {
                userPhone[phoneNumber] = {...userPhone[phoneNumber], on: false};
                await simulatingReadWrite(provider, {
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

module.exports = {welcomeFlow, onFlow, offFlow, startChat};
