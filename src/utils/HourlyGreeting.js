const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
let customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
const randomGreeting = () => {
    // Crea un objeto con las variantes de hora y saludos
    const saludos = {
        "06:00-12:00": ["*Buenos días*", "*Buenos Días* 🌤"],
        "12:00-18:00": ["*Buenas tardes*", "*Buenas Tardes* ⛅"],
        "18:00-23:59": ["*Buenas noches*", "*Buenas Noches* 🌚"],
        "00:00-06:00": ["*El que madruga Dios lo ayuda*", "*Buena Amanecida* ☕"],
    };

    // Función para obtener la hora local del sistema o la hora peruana
    const getLocalTime = () => {
        const systemTime = dayjs.utc();
        if (systemTime.isValid()) {
            return systemTime.tz('America/Lima');
        } else {
            return dayjs().tz('America/Lima');
        }
    };

    const horaActual = getLocalTime();
    let saludo;

    for (let clave in saludos) {
        let rangoHorario = clave.split("-");
        let horaInicio = dayjs(rangoHorario[0], 'HH:mm');
        let horaFin = dayjs(rangoHorario[1], 'HH:mm');
        if (horaActual.isBetween(horaInicio, horaFin)) {
            saludo = saludos[clave];
            console.log(saludo);
            break;
        }
    }
    return saludo;
};
module.exports = randomGreeting;
