"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const generateRandomLicensePlate = () => {
    const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
    const numbers = Math.floor(100 + Math.random() * 900).toString();
    return `${letters}${numbers}`;
};
describe("POST /api/lpr", () => {
    const randomPlateNumber = generateRandomLicensePlate();
    it("should respond with a 201 status and event/session for entry", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestBody = {
            plate_number: randomPlateNumber,
            event_type: "entry",
            metadata: { additionalInfo: "test" },
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(requestBody);
        expect(response.status).toBe(201);
        expect(response.body.event).toHaveProperty("plate_number", randomPlateNumber);
        expect(response.body.session).toHaveProperty("plate_number", randomPlateNumber);
    }));
    it("should respond with a 400 status if entry is attempted twice for the same plate_number", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestBody = {
            plate_number: randomPlateNumber,
            event_type: "entry",
            metadata: { additionalInfo: "test" },
        };
        yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(requestBody);
        const response = yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(requestBody);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Entry for this record already happened.");
    }));
    it("should respond with a 400 status if exit is attempted before entry", () => __awaiter(void 0, void 0, void 0, function* () {
        const requestBody = {
            plate_number: "XYZ789",
            event_type: "exit",
            metadata: { additionalInfo: "test" },
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(requestBody);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Exit cannot be recorded, entry has to happen first.");
    }));
    it("should respond with a 201 status and event/session for exit after entry", () => __awaiter(void 0, void 0, void 0, function* () {
        const entryBody = {
            plate_number: randomPlateNumber,
            event_type: "entry",
            metadata: { additionalInfo: "entry test" },
        };
        yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(entryBody);
        const exitBody = {
            plate_number: randomPlateNumber,
            event_type: "exit",
            metadata: { additionalInfo: "exit test" },
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/api/lpr").send(exitBody);
        expect(response.status).toBe(201);
        expect(response.body.event).toHaveProperty("plate_number", randomPlateNumber);
        expect(response.body.session).toHaveProperty("plate_number", randomPlateNumber);
    }));
});
describe("GET /api/lpr/history", () => {
    it("should respond with a 200 status and a list of events", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/api/lpr/history");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    }));
});
//# sourceMappingURL=api.test.js.map