require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { testConnection } = require("./src/config/database");
const productRoutes = require("./src/routes/product.routes");
const {
  requestLogger,
  rateLimiter,
  responseFormatter,
  notFound,
  errorHandler,
} = require("./src/middleware/custom.middleware");

const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 4000;
const API_VERSION = process.env.API_VERSION || "v1";


app.use(helmet());                          
app.use(cors());                            
app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));

app.use(responseFormatter);                 
app.use(requestLogger);                     
app.use(rateLimiter(100, 60 * 1000));       

// Morgan hanya di development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/", (req, res) => {
  res.success(
    {
      app: "Express CRUD API",
      version: API_VERSION,
      status: "running",
      timestamp: new Date().toISOString(),
      endpoints: {
        products: `/api/${API_VERSION}/products`,
        categories: `/api/${API_VERSION}/products/categories`,
        docs: "Lihat README.md untuk dokumentasi lengkap",
      },
    },
    "Server berjalan dengan baik 🚀"
  );
});

// API Routes
app.use(`/api/${API_VERSION}/products`, productRoutes);

app.use(notFound);
app.use(errorHandler);


const startServer = async () => {
  await testConnection(); // Test koneksi DB dulu

  app.listen(PORT, () => {
    console.log("\n🚀 ================================");
    console.log(`   Server berjalan di port ${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`   API: http://localhost:${PORT}/api/${API_VERSION}/products`);
    console.log("================================\n");
  });
};

startServer();
