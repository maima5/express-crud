

/**
 * Middleware untuk validasi request body menggunakan Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Middleware untuk validasi query params menggunakan Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      convert: true, // konversi string ke tipe yang sesuai
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Query parameter tidak valid",
        errors,
      });
    }

    req.query = value;
    next();
  };
};

module.exports = { validateBody, validateQuery };
