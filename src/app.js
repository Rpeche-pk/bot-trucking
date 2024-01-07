require("dotenv").config();
const {createBot, createProvider, createFlow} = require("@bot-whatsapp/bot");
//const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('node:fs/promises');
const {welcomeFlow, offFlow, onFlow, startChat,verifyToken} = require("./app/welcomeflow/welcome.flow");
const {loginFlow, validateInfo} = require("./app/loginflow/login.flow")
const {menuOptions} = require("./app/menuflow/menu.flow")
const {employeeActiveFlow} = require("./app/optionsflow/employee.flow")
const {chooseOption} = require("./app/optionsflow/option.flow")
const {logoutFlow,timeoutFlow} = require("./app/optionsflow/signout.flow")
const {vehicleActiveFlow,vehicleInactiveFlow,vehicleDeleteFlow} = require("./app/optionsflow/vehicle.flow")
const {vehicleCreateFlow, vehicleValidateDataFlow} = require("./app/optionsflow/createVehicle.flow")
const {employeeCreateFlow,employeePhotoFlow} = require("./app/optionsflow/createEmployee.flow")
const {uploadImageToServerFlow} = require("./app/optionsflow/uploadimage.flow")
const newInstance = require("./helpers/helpers.class");
const Queue = require('queue-promise')
const mimeType = require('mime-types')
const ServerHttp = require("./http/http.chatwoot");
const ChatwootClass = require("./service/chatwoot.class");
const chalk = require('chalk');
const {black} = require('./utils/blacklist.class')
const HandlerMessage = require('./service/handler.class')
const {handlerMessage} = require("./service");
const {convertOggMp3} = require("./utils/convertmp3.util");


const PORT= process.env.PORT || 3001
const serverHttp = new ServerHttp(PORT)

const chatwoot = new ChatwootClass({
    account: process.env.CHATWOOT_ACCOUNT_ID,
    token: process.env.CHATWOOT_TOKEN,
    endpoint: process.env.CHATWOOT_ENDPOINT
})

const queue = new Queue({
    concurrent: 1,
    interval: 500
})

const main = async () => {
    const adapterDB = new JsonFileAdapter();
    const flows = [
        welcomeFlow,
        offFlow,
        onFlow,
        startChat,
        loginFlow,
        validateInfo,
        menuOptions,
        employeeActiveFlow,
        chooseOption,
        logoutFlow,
        vehicleActiveFlow,
        vehicleInactiveFlow,
        vehicleDeleteFlow,
        verifyToken,
        timeoutFlow,
        vehicleCreateFlow,
        vehicleValidateDataFlow,
        employeeCreateFlow,
        employeePhotoFlow,
        uploadImageToServerFlow
    ]

    const adapterFlow = createFlow([...flows]);
    const adapterProvider = createProvider(BaileysProvider, {
        usePairingCode: !!process.env.PHONE_NUMBER,
        phoneNumber: process.env.PHONE_NUMBER || null,
        enabledCalls: true, //borrar esta opcion
    });

    const settings = {
        queue: {
            timeout: 30000,
            concurrencyLimit: 15,
        },
        extensions: {
            utils: newInstance,
            handler:new HandlerMessage(PORT,chatwoot),
        },
        blackList: black.getBlackList(),
        globalState: {
            timer: 120000, //300000 -> 5 minutos
        }

    }
    const bot=await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    },settings);

    serverHttp.initialization(bot)

    // 2° opcion !payload?.message.extendedTextMessage.text
    // todo ESTO ESCUCHA LOS EVENTOS DE MENSAJES ENTRANTES (CUANDO EL CLIENTE ENVIA UN MENSAJE ---> )
    adapterProvider.on('message', (payload) => {
        queue.enqueue(async () => {
            try {
                const captionFile = payload?.message?.imageMessage?.caption ?? payload?.message?.videoMessage?.caption ?? payload?.message?.documentMessage?.caption ?? payload?.message?.audioMessage?.caption ?? '';
                const attachment = []

                if (payload?.body.includes('_event_')) {
                    const mime = payload?.message?.imageMessage?.mimetype ?? payload?.message?.videoMessage?.mimetype ?? payload?.message?.documentMessage?.mimetype ?? payload?.message?.audioMessage?.mimetype;
                    const extension = mimeType.extension(mime);

                    const buffer = await downloadMediaMessage(payload, "buffer");
                    const fileName = `file-${Date.now()}.${extension}`;
                    const pathFile = `${process.cwd()}/public/${fileName}`;
                    await fs.writeFile(pathFile, buffer);
                    if(extension === 'oga'){
                        // todo convirtiendo audio oga en mp3 y guardandolo
                        await convertOggMp3(pathFile,pathFile.replace('.oga','.mp3'));
                        //todo eliminando el archivo oga
                        await fs.unlink(pathFile);
                    }
                    console.log(chalk.green.bold(`[FICHERO ENVIADO CLIENTE WA CREADO]`),chalk.cyan(`📋 http://localhost:${PORT}/${fileName.replace('.oga','.mp3')}`));
                    attachment.push(pathFile.replace('.oga','.mp3'))
                }

                console.log(chalk.green.bold(`>>>>[MENSAJE ENVIADO DESDE WA]`),chalk.cyan(`📋 ${payload.body}`));
                await handlerMessage({
                    phone: payload.from,
                    name: payload.pushName,
                    message: captionFile ? captionFile : payload.body,
                    attachment,
                    mode: 'incoming'
                }, chatwoot)
            } catch (err) {
                console.log('ERROR', err)
            }
        });
    });

    /**
     * Los mensajes salientes (cuando usas el bot (andAnswer) le envia un mensaje al cliente ---> )
     * ESTE EMITE EL EVENTO SEND_MESSAGE Y LO CAPTURAMOS AQUI , QUE SERA EMITIDO POR DEBAJO .emit
     */
    bot.on('send_message', (payload) => {
        queue.enqueue(async () => {
            console.log(chalk.green.bold(`<<<<[MENSAJE ENVIADO DESDE EL BOT CODIGO EN CASA]`),chalk.cyan(`📋 ${payload.answer}`));
            await handlerMessage({
                phone: payload.numberOrId,
                name: payload.pushName,
                message: payload.answer,
                mode: 'outgoing'
            }, chatwoot)
        })
    })
};

main().then(() => console.log(chalk.bgCyan("Bot iniciado correctamente 😎🚀")));
