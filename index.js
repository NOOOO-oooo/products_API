const express = require("express");
const database = require("./services/db");

const db = database.pool;
const app = express();

const port = 2001;

app.use(express.json());
app.use(require("./routes/categoryRoute"));

app.use(require("./routes/productRoute"));

app.listen(port, () => {
   console.log(`listening on port ${port}...`);
});
