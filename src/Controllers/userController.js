const { User } = require('../Models/index')

const users = async (req, res) => {
    try{
        const users = await User.find();
        return res.status(200).send({
            data: users
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Error to get users',
            error: err.message
        });
        
    }
}

module.exports = {
    users
}
