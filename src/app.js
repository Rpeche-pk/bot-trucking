const { createBot, createProvider, createFlow, addKeyword } = require("@bot-whatsapp/bot");
require("dotenv").config();
//const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");
const phoneNumber = process.env.PHONE_NUMBER;

const welcome = addKeyword("welcome").addAnswer("Welcome to Trucking bott");

const main = async () => {
  const adapterDB = new JsonFileAdapter();
  const adapterFlow = createFlow([welcome]);
  const adapterProvider = createProvider(BaileysProvider, {
    usePairingCode: true,
    phoneNumber: phoneNumber,
    enabledCalls: true,
  });

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();
