const router = require("express").Router();
const productController = require("../controllers/productsControllers");

router.get("/products", productController.getAllProducts);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/products/:id", productController.getProductById);
router.get(
   "/products/category/:category_id",
   productController.returnByCategoryId
);
module.exports = router;
