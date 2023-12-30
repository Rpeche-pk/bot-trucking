const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {employeeActive} = require("../../http/user.http")

const employeeActiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {extensions,provider, state, gotoFlow}) => {
        try {
            const {chooseOption} =require("../optionsflow/option.flow")
            const jid = ctx?.key?.remoteJid;
            const myState = state.getMyState();
            const token = myState[ctx?.from]?.token;
            await provider.vendor.readMessages([ctx?.key]);
            const response = await employeeActive(token);
            await extensions.utils.wait(500);
            const topEmployees = response.sort((a, b) => b.id - a.id)
                .slice(0, 5);
            let data = [];
            for (const employee of topEmployees) {
                const {name, lastName, email, roleName} = employee;
                data.push(`╓Nombre: ${name} ${lastName}\n╠Email: ${email}\n╙Rol: ${roleName}`);
            }
            console.log("Estado de flujo empleados activos", myState);
            const lengthArray = data.length;
            await extensions.utils.simulatingWriting(provider, {delay1: 500, delay2: 1000, ctx});
            await provider.vendor.sendMessage(jid, {text: "Cantidad de empleados activos: " + lengthArray + "\n\n📌 Los empleados más activos son:"});
            await extensions.utils.simulatingWriting(provider, {delay1: 600, delay2: 1250, ctx});
            await provider.vendor.sendMessage(jid, {text: data.join("\n\n")});
            await extensions.utils.wait(500);
            await extensions.utils.simulatingWriting(provider, {delay1: 650, delay2: 1250, ctx});
            await gotoFlow(chooseOption);
        } catch (error) {
            console.error("ERROR FLUJO employeeActiveFlow", error);
        }

    })


module.exports = {employeeActiveFlow};