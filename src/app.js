const {createBot, createProvider, createFlow, addKeyword} = require("@bot-whatsapp/bot");
require("dotenv").config();
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");
const phoneNumber = process.env.PHONE_NUMBER;
const {welcomeFlow, offFlow, onFlow, startChat} = require("./app/welcomeflow/welcome.flow");
const {loginFlow, validateInfo} = require("./app/loginflow/login.flow")
const {menuOptions} = require("./app/menuflow/menu.flow")
const {employeeActiveFlow} = require("./app/optionsflow/employee.flow")

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
        employeeActiveFlow
    ]

    const adapterFlow = createFlow([...flows]);
    const adapterProvider = createProvider(BaileysProvider, {
        usePairingCode: true,
        phoneNumber: phoneNumber,
        enabledCalls: true,
    });

    const settings = {
        queue: {
            timeout: 25000,
            concurrencyLimit: 15,
        }
    }
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    QRPortalWeb();
};

main().then(() => console.log("Bot iniciado correctamente 😎🚀🚀"));
