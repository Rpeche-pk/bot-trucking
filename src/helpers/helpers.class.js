const fs = require("fs").promises;

class HelpersClass {
    constructor() {
        if (!HelpersClass.instance) {
            HelpersClass.instance = this;
        }
        return HelpersClass.instance;
    }

    /**
     * funcion para generar un pequeño delay dado el tiempo en ms
     * @param ms {number}
     * @returns {Promise<unknown>}
     */
    wait = (ms) => {
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
    simulatingReadWrite = async (provider, options) => {
        const {delay1, delay2, ctx} = options;
        const $id = ctx?.key?.remoteJid;
        const $key = ctx?.key;
        // view message
        await provider.vendor.readMessages([$key]);
        await provider.vendor.presenceSubscribe($id);
        await this.wait(delay1);
        // simulare writing
        await provider.vendor.sendPresenceUpdate("composing", $id);
        await this.wait(delay2);
        await provider.vendor.sendPresenceUpdate("paused", $id);
    }

    /**
     *
     * @param provider
     * @param options
     * @returns {Promise<void>}
     */
    simulatingWriting = async (provider, options) => {
        const {delay1, delay2, ctx} = options;
        const $id = ctx?.key?.remoteJid
        await provider.vendor.presenceSubscribe($id);
        await this.wait(delay1);
        // simulare writing
        await provider.vendor.sendPresenceUpdate("composing", $id);
        await this.wait(delay2);
        await provider.vendor.sendPresenceUpdate("paused", $id);
    }
    formatMoney = (number) => {
        return number.toLocaleString("es-PE",
            {
                style: "currency",
                currency: "PEN"
            });
    }

    /**
     *
     * @param email
     * @returns {boolean}
     */
    validateEmail = (email) => {
        const re = new RegExp(/^([a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*)@([a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*[.][a-zA-Z]{2,})$/);
        return re.test(email);
    }

    /**
     *
     * @param password
     * @returns {boolean}
     */
    regexPassword = (password) => {
        const re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*+\/?@[\\\]^_{|}]).{8,}$/);
        return re.test(password);
    }

    /**
     *
     * @param input
     * @returns {boolean}
     */
    validateNumber = (input) => {
        const regex =new RegExp(/^[1-9]$|^10$/);
        return regex.test(input);
    };


    formatDateToMs = (date) => {
        // Configura la zona horaria para Lima, Perú (UTC-5)
        const opciones = {timeZone: 'America/Lima', hour12: false, hourCycle: 'h23'};
        // Usa Intl.DateTimeFormat para formatear la fecha y hora
        const formatDate = new Intl.DateTimeFormat('es-PE', opciones);
        return formatDate.format(date);
        // return date.toLocaleString("es-PE",
        //     {
        //         timeZone: 'America/Lima'
        //     });
    }
    /**
     *
     * @param intents
     * @param ctxFn
     * @param options
     * @returns {Promise<*>}
     */
    tryAgain = async (intents, ctxFn, options) => {
        const {ctx, state} = options;

        if (intents > 0) {
            let msgIntents = intents === 1 ? "Tienes 1 intento." : `Tienes ${intents} intentos.`;
            await this.simulatingReadWrite(ctxFn.provider, {
                delay1: 500,
                delay2: 1000,
                ctx
            });
            return ctxFn.fallBack({body: msgIntents});
        } else {
            if (!state[ctx?.from]) {
                state[ctx?.from] = {};
            }
            state[ctx?.from] = {...state[ctx?.from], on: false};
            await this.simulatingReadWrite(ctxFn.provider, {
                delay1: 500,
                delay2: 1150,
                ctx
            });
            await ctxFn.provider.vendor.sendMessage(ctx?.key?.remoteJid, {text: "❌ Su solicitud ha sido cancelada ❌ , escriba #empezar"}, {quoted: ctx});
            return ctxFn.endFlow();
        }
    }
    /**
     *
     * @param file
     * @param data
     * @returns {Promise<void>}
     */
    writeFile = async (file, data) => {
        new Promise((resolve, reject) => {
            fs.writeFile(file, JSON.stringify(data, null, 2), (err) => {
                if (err) reject(err);
                resolve("Successfully Written to File.");
            });
        });
    };

    /**
     *
     * @param file
     * @returns {Promise<any>}
     */
    readFile = async (file) => {
        try {
            const data = await fs.readFile(file, 'utf8');
            console.log("DATA -> ->", data)
            return JSON.parse(data);
        } catch (e) {
            console.error("Error al leer el archivo");
        }
    };

    /**
     *
     * @param ctx
     * @param file
     * @returns {Promise<void>}
     */
    existsFile = async (ctx, file) => {
        const template = {
            [ctx?.from]: {
                on: true,
                email: "",
                password: "",
                token: ""
            }
        };
        try {
            await fs.access(file, fs.constants.F_OK);
            //Si el archivo esta vacio se crea un nuevo objeto con el numero de telefono como key y un objeto vacio como value
            const data = await fs.readFile(file, 'utf8');
            if (data.length === 0) {
                console.log("Archivo vacio, llenando archivo")
                await this.writeFile(file, template);
            } else {
                console.log('Contenido del archivo:', JSON.parse(data));
            }
        } catch (e) {
            console.error("El archivo no existe");
            console.log("Creando archivo");
            await fs.writeFile(file, JSON.stringify(template,null,2));
        }
    }
}
const newInstance = new HelpersClass();
//Object.freeze(newInstance)

module.exports = newInstance;
