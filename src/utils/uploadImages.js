const {downloadMediaMessage} = require("@whiskeysockets/baileys");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const ImageKit = require("imagekit");
/**
 * funcion para subir una imagen a un servidor externo (imagekit)
 * @param ctx {Object}
 * @param flag {boolean} indica si el nombre debe ser unico donde false es un nombre unico y true es un nombre personalizado
 * @returns {Promise<void>}
 */
const uploadToServerImage = async (ctx, flag) => {
    try {
        const imagekit = new ImageKit({
            publicKey: process.env.PUBLIC_KEY_IMAGEKIT,
            privateKey: process.env.PRIVATE_KEY_IMAGEKIT,
            urlEndpoint: process.env.URL_ENDPOINT_IMAGEKIT
        });
        const buffer = await downloadMediaMessage(ctx, "buffer");
        const base64 = buffer.toString("base64");

        const peruTimezone = 'America/Lima'; // Zona horaria de Perú
        const formattedDate = dayjs().tz(peruTimezone).format('DD/MM/YYYY HH:mm:ss');
        console.log(formattedDate);
        let [date, hour] = formattedDate.split(" ");
        date = date.replaceAll("/", "-");
        hour = hour.replaceAll(":", "-");
        const dateHour = date + "_" + hour;
        console.log(dateHour)

        return imagekit.upload({
            file: `${base64}`,
            fileName: ctx?.from + `_${dateHour}` + ".jpg",
            useUniqueFileName: flag,
            folder: "Profiles"
        });
    } catch (e) {
        console.log(e)
    }

}
module.exports = {uploadToServerImage};