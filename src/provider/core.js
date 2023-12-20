const fs = require("fs");
const { wait } = require("../helpers/helpers.js");
class CoreBaileys {
  #sock = undefined;
  #provider = undefined;

  constructor(provider) {
    this.#sock = provider.vendor; 
    this.#provider = provider;
  }

  /**USAR provider.sendImage(number,url,id) si la imagen se encuentra en tu proyecto
   * FORMA DE ENVIAR IMAGEN CON PIEDE PAGINA O BREVE DESCRIPCION
   * @param {string} url URL DE LA IMAGEN SI VIENE DE OTRO SERVIDOR https://lrpa.go
   * @param {Object | null} options {ctx,caption}
   * @returns
   */
  async sendImage(url,options) {
    const {ctx,caption = null} = options;
    let templateImage = {
      image: { url },
      caption,
    };
    return this.#sock.sendMessage(ctx?.key?.remoteJid, templateImage);
  }

  /**
   * ENVIAR REACCION AL ULTIMO MENSAJE
   * @param {string} text icono
   * @param {Object} options {ctx}
   * @returns
   */
  async reactionMessage(text, options) {
    const {ctx} = options;
    let msg = {
      react: {
        //react
        text,
        key: ctx?.key,
      },
    };
    return this.#sock.sendMessage(ctx?.key?.remoteJid, msg);
  }

  /**
   * ENVIAR ARCHIVOS PDF CON NOMBRE PROPIO
   * @param {string} url
   * @param {Object} options {ctx,fileName}
   * @returns
   * PARA ENVIAR ARCHIVO sock.sendMessage(msg.key.remoteJid,{ document: fs.readFileSync("downloads/Khatta Flow - Seedhe Maut ft KR$NA.webm"), mimetype: 'video/mp4', fileName: "hello", title: "hello2" }
   */
  async pdfFile(url,options) {
    const {ctx,fileName} = options;
    let file = {
      document: {
        url,
        mimetype: "application/pdf",
      },
      fileName,
    };
    return this.#sock.sendMessage(ctx?.key?.remoteJid, file);
  }

  /**REVISAR SI CAMBIAR POR provider.sendMedia(id,url,caption)
   * FORMA DE ENVIAR UN VIDEO y si quiere que sea GIF CAMBIAS EL GIFPLAYBACK A TRUE
   * @param {string} url
   * @param {Object} options {ctx,caption}
   * @returns
   */
  async sendVideo(url, options) {
    const {ctx, caption = null} = options;
    return this.#sock.sendMessage(ctx?.key?.remoteJid, {
      video: {
        stream: fs.createReadStream(url),
      },
      mimetype: "video/mp4",
      caption,
      //jpegThumbnail:'https://id1.sgp1.digitaloceanspaces.com/img/midtrans1.jpeg',
      //gifPlayback: false,
    });
  }

  /**
   * FORMA DE ENVIAR UN GIF
   * @param {string} url
   * @param {Object} options {ctx,caption}
   * @returns
   */
  async sendGif(url, options = null) {
    const {ctx, caption = null} = options;
    return this.#sock.sendMessage(ctx?.key?.remoteJid, {
      video: {
        url,
      },
      mimetype: "video/mp4",
      caption,
      gifPlayback: true,
    });
  }

  /**
   * ENVIAR AUDIO
   * @param {string} url
   * @param {Object} options {ctx}
   * @returns
   */
  sendAudio = async (audioUrl, options=null) => {
    const {ctx} = options;
    return this.#provider.sendMedia(ctx?.key?.remoteJid, audioUrl);
  };

  /**
   * Enviar la ubicación
   * @param {number} degreesLatitude
   * @param {number} degreesLongitude
   * @param {Object} options {ctx,name}
   * @returns
   */
  async sendLocation(degreesLatitude, degreesLongitude , options=null) {
    const {ctx,name=null} = options;
    let templateLocation = {
      location: { degreesLatitude, degreesLongitude, name },
    };

    return this.#sock.sendMessage(ctx?.key?.remoteJid, templateLocation);
  }

  /**
   * envia un mensaje normal o un mensaje sobresaliendo un LINK o citado
   * @param {String} text mensaje
   * @param {Object} ctx contexto de la conversacion
   * @returns
   */
  async sendText(text, ctx = null) {
    return this.#sock.sendMessage(ctx?.key?.remoteJid, { text }, { quoted: ctx });
  }

  /**
   * CITA EL ULTIMO MENSAJE INGRESADO POR EL USUARIO, Y ADEMAS LE PUEDES RESPONDER CON UN MENSAJE
   * @param {string} text
   * @param {Object} options {ctx}
   */
  async sendQuotedMessage(text, options=null) {
    const {ctx} = options;
    return this.#sock.sendMessage(ctx?.key?.remoteJid, { text }, { quoted: ctx });
  }

  /**
   * FUNCIÓN PARA ENVIAR UN VCARD O ENVIAR UN VCARD CITANDO EL MENSAJE
   * @param {string} contactNumber
   * @param {string} displayName
   * @param {object} ctx es el contexto del mensaje un objeto, puede ser vacío para citarlo
   * @param {string} organization
   * @returns
   */
  async sendVcard(contactNumber, displayName, ctx = null, organization) {
    const cleanContactNumber = contactNumber.replaceAll(" ", "");
    const waid = cleanContactNumber.replace("+", "");

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:${displayName}\n` +
      `ORG:${organization};\n` +
      `TEL;type=CELL;type=VOICE;waid=${waid}:${cleanContactNumber}\n` +
      "END:VCARD";

    return this.#sock.sendMessage(
      ctx?.key?.remoteJid,
      {
        contacts: {
          displayName: displayName,
          contacts: [{ vcard }],
        },
      },
      { quoted: ctx }
    );
  }

/**
 * SIMULA LA ESCRITURA Y EL VISTO QUE DEJA EN TU MENSAJE
 * @param {Object} options {delay1,delay2,ctx}
 */
  async simulatingReadWrite(options) {
    const { delay1, delay2, ctx } = options;
    // view message
    await this.#sock.readMessages([ctx?.key]);
    await this.#sock.presenceSubscribe(ctx?.key?.remoteJid);
    await wait(delay1);
    // simulare writing
    await this.#sock.sendPresenceUpdate("composing", ctx?.key?.remoteJid);
    await wait(delay2);
    await this.#sock.sendPresenceUpdate("paused", ctx?.key?.remoteJid);
  }

  /**
   * SIMULA LA ESCRITURA, CUANDO GRABAS VOZ, EN LINEA, ETC
   * @param {string} text 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
   */
  async sendPresenceUpdate(text, options) {
    const {ctx} = options;
    await this.#sock.sendPresenceUpdate(text, ctx?.key?.remoteJid);
  }
}
module.exports = CoreBaileys;
