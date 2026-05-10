import { PROBLEMS } from "./src/lib/problems/data";
import { writeFileSync } from "fs";
writeFileSync("problems.json", JSON.stringify(PROBLEMS, null, 0));
console.log(`Wrote ${PROBLEMS.length} problems`);
