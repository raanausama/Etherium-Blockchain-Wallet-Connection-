const pool = require("../../db/pool");


exports.getClientDetails = async (req, res) => {
    const { username } = req.query;

    try {
        const resp = await pool.query(`SELECT count(*) OVER() AS full_count ,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS id,c.fullname, c.username, c.wallet_address, ih.ipfshash, ih.creation_date, ih.transaction_id,ih.client_username, ih.director
        FROM client c
        JOIN ipfshashes ih ON c.username = ih.client_username
        JOIN application ap ON c.username = ap.client_username
		JOIN application_version av ON ap.app_id = av.app_id
        WHERE c.username = '${username}' and av.director_approved = true`)

        res.json({ status: "ok", rows: resp.rows });
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            error: error,
        })
    }

};
exports.getAllClientDetails = async (req, res) => {

    try {
        const resp = await pool.query(`SELECT count(*) OVER() AS full_count ,ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS id,c.fullname, c.username, c.wallet_address, ih.ipfshash, ih.creation_date, ih.transaction_id,ih.client_username, ih.director
        FROM client c
        JOIN ipfshashes ih ON c.username = ih.client_username
        JOIN application ap ON c.username = ap.client_username
		JOIN application_version av ON ap.app_id = av.app_id
        WHERE ih.ipfshash IS NOT NULL and director_approved = true`)

        res.json({ status: "ok", rows: resp.rows });
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            error: error,
        })
    }

};
