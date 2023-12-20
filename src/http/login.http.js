const {api} = require('./config');

const startLogin = async (email, password) => {
    try {
        const { data } = await api.post('/auth/login', {
            email,
            password
        })
        console.log(data)
        const token = `token=${data.token}`;
        console.log(token)
        return data;
    } catch (error) {
        console.log(error)
        console.log('Error en la autenticación', error.response.data?.details, 'error')
    }
}

module.exports = {startLogin};