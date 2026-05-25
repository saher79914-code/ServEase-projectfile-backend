const db = require("../config/db");


// GET ALL COMPLAINTS
exports.getAllComplaints = async (req, res) => {
    try {

        const sql = `
            SELECT c.id, c.message, c.status, c.admin_response,
                   u.full_name, u.email
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.id DESC
        `;

        const [result] = await db.query(sql);

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
};

// RESOLVE COMPLAINT
exports.resolveComplaint = async (req, res) => {
    try {

        const id = req.params.id;
        const response = req.body?.response;

        if (!response) {
            return res.status(400).json({
                success: false,
                message: "Response is required"
            });
        }

        const sql = `
            UPDATE complaints
            SET status = 'resolved',
                admin_response = ?
            WHERE id = ?
        `;

        await db.query(sql, [response, id]);

        res.status(200).json({
            success: true,
            message: "Complaint resolved"
        });
        

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};