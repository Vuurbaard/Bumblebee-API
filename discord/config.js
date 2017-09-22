var os = require("os");

function Config() {
	this.clientToken = "MzEyNjU5NjYxNzc2MDkzMTg1.DFs3hA.WG_qmBq9RkZ4SM4sqo_LLA4BR0k"; // Bumblebee

	if(os.hostname() == "DESKTOP-D1A4R6K") {
		this.clientToken = "MzUwMDE5MTY3ODg3Mjk0NDg0.DH-TIA.HI9sohFgnMWachHuN6J1TjfpYG4"; // Bumbledev
	}
}

module.exports = exports = new Config();