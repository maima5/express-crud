
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request masuk
  console.log(`\n [${timestamp}] ${req.method} ${req.originalUrl}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("   Body:", JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("   Query:", req.query);
  }

  // Intercept response untuk log response time
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusIcon = res.statusCode < 400 ? "✅" : "❌";
    console.log(
      ` ${statusIcon} Response: ${res.statusCode} | Waktu: ${duration}ms`
    );
  });

  next();
};

const apiKeyAuth = (req, res, next) => {
  // Skip auth untuk endpoint GET (baca data bebas)
  if (req.method === "GET") return next();

  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY || "rahasia-123";

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak: Header x-api-key tidak ditemukan",
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: API Key tidak valid",
    });
  }

  next();
};
const requestCounts = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const record = requestCounts.get(ip);

      // Reset jika waktu sudah habis
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else {
        record.count++;
      }

      // Cek limit
      if (record.count > maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader("Retry-After", retryAfter);

        return res.status(429).json({
          success: false,
          message: `Terlalu banyak request. Coba lagi dalam ${retryAfter} detik`,
          retry_after: retryAfter,
        });
      }
    }

    // Tambahkan info rate limit ke header response
    const record = requestCounts.get(ip);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));

    next();
  };
};

const responseFormatter = (req, res, next) => {
  // Tambahkan helper method ke res
  res.success = (data, message = "Berhasil", statusCode = 200, meta = null) => {
    const response = {
      success: true,
      message,
      data,
    };

    if (meta) response.meta = meta;

    return res.status(statusCode).json(response);
  };

  res.error = (message = "Terjadi kesalahan", statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message,
    };

    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
  };

  next();
};


const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};


const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // MySQL errors
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Data sudah ada (duplikat)",
    });
  }

  if (err.code === "ER_BAD_FIELD_ERROR") {
    return res.status(400).json({
      success: false,
      message: "Field tidak valid",
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  requestLogger,
  apiKeyAuth,
  rateLimiter,
  responseFormatter,
  notFound,
  errorHandler,
};
