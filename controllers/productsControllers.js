const database = require("../services/db");
const db = database.pool;

exports.getAllProducts = async (req, res) => {
   try {
      const results =
         await db.query(`SELECT p.id,p.name,p.description,p.price,p.currency,p.quantity,p.active
 , p.created_date,p.updated_date,
 
 (SELECT ROW_TO_JSON(category_obj) FROM (
 SELECT id, name FROM category WHERE id=p.category_id
 ) category_obj) AS category
 FROM products p`);
      res.status(200).json(results.rows);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.createProduct = async (req, res) => {
   try {
      if (!req.body.name) {
         return res.status(422).json({ error: "name is required" });
      }

      if (!req.body.price) {
         return res.status(422).json({ error: "price is required" });
      }

      if (!req.body.category_id) {
         return res.status(422).json({ error: "Category ID is required" });
      } else {
         const categoryExists = await db.query({
            text: "SELECT EXISTS (SELECT * FROM category WHERE id=$1)",
            values: [req.body.category_id],
         });

         if (!categoryExists.rows[0].exists) {
            res.status(422).json({
               error: `There is no such category id as: ${req.body.category_id} `,
            });
         }
      }

      const existResults = await db.query({
         text: "SELECT EXISTS (SELECT * FROM products WHERE name=$1)",
         values: [req.body.name],
      });

      if (existResults.rows[0].exists) {
         res.status(409).json({
            error: `Product ${req.body.name} Already exists`,
         });
      }

      const results = await db.query({
         text: `INSERT INTO products (name,id,description,price,currency,quantity,active,category_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
         values: [
            req.body.name,
            req.body.id,
            req.body.description ? req.body.description : null,
            req.body.price,
            req.body.currency ? req.body.description : "USD",
            req.body.quantity ? req.body.quantity : 0,
            "active" in req.body ? req.body.active : true,
            req.body.category_id,
         ],
      });
      return res.status(200).json(results.rows[0]);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.updateProduct = async (req, res) => {
   try {
      if (
         !req.body.name ||
         !req.body.description ||
         !req.body.price ||
         !req.body.currency ||
         !req.body.quantity ||
         !req.body.active ||
         !req.body.category_id
      ) {
         return res.status(422).json({ error: "All Fields are required " });
      }

      const categoryExists = await db.query({
         text: "SELECT EXISTS (SELECT * FROM category WHERE id=$1)",
         values: [req.body.category_id],
      });

      if (!categoryExists.rows[0].exists) {
         res.status(422).json({
            error: `There is no such category id as: ${req.body.category_id} `,
         });
      }
      const results = await db.query({
         text: `UPDATE products 
        SET name=$1, description=$2, price=$3, currency=$4, 
        quantity=$5, active=$6, category_id=$7, updated_date = CURRENT_TIMESTAMP  WHERE id =$8
        RETURNING * `,
         values: [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.currency,
            req.body.quantity,
            req.body.active,
            req.body.category_id,
            req.params.id,
         ],
      });

      if (!results.rows.length) {
         return res.status(404).json({ error: "product not found " });
      }

      return res.status(200).json(results.rows[0]);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.deleteProduct = async (req, res) => {
   try {
      const results = await db.query({
         text: `DELETE FROM products WHERE id=$1`,
         values: [req.params.id],
      });

      if (results.rowCount == 0) {
         return res.status(404).json({
            error: `The Product of id: ${req.params.id} does not exist `,
         });
      }

      return res.status(204).json(results.rows[0]);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.getProductById = async (req, res) => {
   try {
      const results = await db.query({
         text: `SELECT p.id,p.name,p.description,p.price,p.currency,p.quantity,p.active
 , p.created_date,p.updated_date,
 
 (SELECT ROW_TO_JSON(category_obj) FROM (
 SELECT id, name FROM category WHERE id=p.category_id
 ) category_obj) AS category
 FROM products p
 WHERE p.id=$1`,
         values: [req.params.id],
      });

      if (results.rowCount == 0) {
         return res.status(404).json({
            error: `A product with the ID:${req.params.id} does not exist`,
         });
      }

      return res.status(400).json(results.rows);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.returnByCategoryId = async (req, res) => {
   try {
      const existResults = await db.query({
         text: `SELECT EXISTS(SELECT * FROM category WHERE id=$1)`,
         values: [req.params.category_id],
      });

      if (!existResults.rows[0].exists) {
         return res.status(404).json({
            error: `There are not products with the category id : ${req.params.category_id}`,
         });
      }

      const results = await db.query({
         text: `SELECT p.id,p.name,p.description,p.price,p.currency,p.quantity,p.active
       , p.created_date,p.updated_date,
       
       (SELECT ROW_TO_JSON(category_obj) FROM (
       SELECT id, name FROM category WHERE id=p.category_id
       ) category_obj) AS category
       FROM products p
       WHERE p.category_id=$1`,
         values: [req.params.category_id],
      });

      return res.status(400).json(results.rows);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};
