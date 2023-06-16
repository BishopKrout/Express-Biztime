/** Database setup for BizTime. */


const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://bishop:2255@localhost/biztime"
});

client.connect();


module.exports = client;
