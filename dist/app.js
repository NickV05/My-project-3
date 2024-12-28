"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./db/database");
const api_1 = __importDefault(require("./routes/api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URI || "*",
}));
(0, database_1.initializeDatabase)();
app.use("/api", api_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map