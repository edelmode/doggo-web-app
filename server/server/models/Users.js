const connection = require('../config/db.js');

const User = {
    findById: (id, callback) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        connection.query(sql, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results[0]);
        });
    },
};

export default User;