const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {simulatingReadWrite, wait} = require("../../helpers/helpers")
const {employeeActive} = require("../../http/user.http")

const employeeActiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {provider, state, gotoFlow}) => {
        try {
            const {chooseOption} =require("../optionsflow/option.flow")
            const jid = ctx?.key?.remoteJid;
            const myState = state.getMyState();
            const token = myState[ctx?.from]?.token;
            const response = await employeeActive(token);
            await wait(1000);
            const topEmployees = response.sort((a, b) => b.id - a.id)
                .slice(0, 5);
            let data = [];
            for (const employee of topEmployees) {
                const {name, lastName, email, roleName} = employee;
                data.push(`╓Nombre: ${name} ${lastName}\n╠Email: ${email}\n╙Rol: ${roleName}`);
            }
            console.log(ctx);
            const lengthArray = data.length;
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1000, ctx});
            await provider.vendor.sendMessage(jid, {text: "Cantidad de empleados activos: " + lengthArray + "\n\n📌 Los empleados más activos son:"});
            await simulatingReadWrite(provider, {delay1: 500, delay2: 1300, ctx});
            await provider.vendor.sendMessage(jid, {text: data.join("\n\n")});
            await wait(700);

            await gotoFlow(chooseOption);
        } catch (error) {
            console.error("ERROR FLUJO employeeActiveFlow", error);
        }

    })


module.exports = {employeeActiveFlow};