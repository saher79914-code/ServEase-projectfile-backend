const { updateProfile } = require("./controllers/provider/providerProfileController");

// Mock request and response
const req = {
  user: { id: 58 },
  body: {
    full_name: "Razia Updated",
    phone: "03029669904",
    address: "adna garden , kamoke",
    bio: "i am pro artist updated",
    hourly_rate: "15"
  },
  file: null
};

const db = require("./config/db");
console.log("Imported db in mock_update:", typeof db, typeof db.query);

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log("Response Status:", this.statusCode || 200);
    console.log("Response JSON:", data);
    if (data.message) {
      console.log("Error Stack:", data.stack || new Error(data.message).stack);
    }
  }
};

async function main() {
  console.log("Running mock updateProfile...");
  await updateProfile(req, res);
}

main();
