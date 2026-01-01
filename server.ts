console.log("Hello from TypeScript");
import { app } from "./app";
import { initialize } from './utils/database/dbconfig';

const PORT = process.env.PORT || 3000;
const DB_Name = process.env.DB || 'capstoneDb';
const DB_Address = process.env.DB_Address || 'localhost';

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    initialize(DB_Name, DB_Address, (err) => {
        if (err) {
            console.error('Failed to initialize MongoDB:', err);
            process.exit(1);
        }
    });
});