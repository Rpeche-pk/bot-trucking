require("dotenv").config();
const {createBot, createProvider, createFlow} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");
const {welcomeFlow, offFlow, onFlow, startChat,verifyToken} = require("./app/welcomeflow/welcome.flow");
const {loginFlow, validateInfo} = require("./app/loginflow/login.flow")
const {menuOptions} = require("./app/menuflow/menu.flow")
const {employeeActiveFlow} = require("./app/optionsflow/employee.flow")
const {chooseOption} = require("./app/optionsflow/option.flow")
const {logoutFlow} = require("./app/optionsflow/signout.flow")
const {vehicleActiveFlow,vehicleInactiveFlow} = require("./app/optionsflow/vehicle.flow")
const newInstance = require("./helpers/helpers");

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
        verifyToken
    ]

    const adapterFlow = createFlow([...flows]);
    const adapterProvider = createProvider(BaileysProvider, {
        usePairingCode: !!process.env.PHONE_NUMBER,
        phoneNumber: process.env.PHONE_NUMBER || null,
        enabledCalls: true, //borrar esta opcion
    });

    const settings = {
        // queue: {
        //     timeout: 25000,
        //     concurrencyLimit: 15,
        // },
        extensions: {
            utils: newInstance
        }
    }
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    },settings);
    //QRPortalWeb();
};

main().then(() => console.log("Bot iniciado correctamente 😎🚀"));
//@AUTHOR: Luis Peche A. (@maipevi)
//{
//         clear: { messages: [{ id: message.id || "", fromMe: message.user.id == this.id, timestamp: Number(message.timestamp || Date.now()) }] },
//       },