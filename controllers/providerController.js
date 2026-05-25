const db = require("../config/db");

// GET PENDING PROVIDERS
exports.getPendingProviders = async (req, res) => {
    try {

        const sql = `
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                p.cnic_image,
                p.bio,
                p.years_of_experience,
                p.approval_status
            FROM users u
            JOIN provider_profiles p 
            ON u.id = p.user_id
            WHERE p.approval_status = 'pending'
        `;

        const [result] = await db.query(sql);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error("Pending Providers Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// APPROVE PROVIDER
exports.approveProvider = async (req, res) => {
    try {

        const userId = req.params.id;

        const sql = `
            UPDATE provider_profiles
            SET approval_status = 'approved'
            WHERE user_id = ?
        `;

        await db.query(sql, [userId]);

        res.status(200).json({
            success: true,
            message: "Provider approved"
        });

    } catch (error) {

        console.error("Approve Provider Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// REJECT PROVIDER
exports.rejectProvider = async (req, res) => {
    try {

        const userId = req.params.id;

        const sql = `
            UPDATE provider_profiles
            SET approval_status = 'rejected'
            WHERE user_id = ?
        `;

        await db.query(sql, [userId]);

        res.status(200).json({
            success: true,
            message: "Provider rejected"
        });

    } catch (error) {

        console.error("Reject Provider Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
