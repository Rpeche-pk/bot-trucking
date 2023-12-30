const {api} = require('./config');
const {NotFoundDataException} = require("../exceptions/handler/GlobalExceptionHandler.class");

const employeeActive = async (token) => {
    try {
        const bearerToken=token ? `Bearer ${token}` : ''
        const {data} = await api.get(`/employee/allEmployees`,  {
            headers: {
                Authorization: `${bearerToken}`
            }
        });
        console.log(data)
        return data;
    } catch (error) {
        console.error("Oops algo salio mal ",error.response.data)
    }
}
const employeeCreateHttp = async (token,data) => {
    try {
        const bearerToken=token ? `Bearer ${token}` : ''
        const {response} = await api.post(`/employee/newEmployee`,data, {
            headers: {
                Authorization: `${bearerToken}`
            }
        });
        return response;
    } catch (error) {
        console.error("Oops algo salio mal ",error.response.data)
        if (error.response.status === 400) throw new NotFoundDataException("El email ya existe, ingrese otro por favor");
    }
}

module.exports = {employeeActive,employeeCreateHttp};