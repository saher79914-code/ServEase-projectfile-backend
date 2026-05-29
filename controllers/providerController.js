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

    const id = req.params.id;

    await db.query(
      `
      UPDATE users
      SET is_approved = 2
      WHERE id = ?
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Provider Approved"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// REJECT PROVIDER
exports.rejectProvider = async (req, res) => {

  try {

    const id = req.params.id;

    await db.query(
      `
      UPDATE users
      SET is_approved = 0
      WHERE id = ?
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Provider Rejected"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};