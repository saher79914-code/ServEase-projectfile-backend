const db = require("../config/db");

// SEND NOTIFICATION
exports.sendNotification = async (req, res) => {
    try {

        const { user_id, title, message, type } = req.body;

        const sql = `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(sql, [
            user_id || null,
            title,
            message,
            type || "system"
        ]);

        res.status(200).json({
            success: true,
            message: "Notification sent"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// GET NOTIFICATIONS (USER SIDE)
exports.getNotifications = async (req, res) => {
    try {

        const userId = req.params.userId;

        const sql = `
            SELECT * FROM notifications
            WHERE user_id = ? OR user_id IS NULL
            ORDER BY created_at DESC
        `;

        const [result] = await db.query(sql, [userId]);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
    const allowedTypes = [
   "verification",
   "complaint",
   "system",
   "booking",
   "admin"
];

if (!allowedTypes.includes(type)) {
    return res.status(400).json({
        success: false,
        message: "Invalid notification type"
    });
}
};
