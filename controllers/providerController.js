
const db = require('../config/db');


// ========================================
// CREATE PROVIDER
// ========================================

const createProvider = (req, res) => {

    const {
        name,
        profession,
        provider_id,
        phone,
        location,
        submitted,
        status
    } = req.body;

    const sql = `
    INSERT INTO providers
    (name, profession, provider_id, phone, location, submitted, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            profession,
            provider_id,
            phone,
            location,
            submitted,
            status
        ],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "Provider Added Successfully"
            });

        }
    );
};


// ========================================
// READ ALL PROVIDERS
// ========================================

const getProviders = (req, res) => {

    const sql = 'SELECT * FROM providers';

    db.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

};


// ========================================
// UPDATE PROVIDER
// ========================================

const updateProvider = (req, res) => {

    const { id } = req.params;

    const {
        name,
        profession,
        provider_id,
        phone,
        location,
        submitted,
        status
    } = req.body;

    const sql = `
    UPDATE providers
    SET
    name=?,
    profession=?,
    provider_id=?,
    phone=?,
    location=?,
    submitted=?,
    status=?
    WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            profession,
            provider_id,
            phone,
            location,
            submitted,
            status,
            id
        ],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "Provider Updated Successfully"
            });

        }
    );
};


// ========================================
// DELETE PROVIDER
// ========================================

const deleteProvider = (req, res) => {

    const { id } = req.params;

    const sql = 'DELETE FROM providers WHERE id=?';

    db.query(sql, [id], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json({
            message: "Provider Deleted Successfully"
        });

    });

};


module.exports = {
    createProvider,
    getProviders,
    updateProvider,
    deleteProvider
};

