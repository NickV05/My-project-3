import express, { Request, Response } from "express";
import pool from "../db/database";

const router = express.Router();

router.post("/lpr", async (req: Request, res: Response) => {
  const { plate_number, event_type, metadata } = req.body;

  if (!plate_number || !event_type) {
    console.log("Missing required fields in request body", { plate_number, event_type });
     res
      .status(400)
      .json({ error: "Plate number and event type are required." });
  }

  try {
    const similarPlatesQuery = `
      SELECT plate_number, similarity(plate_number, $1) AS similarity
      FROM lpr_events
      WHERE similarity(plate_number, $1) > 0.8
      ORDER BY similarity DESC
      LIMIT 5;
    `;
    const similarPlatesResult = await pool.query(similarPlatesQuery, [
      plate_number,
    ]);

    if (similarPlatesResult.rows.length > 0) {
      console.log("Potentially similar plate numbers detected", {
        input: plate_number,
        matches: similarPlatesResult.rows,
      });
    }

    const duplicateCheckQuery = `
      SELECT * FROM lpr_events
      WHERE plate_number = $1 AND event_type = $2
        AND event_time >= NOW() - INTERVAL '1 minute';
    `;
    const duplicateCheckResult = await pool.query(duplicateCheckQuery, [
      plate_number,
      event_type,
    ]);

    if (duplicateCheckResult.rows.length > 0) {
      console.log("Duplicate event detected", { plate_number, event_type });
       res.status(400).json({
        error: "Duplicate event detected. Please avoid repeated submissions.",
      });
    }

    if (event_type === "entry") {
      const checkEntryQuery = `
        SELECT * FROM lpr_sessions
        WHERE plate_number = $1 AND session_end IS NULL;
      `;
      const entryCheckResult = await pool.query(checkEntryQuery, [
        plate_number,
      ]);

      if (entryCheckResult.rows.length > 0) {
        console.log("Entry already exists for this plate number", { plate_number });
         res.status(400).json({
          error: "Entry for this record already happened.",
        });
      }

      const eventQuery = `
        INSERT INTO lpr_events (plate_number, event_type, event_time, metadata)
        VALUES ($1, $2, NOW(), $3)
        RETURNING id, plate_number, event_type, event_time, metadata;
      `;
      const eventResult = await pool.query(eventQuery, [
        plate_number,
        event_type,
        metadata || {},
      ]);

      const sessionQuery = `
        INSERT INTO lpr_sessions (plate_number, session_start, metadata)
        VALUES ($1, NOW(), $2)
        RETURNING *;
      `;
      const sessionResult = await pool.query(sessionQuery, [
        plate_number,
        metadata || {},
      ]);

      console.log("Entry event successfully recorded", {
        event: eventResult.rows[0],
        session: sessionResult.rows[0],
      });

       res.status(201).json({
        event: eventResult.rows[0],
        session: sessionResult.rows[0],
      });
    } else if (event_type === "exit") {
      const checkExitQuery = `
        SELECT * FROM lpr_sessions
        WHERE plate_number = $1 AND session_end IS NULL;
      `;
      const sessionCheckResult = await pool.query(checkExitQuery, [
        plate_number,
      ]);

      if (sessionCheckResult.rows.length === 0) {
        console.log("Exit cannot be recorded without prior entry", { plate_number });
         res.status(400).json({
          error: "Exit cannot be recorded, entry has to happen first.",
        });
      }

      const eventQuery = `
        INSERT INTO lpr_events (plate_number, event_type, event_time, metadata)
        VALUES ($1, $2, NOW(), $3)
        RETURNING id, plate_number, event_type, event_time, metadata;
      `;
      const eventResult = await pool.query(eventQuery, [
        plate_number,
        event_type,
        metadata || {},
      ]);

      const sessionQuery = `
        UPDATE lpr_sessions
        SET session_end = NOW(), metadata = metadata || $1
        WHERE plate_number = $2 AND session_end IS NULL
        RETURNING *;
      `;
      const sessionResult = await pool.query(sessionQuery, [
        metadata || {},
        plate_number,
      ]);

      if (sessionResult.rows.length > 0) {
        console.log("Exit event successfully recorded", {
          event: eventResult.rows[0],
          session: sessionResult.rows[0],
        });
         res.status(201).json({
          event: eventResult.rows[0],
          session: sessionResult.rows[0],
        });
      } else {
        console.log("Session not found or already ended", { plate_number });
         res
          .status(404)
          .json({ error: "Session not found or already ended." });
      }
    } else {
      console.log("Invalid event type provided", { event_type });
       res.status(400).json({ error: "Invalid event type." });
    }
  } catch (err) {
    console.log("Error processing event", { error: err });
     res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/lpr/history", async (_, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lpr_events ORDER BY event_time DESC;"
    );
    console.log("Fetched history of LPR events");
     res.status(200).json(result.rows);
  } catch (err) {
    console.log("Error fetching history of LPR events", { error: err });
     res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
