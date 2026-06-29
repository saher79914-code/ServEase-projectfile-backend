const db = require("../config/db");

const bcrypt = require("bcryptjs");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verify ownership
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only view your own profile"
      });
    }

    const [result] = await db.query(

      `
      SELECT
      id,
      full_name,
      email,
      phone,
      profile_image
      FROM users
      WHERE id = ?
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      data: result[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verify ownership
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile"
      });
    }

    const {
      full_name,
      email,
      phone
    } = req.body;

    let profile_image = req.body.profile_image;
    if (req.file) {
      profile_image = `/uploads/profile/${req.file.filename}`;
    }

    await db.query(
      `
      UPDATE users
      SET
      full_name = ?,
      email = ?,
      phone = ?,
      profile_image = ?
      WHERE id = ?
      `,
      [
        full_name,
        email,
        phone,
        profile_image,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Profile Updated"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verify ownership
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only reset your own password"
      });
    }

    const {
      oldPassword,
      newPassword
    } = req.body;


    const [user] = await db.query(
      `
      SELECT password
      FROM users
      WHERE id = ?
      `,
      [id]
    );

    if (!user.length) {

      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    const isMatch =
      await bcrypt.compare(
        oldPassword,
        user[0].password
      );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Wrong Old Password"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [
        hashedPassword,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Password Updated"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};