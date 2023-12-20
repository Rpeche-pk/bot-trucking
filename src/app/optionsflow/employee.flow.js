const {addKeyword, EVENTS} = require("@bot-whatsapp/bot");
const {simulatingReadWrite} = require("../../helpers/helpers")
const {employeeActive} = require("../../http/user.http")

const employeeActiveFlow = addKeyword(EVENTS.ACTION, {})
    .addAction(async (ctx, {provider, state, gotoFlow}) => {
        const jid = ctx?.key?.remoteJid;
        const myState = state.getMyState();
        const token = myState[ctx?.from]?.token;
        const response = await employeeActive(token);
        const topEmployees = response.sort((a, b) => b.id - a.id)
                            .slice(0, 5);
        let data= [];
        for (const employee of topEmployees) {
            const {name, lastName, email, roleName} = employee;
            data.push(`╓Nombre: ${name} ${lastName}\n╠Email: ${email}\n╙Rol: ${roleName}`);
            //await provider.vendor.sendMessage(jid, {text: `📌 Nombre: ${name} ${lastName} \n 📌 Email: ${email} \n 📌 Rol: ${roleName}`});
        }
        console.log(ctx);
        await simulatingReadWrite(provider, {delay1: 500, delay2: 1300, ctx});
        await provider.vendor.sendMessage(jid, {text: data.join("\n")});
    });

module.exports = {employeeActiveFlow};