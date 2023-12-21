const {api} = require('./config');
const ENV = require('../utils/enviroments');

class VehicleHttp {
    ENDPOINT_VEHICLE_ACTIVE;
    ENDPOINT_VEHICLE_INACTIVE;
    token;
    #flag;

    constructor(token, flag) {
        const {ENDPOINT_VEHICLE_ACTIVE, ENDPOINT_VEHICLE_INACTIVE} = ENV();
        if (!VehicleHttp.instance) {
            this.ENDPOINT_VEHICLE_ACTIVE = ENDPOINT_VEHICLE_ACTIVE;
            this.ENDPOINT_VEHICLE_INACTIVE = ENDPOINT_VEHICLE_INACTIVE;
            this.token = token;
            this.#flag = flag;
            VehicleHttp.instance=this;
        }else{
            VehicleHttp.instance.#flag = flag;
        }

        return VehicleHttp.instance;
    }

    vehicleResponseApi = async () => {
        try {
            const bearerToken = this.token ? `Bearer ${this.token}` : ''
            let ENDPOINT;
            const config = {
                headers: {
                    Authorization: `${bearerToken}`
                },
                params: {
                    page: 0,
                    size: 8,
                    sort: 'id,desc'
                }
            }
            if(this.#flag === "INACTIVE"){
                ENDPOINT= this.ENDPOINT_VEHICLE_INACTIVE;
            }
            if(this.#flag === "ACTIVE"){
                ENDPOINT= this.ENDPOINT_VEHICLE_ACTIVE;
            }
            console.log(ENDPOINT)
            const {data} = await api.get(`${ENDPOINT}`, config);
            console.log(data)
            return data;
        } catch (error) {
            console.error("Oops algo salio mal ", error.message)
        }
    };

}

module.exports = {
    VehicleHttp
};