const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {

    const [users] = await db.query(`
      SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_blocked,
      created_at
      FROM users
      WHERE is_blocked = 0
    `);

    res.status(200).json(users);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// GET BLOCKED USERS
exports.getBlockedUsers = async (req, res) => {
  try {

    const [users] = await db.query(`
      SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_blocked,
      created_at
      FROM users
      WHERE is_blocked = 1
    `);

    res.status(200).json(users);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {

  try {

    const id = req.params.id;

    const [user] = await db.query(`
      SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_blocked,
      created_at
      FROM users
      WHERE id = ?
    `,[id]);

    if(user.length === 0){
      return res.status(404).json({
        message:"User not found"
      });
    }

    res.status(200).json(user[0]);

  } catch(error){

    console.log(error);

    res.status(500).json({
      message:"Server Error"
    });
  }
};

// ADD USER
exports.addUser = async (req,res)=>{

  try{

    const {
      full_name,
      email,
      password,
      role,
      phone,
      cnic,
      address,
      profile_image
    } = req.body;

    const [exist] = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if(exist.length > 0){

      return res.status(400).json({
        message:"Email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password,10);

    const [result] = await db.query(`
      INSERT INTO users
      (
        full_name,
        email,
        password,
        role,
        phone,
        cnic,
        address,
        profile_image
      )
      VALUES(?,?,?,?,?,?,?,?)
    `,[
      full_name,
      email,
      hashedPassword,
      role,
      phone || null,
      cnic || null,
      address || null,
      profile_image || null
    ]);

    const [user] = await db.query(
      "SELECT * FROM users WHERE id=?",
      [result.insertId]
    );

    res.status(201).json(user[0]);

  }catch(error){

    console.log(error);

    res.status(500).json({
      message:"Server Error"
    });
  }
};

// BLOCK USER
exports.blockUser = async (req,res)=>{

  try{

    const id = req.params.id;

    await db.query(`
      UPDATE users
      SET is_blocked = 1
      WHERE id = ?
    `,[id]);

    res.status(200).json({
      message:"User blocked successfully"
    });

  }catch(error){

    console.log(error);

    res.status(500).json({
      message:"Server Error"
    });
  }
};

// UNBLOCK USER
exports.unblockUser = async (req,res)=>{

  try{

    const id = req.params.id;

    await db.query(`
      UPDATE users
      SET is_blocked = 0
      WHERE id = ?
    `,[id]);

    res.status(200).json({
      message:"User unblocked successfully"
    });

  }catch(error){

    console.log(error);

    res.status(500).json({
      message:"Server Error"
    });
  }
};