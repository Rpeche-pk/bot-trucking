const moment = require("moment");

const randomGreeting = () => {
  // Crea un objeto con las variantes de hora y saludos
  const saludos = {
    "06:00-12:00": ["*_Buenos días_*", "*_Buenos Días_* 🌤"],
    "12:00-18:00": ["*_Buenas tardes_*", "*_Buenas Tardes_* ⛅"],
    "18:00-23:59": ["*_Buenas noches_*", "*_Buenas Noches_* 🌚"],
    "00:00-06:00": ["*_El que madruga Dios lo ayuda_*","*_Buena Amanecida_* ☕"],
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
