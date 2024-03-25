#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";
import connectToDatabase from "./service/datasource.ts";
import { startNFTEventListener } from "./service/nft.ts";

await connectToDatabase()
startNFTEventListener()
await dev(import.meta.url, "./main.ts", config);
