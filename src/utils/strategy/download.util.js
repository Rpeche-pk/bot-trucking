const {downloadMediaMessage} = require("@whiskeysockets/baileys");
const mimetype = require("mime-types")
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const path = require("path");
const {writeFile} = require("fs/promises");
const ImageKit = require("imagekit");
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * funcion para descargar un recurso multimedia (imagen)
 * @param ctx {Object}
 * @returns {Promise<string|null>} retorna la ruta del archivo descargado
 */
const downloadImage = async (ctx) => {
    return await downloadResource(ctx, formatArchive(ctx),"image");
}

/**
 * funcion para descargar un recurso multimedia (video)
 * @param ctx {Object}
 * @returns {Promise<string|null>} retorna la ruta del archivo descargado
 */
const downloadVideo = async (ctx) => {
    return await downloadResource(ctx, formatArchive(ctx),"video");
}
/**
 * funcion para descargar un recurso multimedia (audio)
 * @param ctx {Object}
 * @returns {Promise<string|null>} retorna la ruta del archivo descargado
 */
const downloadAudio = async (ctx) => {
    return await downloadResource(ctx, formatArchive(ctx),"audio");
}
/**
 * funcion para descargar un recurso multimedia (documento)
 * @param ctx {Object}
 * @returns {Promise<string|null>} retorna la ruta del archivo descargado
 */
const downloadDocument = async (ctx) => {
    return await downloadResource(ctx, formatArchive(ctx),"document");
}



/**
 * funcion para subir solo *imagenes* a un servidor externo (imagekit)
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
        const content = ctx.message?.imageMessage;
        const buffer = await downloadMediaMessage(ctx, "buffer");
        const base64 = buffer.toString("base64");

        console.log("mimetype",mimetype.extension(content.mimetype))
        const dateHour=formatArchive(ctx);

        return imagekit.upload({
            file: `${base64}`,
            fileName: dateHour + "." + mimetype.extension(content.mimetype),
            useUniqueFileName: flag,
            folder: "Profiles"
        });
    } catch (e) {
        console.log(e)
    }

}

/**
 * funcion para descargar un recurso multimedia (imagen, video, audio, documento) y guardar en local
 * @param ctx {Object}
 * @param fileName {string} nombre del archivo
 * @param typeMedia {string} tipo de recurso multimedia (image, video, audio, document)
 * @returns {Promise<string|null>} retorna la ruta del archivo descargado
 */
async function downloadResource(ctx, fileName, typeMedia) {
    //todo validar si el mensaje es un mensaje de tipo multimedia (imagen, video, audio, documento)
    const content = ctx.message?.[`${typeMedia}Message`] || ctx.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[`${typeMedia}Message`];
    if(!content) return null

    //todo descargar el contenido del mensaje, funcion de la libreria baileys
    //const stream = await downloadContentFromMessage(content, typeMedia);
    const buffer = await downloadMediaMessage(ctx, "buffer");

    // todo guarda en memoria el buffer completo y luego escriba el archivo en el sistema de archivos
    // let buffer = Buffer.from([])
    // for await (const chunk of stream){
    //     buffer = Buffer.concat([buffer, chunk])
    // }

    console.log("extension ",mimetype.extension(content.mimetype));
    //todo obtener la extension del archivo a partir del tipo de contenido del mensaje -👇🏼
    const filePath = path.resolve("src/app/assets/",`${fileName}.`+ mimetype.extension(content.mimetype));
    await writeFile(filePath, buffer);
    return filePath;
}


//todo funciones utils para obtener el contenido de un mensaje multimedia, y generar un nombre unico para el archivo
/**
 * funcion para obtener el contenido de un recurso multimedia (imagen, video, audio, documento)
 * @param ctx {Object}
 * @param typeMedia {string} tipo de recurso multimedia (image, video, audio, document)
 * @returns {Promise<*>} retorna el contenido del recurso multimedia
 */
const getMessageContent = (ctx, typeMedia) => {
    return ctx.message?.[`${typeMedia}Message`] || ctx.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[`${typeMedia}Message`];
}

const formatArchive = (ctx) =>{
    const peruTimezone = 'America/Lima';
    const formattedDate = dayjs().tz(peruTimezone).format('DD/MM/YYYY HH:mm:ss');
    console.log(formattedDate);
    let [date, hour] = formattedDate.split(" ");
    date = date.replaceAll("/", "-");
    hour = hour.replaceAll(":", "-");
    console.log(date + "_" + hour);
    return ctx?.from+"_"+date + "_" + hour;
}

module.exports = {
    uploadToServerImage,
    downloadVideo,
    downloadAudio,
    downloadDocument,
    downloadImage, 
    getMessageContent
};