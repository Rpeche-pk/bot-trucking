/**
 * funcion para generar un pequeño delay dado el tiempo en ms
 * @param ms {number}
 * @returns {Promise<unknown>}
 */
const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

/**
 * funcion para simular la lectura y escritura de un mensaje
 * @param provider {BaileysProvider}
 * @param options {{delay1: number, delay2: number, ctx: {key: {remoteJid: string}}}}
 * @returns {Promise<void>}
 */
const simulatingReadWrite = async (provider, options) => {
    const {delay1, delay2, ctx} = options;
    const $id = ctx?.key?.remoteJid;
    const $key = ctx?.key;
    // view message
    await provider.vendor.readMessages([$key]);
    await provider.vendor.presenceSubscribe($id);
    await wait(delay1);
    // simulare writing
    await provider.vendor.sendPresenceUpdate("composing", $id);
    await wait(delay2);
    await provider.vendor.sendPresenceUpdate("paused", $id);
}

const simulatingWriting = async (provider, options) => {
    const {delay1, delay2, ctx} = options;
    const $id = ctx?.key?.remoteJid;
    await provider.vendor.presenceSubscribe($id);
    await wait(delay1);
    // simulare writing
    await provider.vendor.sendPresenceUpdate("composing", $id);
    await wait(delay2);
    await provider.vendor.sendPresenceUpdate("paused", $id);
}
const formatMoney = (number) => {
    return number.toLocaleString("es-PE",
        {
            style: "currency",
            currency: "PEN"
        });
}

const validateEmail = (email) => {
    const re = /^([a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*)@([a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*[.][a-zA-Z]{2,})$/;
    return re.test(email);
}

const regexPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*+\/?@[\\\]^_{|}]).{8,}$/;
    return re.test(password);
}

const validateNumber = (input) => {
    const regex = /^[1-9]$|^10$/;
    return regex.test(input);
};

const formatDateToMs = (date) => {
    // Configura la zona horaria para Lima, Perú (UTC-5)
    const opciones = { timeZone: 'America/Lima', hour12: false, hourCycle: 'h23' };
    // Usa Intl.DateTimeFormat para formatear la fecha y hora
    const formatDate = new Intl.DateTimeFormat('es-PE', opciones);
    return formatDate.format(date);
    // return date.toLocaleString("es-PE",
    //     {
    //         timeZone: 'America/Lima'
    //     });
}

const tryAgain = async (intents,ctxFn,options) => {
    const {ctx,state} = options;

    if (intents > 0) {
        let msgIntents = intents === 1 ? "Tienes 1 intento." : `Tienes ${intents} intentos.`;
        await simulatingReadWrite(ctxFn.provider, {
            delay1: 500,
            delay2: 1300,
            ctx
        });
        return ctxFn.fallBack({body: msgIntents});
    } else {
        state[ctx?.from] = {...state[ctx?.from], on: false};
        await simulatingReadWrite(ctxFn.provider, {
            delay1: 500,
            delay2: 1200,
            ctx
        });
        await ctxFn.provider.vendor.sendMessage(ctx?.key?.remoteJid, {text: "❌ Su solicitud ha sido cancelada ❌ , escriba #empezar"}, {quoted: ctx});
        return ctxFn.endFlow();
    }
}
const getRandomDelay = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
    formatDateToMs,
    formatMoney,
    regexPassword,
    simulatingReadWrite,
    simulatingWriting,
    tryAgain,
    validateEmail,
    validateNumber,
    wait
};
