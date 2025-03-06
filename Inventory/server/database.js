import * as alt from 'alt-server';
import mongoose from 'mongoose';

class Database {
    static async connect() {
        try {
            // Verbindungs-URI - passe diese an deine Konfiguration an
            const uri = 'mongodb://localhost:27017/gta5altv';
            
            // Verbindungsoptionen
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                connectTimeoutMS: 10000,
                serverSelectionTimeoutMS: 10000,
            };

            // Event Listeners für die Verbindung
            mongoose.connection.on('connecting', () => {
                alt.log('[DB] Verbinde mit MongoDB...');
            });

            mongoose.connection.on('connected', () => {
                alt.log('[DB] Erfolgreich mit MongoDB verbunden');
            });

            mongoose.connection.on('error', (err) => {
                alt.logError('[DB] MongoDB Verbindungsfehler:', err);
            });

            // Verbindung herstellen
            await mongoose.connect(uri, options);
            return true;

        } catch (error) {
            alt.logError('[DB] Fehler beim Verbinden mit MongoDB:', error);
            return false;
        }
    }
}

export default Database;