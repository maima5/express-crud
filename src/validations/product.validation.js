const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.min": "Nama produk minimal 3 karakter",
    "string.max": "Nama produk maksimal 255 karakter",
    "any.required": "Nama produk wajib diisi",
    "string.empty": "Nama produk tidak boleh kosong",
  }),

  description: Joi.string().max(1000).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 1000 karakter",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Harga harus berupa angka",
    "number.positive": "Harga harus lebih dari 0",
    "any.required": "Harga wajib diisi",
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stok harus berupa angka",
    "number.integer": "Stok harus bilangan bulat",
    "number.min": "Stok tidak boleh negatif",
    "any.required": "Stok wajib diisi",
  }),

  category: Joi.string().min(2).max(100).required().messages({
    "string.min": "Kategori minimal 2 karakter",
    "string.max": "Kategori maksimal 100 karakter",
    "any.required": "Kategori wajib diisi",
    "string.empty": "Kategori tidak boleh kosong",
  }),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).messages({
    "string.min": "Nama produk minimal 3 karakter",
    "string.max": "Nama produk maksimal 255 karakter",
  }),

  description: Joi.string().max(1000).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 1000 karakter",
  }),

  price: Joi.number().positive().precision(2).messages({
    "number.base": "Harga harus berupa angka",
    "number.positive": "Harga harus lebih dari 0",
  }),

  stock: Joi.number().integer().min(0).messages({
    "number.base": "Stok harus berupa angka",
    "number.integer": "Stok harus bilangan bulat",
    "number.min": "Stok tidak boleh negatif",
  }),

  category: Joi.string().min(2).max(100).messages({
    "string.min": "Kategori minimal 2 karakter",
    "string.max": "Kategori maksimal 100 karakter",
  }),
})
  .min(1)
  .messages({
    "object.min": "Minimal satu field harus diisi untuk update",
  });

const queryParamsSchema = Joi.object({
  // Pagination
  page: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Halaman minimal 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.min": "Limit minimal 1",
    "number.max": "Limit maksimal 100 data per halaman",
  }),

  // Search
  search: Joi.string().max(255).optional().allow(""),

  // Sorting
  sort_by: Joi.string()
    .valid("id", "name", "price", "stock", "category", "created_at")
    .default("created_at")
    .messages({
      "any.only": "Sort hanya boleh: id, name, price, stock, category, created_at",
    }),
  sort_order: Joi.string().valid("ASC", "DESC", "asc", "desc").default("DESC").messages({
    "any.only": "Order hanya boleh: ASC atau DESC",
  }),

  // Filter by category
  category: Joi.string().max(100).optional().allow(""),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  queryParamsSchema,
};
