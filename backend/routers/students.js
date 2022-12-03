const express = require('express');
const router  = express.Router();

router.get('/', (req,res) => {
	res.json({ first: "Nikita" ,second :"Miha", third:"Max"})
});

module.exports = router;
