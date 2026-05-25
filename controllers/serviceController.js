const db = require("../config/db");

// GET ALL SERVICES
exports.getAllServices = async (req, res) => {
    try {

        const [services] = await db.query(
            "SELECT * FROM services ORDER BY id DESC"
        );

        res.status(200).json({
            success: true,
            data: services
        });

    } catch (error) {

        console.error("GET SERVICES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ADD SERVICE
exports.addService = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            category,
            icon
        } = req.body;

        const sql = `
            INSERT INTO services
            (name, description, price, category, icon)
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            name,
            description,
            price,
            category,
            icon
        ]);

        res.status(201).json({
            success: true,
            message: "Service added successfully"
        });

    } catch (error) {

        console.error("ADD SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
    try {

        const serviceId = req.params.id;

        const {
            name,
            description,
            price,
            category,
            icon
        } = req.body;

        const sql = `
            UPDATE services
            SET
                name = ?,
                description = ?,
                price = ?,
                category = ?,
                icon = ?
            WHERE id = ?
        `;

        await db.query(sql, [
            name,
            description,
            price,
            category,
            icon,
            serviceId
        ]);

        res.status(200).json({
            success: true,
            message: "Service updated"
        });

    } catch (error) {

        console.error("UPDATE SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
    try {

        const serviceId = req.params.id;

        await db.query(
            "DELETE FROM services WHERE id = ?",
            [serviceId]
        );

        res.status(200).json({
            success: true,
            message: "Service deleted"
        });

    } catch (error) {

        console.error("DELETE SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// TOGGLE SERVICE STATUS
exports.toggleServiceStatus = async (req, res) => {
    try {

        const serviceId = req.params.id;

        const [service] = await db.query(
            "SELECT is_active FROM services WHERE id = ?",
            [serviceId]
        );

        const currentStatus = service[0].is_active;

        const newStatus = currentStatus === 1 ? 0 : 1;

        await db.query(
            "UPDATE services SET is_active = ? WHERE id = ?",
            [newStatus, serviceId]
        );

        res.status(200).json({
            success: true,
            message: "Service status updated",
            is_active: newStatus
        });

    } catch (error) {

        console.error("TOGGLE SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};