const {api} = require('./config');
const { jwtDecode }= require ("jwt-decode");
const startLogin = async (email, password) => {
    try {
        const { data } = await api.post('/auth/login', {
            email,
            password
        })
        console.log(data)
        const token = `token=${data.token}`;
        console.log(token)
        const decoded = jwtDecode(token);
        console.log(decoded);
        data.decodedToken= decoded;
        console.log(data)
        return data;
    } catch (error) {
        console.log('Error en la autenticación', error.response.data?.details.toString(), error.response.status)
    }
}

module.exports = {startLogin};