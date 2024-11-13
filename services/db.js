const Pool = require("pg").Pool;

const pool = new Pool({
   user: "postgres",
   password: "1234",
   host: "localhost",
   database: "products",
   port: 3001,
});

module.exports = {
   pool,
};
