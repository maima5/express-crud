const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/product.controller");

const { validateBody, validateQuery } = require("../middleware/validate.middleware");
const { apiKeyAuth } = require("../middleware/custom.middleware");

const {
  createProductSchema,
  updateProductSchema,
  queryParamsSchema,
} = require("../validations/product.validation");

// Khusus: ambil daftar kategori (harus sebelum /:id)
router.get("/categories", getCategories);

// GET semua produk dengan search, sort, pagination
router.get("/", validateQuery(queryParamsSchema), getAllProducts);

// GET satu produk berdasarkan ID
router.get("/:id", getProductById);

// POST buat produk baru (butuh API Key)
router.post(
  "/",
  apiKeyAuth,
  validateBody(createProductSchema),
  createProduct
);

// PUT update produk (butuh API Key)
router.put(
  "/:id",
  apiKeyAuth,
  validateBody(updateProductSchema),
  updateProduct
);

// DELETE hapus produk (butuh API Key)
router.delete("/:id", apiKeyAuth, deleteProduct);

module.exports = router;
