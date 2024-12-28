import request from "supertest";
import app from "../app";

const generateRandomLicensePlate = (): string => {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const numbers = Math.floor(100 + Math.random() * 900).toString();
  return `${letters}${numbers}`;
};

describe("POST /api/lpr", () => {
  const randomPlateNumber = generateRandomLicensePlate();

  it("should respond with a 201 status and event/session for entry", async () => {
    const requestBody = {
      plate_number: randomPlateNumber,
      event_type: "entry",
      metadata: { additionalInfo: "test" },
    };

    const response = await request(app).post("/api/lpr").send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body.event).toHaveProperty(
      "plate_number",
      randomPlateNumber
    );
    expect(response.body.session).toHaveProperty(
      "plate_number",
      randomPlateNumber
    );
  });

  it("should respond with a 400 status if entry is attempted twice for the same plate_number", async () => {
    const requestBody = {
      plate_number: randomPlateNumber,
      event_type: "entry",
      metadata: { additionalInfo: "test" },
    };

    await request(app).post("/api/lpr").send(requestBody);

    const response = await request(app).post("/api/lpr").send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Entry for this record already happened.");
  });

  it("should respond with a 400 status if exit is attempted before entry", async () => {
    const requestBody = {
      plate_number: "XYZ789",
      event_type: "exit",
      metadata: { additionalInfo: "test" },
    };

    const response = await request(app).post("/api/lpr").send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Exit cannot be recorded, entry has to happen first."
    );
  });

  it("should respond with a 201 status and event/session for exit after entry", async () => {
    const entryBody = {
      plate_number: randomPlateNumber,
      event_type: "entry",
      metadata: { additionalInfo: "entry test" },
    };

    await request(app).post("/api/lpr").send(entryBody);

    const exitBody = {
      plate_number: randomPlateNumber,
      event_type: "exit",
      metadata: { additionalInfo: "exit test" },
    };

    const response = await request(app).post("/api/lpr").send(exitBody);

    expect(response.status).toBe(201);
    expect(response.body.event).toHaveProperty(
      "plate_number",
      randomPlateNumber
    );
    expect(response.body.session).toHaveProperty(
      "plate_number",
      randomPlateNumber
    );
  });
});

describe("GET /api/lpr/history", () => {
  it("should respond with a 200 status and a list of events", async () => {
    const response = await request(app).get("/api/lpr/history");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
