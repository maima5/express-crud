const { pool } = require("../config/database");

const buildWhereClause = (search, category) => {
  const conditions = [];
  const params = [];

  if (search && search.trim()) {
    conditions.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category && category.trim()) {
    conditions.push("category = ?");
    params.push(category.trim());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params };
};


const createProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)",
    [name, description || null, price, stock, category]
  );

  const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [
    result.insertId,
  ]);

  return res.success(rows[0], "Produk berhasil ditambahkan", 201);
};


const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const sort_by = req.query.sort_by || "created_at";
  const sort_order = req.query.sort_order || "DESC";
  const category = req.query.category || "";

  const allowedSortColumns = ["id", "name", "price", "stock", "category", "created_at"];
  const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : "created_at";
  const safeSortOrder = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const { whereClause, params } = buildWhereClause(search, category);

  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM products ${whereClause}`,
    params
  );
  const totalData = parseInt(countResult[0].total);
  const totalPages = Math.ceil(totalData / limit);
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT * FROM products ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const meta = {
    pagination: {
      total_data: totalData,
      total_pages: totalPages,
      current_page: page,
      per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
    filter: { search: search || null, category: category || null },
    sort: { sort_by: safeSortBy, sort_order: safeSortOrder },
  };

  return res.success(rows, "Data produk berhasil diambil", 200, meta);
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  // Validasi ID harus angka
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.error("ID produk tidak valid", 400);
  }

  const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.error(`Produk dengan ID ${id} tidak ditemukan`, 404);
  }

  return res.success(rows[0], "Detail produk berhasil diambil");
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || parseInt(id) <= 0) {
    return res.error("ID produk tidak valid", 400);
  }

  // Cek apakah produk ada
  const [existing] = await pool.execute("SELECT id FROM products WHERE id = ?", [id]);
  if (existing.length === 0) {
    return res.error(`Produk dengan ID ${id} tidak ditemukan`, 404);
  }

  // Build query dinamis berdasarkan field yang dikirim
  const fields = [];
  const values = [];

  const { name, description, price, stock, category } = req.body;

  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (description !== undefined) { fields.push("description = ?"); values.push(description); }
  if (price !== undefined) { fields.push("price = ?"); values.push(price); }
  if (stock !== undefined) { fields.push("stock = ?"); values.push(stock); }
  if (category !== undefined) { fields.push("category = ?"); values.push(category); }

  values.push(id);

  await pool.execute(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  const [updated] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);

  return res.success(updated[0], "Produk berhasil diupdate");
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || parseInt(id) <= 0) {
    return res.error("ID produk tidak valid", 400);
  }

  const [existing] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);
  if (existing.length === 0) {
    return res.error(`Produk dengan ID ${id} tidak ditemukan`, 404);
  }

  await pool.execute("DELETE FROM products WHERE id = ?", [id]);

  return res.success(
    { deleted_product: existing[0] },
    `Produk "${existing[0].name}" berhasil dihapus`
  );
};


const getCategories = async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT category, COUNT(*) as total_products FROM products GROUP BY category ORDER BY category ASC"
  );

  return res.success(rows, "Daftar kategori berhasil diambil");
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
};
