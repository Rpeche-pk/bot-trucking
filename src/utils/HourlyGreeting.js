const moment = require("moment-timezone");

const randomGreeting = () => {
  // Crea un objeto con las variantes de hora y saludos
  const saludos = {
    "06:00-12:00": ["*Buenos días*", "*Buenos Días* 🌤"],
    "12:00-18:00": ["*Buenas tardes*", "*Buenas Tardes* ⛅"],
    "18:00-23:59": ["*Buenas noches*", "*Buenas Noches* 🌚"],
    "00:00-06:00": ["*El que madruga Dios lo ayuda*","*Buena Amanecida* ☕"],
  };

  // Especifica la zona horaria (por ejemplo, "America/Lima")
  const zonaHoraria = "America/Lima";
  const horaActual = moment().tz(zonaHoraria);

  let saludo;

  for (let clave in saludos) {
    let rangoHorario = clave.split("-");
    let horaInicio = moment.tz(rangoHorario[0], "HH:mm", zonaHoraria);
    let horaFin = moment.tz(rangoHorario[1], "HH:mm", zonaHoraria);
    if (horaActual.isBetween(horaInicio, horaFin)) {
      saludo = saludos[clave];
      console.log(saludo);
      break;
    }
  }
  return saludo;
};
module.exports = randomGreeting;
