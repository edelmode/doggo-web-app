const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (user, secret, expiresIn) => {
    return jwt.sign({id: user.id}, secret, {expiresIn});
};

export default generateToken