import mongoose from "npm:mongoose@8.2.0";
import * as config from "../common/config.ts"

const DATABASE_URI = config.DATABASE_URI || ''

async function connectToDatabase() {
  console.log("Connecting to MongoDB!");
  await mongoose.connect(DATABASE_URI);
  console.log("Connected to MongoDB!");
}

export default connectToDatabase;