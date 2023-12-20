const {api} = require('./config');

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
        console.error("Oops algo salio mal ",error.message)
    }
}

module.exports = {employeeActive};