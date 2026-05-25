const db = require("../config/db");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {

        const sql = `
            SELECT 
                id,
                full_name,
                email,
                phone,
                role,
                is_blocked,
                created_at
            FROM users
        `;

        const [users] = await db.query(sql);

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// BLOCK USER
exports.blockUser = async (req, res) => {
    try {

        const userId = req.params.id;

        const sql = `
            UPDATE users
            SET is_blocked = 1
            WHERE id = ?
        `;

        await db.query(sql, [userId]);

        res.status(200).json({
            success: true,
            message: "User blocked"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// UNBLOCK USER
exports.unblockUser = async (req, res) => {
    try {

        const userId = req.params.id;

        const sql = `
            UPDATE users
            SET is_blocked = 0
            WHERE id = ?
        `;

        await db.query(sql, [userId]);

        res.status(200).json({
            success: true,
            message: "User unblocked"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};