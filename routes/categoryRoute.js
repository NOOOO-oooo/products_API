const router = require("express").Router();

const categoryController = require("../controllers/categoryControllers");

router.get("/categories", categoryController.getAllCategories);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);
router.get("/categories/:id", categoryController.getCategoryById);
module.exports = router;
