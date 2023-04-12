const { Router } = require("express");
const { getClientDetails,getAllClientDetails } = require("../services/blockchainService");
const router = Router();

router.route("/getClientDetails").get(getClientDetails);
router.route("/getAllClientDetails").get(getAllClientDetails);

module.exports = router;
