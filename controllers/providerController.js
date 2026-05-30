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
      UPDATE provider_profiles
      SET approval_status = 'approved'
      WHERE user_id = ?
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
      UPDATE provider_profiles
      SET approval_status = 'rejected'
      WHERE user_id = ?
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

exports.getAcceptanceCounts =
async (req, res) => {

  try {

    const [approved] =
    await db.query(
      `
      SELECT COUNT(*) AS total
      FROM provider_profiles
      WHERE approval_status = 'approved'
      `
    );

    const [rejected] =
    await db.query(
      `
      SELECT COUNT(*) AS total
      FROM provider_profiles
      WHERE approval_status = 'rejected'
      `
    );

    res.status(200).json({

      success: true,

      approved:
      approved[0].total,

      rejected:
      rejected[0].total,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error",
    });
  }
};
exports.getAcceptanceList =
async (req, res) => {

  try {

    const [result] =
    await db.query(
      `
      SELECT
      users.id,
      users.full_name,
      users.email,
      provider_profiles.cnic_image,
      provider_profiles.approval_status

      FROM provider_profiles

      JOIN users
      ON users.id =
      provider_profiles.user_id

      WHERE provider_profiles.approval_status
      IN ('approved','rejected')

      ORDER BY users.id DESC
      `
    );

    res.status(200).json({

      success: true,

      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error",
    });
  }
};