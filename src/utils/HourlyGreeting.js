const moment = require("moment");

const randomGreeting = () => {
  // Crea un objeto con las variantes de hora y saludos
  const saludos = {
    "06:00-12:00": ["*Buenos días*", "*Buenos Días 🌤*"], 
    "12:00-18:00": ["*Buenas tardes*", "*Buenas Tardes ⛅*"],
    "18:00-23:59": ["*Buenas noches*", "*Buenas Noches 🌚*"],
    "00:00-06:00": ["*El que madruga Dios lo ayuda*","*Buena Amanecida ☕*"],
  };

  const horaActual = moment();

  let saludo;

  for (let clave in saludos) {
    let rangoHorario = clave.split("-");
    let horaInicio = moment(rangoHorario[0], "HH:mm");
    let horaFin = moment(rangoHorario[1], "HH:mm");
    if (horaActual.isBetween(horaInicio, horaFin)) {
      saludo = saludos[clave];
      console.log(saludo);
      break;
    }
  }
  return saludo;
};
module.exports = randomGreeting;
