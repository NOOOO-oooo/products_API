
const database = require("../services/db");
const db = database.pool;

exports.getAllCategories = async (req, res) => {
   try {
      const results = await db.query("SELECT * FROM category");
      return res.status(200).json(results.rows);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.createCategory = async (req, res) => {
   try {
      if (!req.body.name) {
         return res.status(422).json({ error: "name is required" });
      }

      const existResults = await db.query({
         text: "SELECT EXISTS (SELECT * FROM category WHERE name=$1)",
         values: [req.body.name],
      });

      if (existResults.rows[0].exists) {
         res.status(409).json({
            error: `Category ${req.body.name} Already exists`,
         });
      }

      const results = await db.query({
         text: "INSERT INTO category(name,id) VALUES($1,$2) RETURNING *",
         values: [req.body.name, req.body.id],
      });

      return res.status(201).json(results.rows);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.updateCategory = async (req, res) => {
   try {
      if (!req.body.name) {
         return res.status(422).json({ error: "name is required" });
      }

      const categoryMatches = await db.query({
         text: `SELECT EXISTS(SELECT * FROM category where name=$1)`,
         values: [req.body.name],
      });
      if (categoryMatches.rows[0].exists) {
         res.status(409).json(
            `This is the same name entered before: ${req.body.name}`
         );
      }

      const results = await db.query({
         text: `Update category set name=$1 ,
          updated_date= CURRENT_TIMESTAMP
           where id=$2 RETURNING *`,
         values: [req.body.name, req.params.id],
      });

      if (!results.rows.length) {
         return res.status(404).json({ error: "category not found" });
      }

      return res.status(200).json(results.rows);
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.deleteCategory = async (req, res) => {
   try {
      const categoryExists = await db.query({
         text: `SELECT EXISTS(SELECT * FROM category where id=$1)`,
         values: [req.params.id],
      });

      if (!categoryExists.rows.exists) {
         res.status(404).json({
            error: `The category of id: ${req.params.id} does not exist `,
         });
      }

      const results = await db.query({
         text: `DELETE FROM category WHERE id=$1`,
         values: [req.params.id],
      });

      return res.status(200).json(results.rows[0]);
   } catch (error) {
      return res.status(500).json({ error: error.message });
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

exports.getCategoryById = async (req, res) => {
   try {
      const results = await db.query({
         text: `SELECT * FROM categry where id=$1`,
         values: [req.params.id],
      });

      if (results.rowCount == 0) {
         return res.status(404).json({
            error: `A category with the ID:${req.params.id} does not exist`,
         });
      }

      return res.status(400).json(results.rows);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};
