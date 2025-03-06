import * as alt from "alt-server";
import mongoose from "mongoose";
import { CONFIG } from "../../shared/config.js";

class Database {
  static async connect() {
    try {
      mongoose.set("strictQuery", false);

      mongoose.connection.on("error", (err) => {
        alt.logError("MongoDB Verbindungsfehler:", err);
      });

      mongoose.connection.on("connected", () => {
        alt.log("[DB] Erfolgreich verbunden.");
      });

      await mongoose.connect(CONFIG.DATABASE.URI, {
        ...CONFIG.DATABASE.OPTIONS,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
    } catch (error) {
      alt.logError("MongoDB Verbindungsfehler:", error);
      alt.logError(error.stack);
    }
  }
}

export default Database;
