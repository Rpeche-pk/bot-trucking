const bcrypt= require("bcrypt");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

const comparePassword = async (password, savePassword) => {
    return bcrypt.compareSync(password, savePassword);
}

module.exports = {hashPassword, comparePassword};