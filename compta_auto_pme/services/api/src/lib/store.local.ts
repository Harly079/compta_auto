import jsonfile from "jsonfile";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.join(__dirname, "..", "..", "..", "demo", "seed");

export async function load(name: string) {
  return jsonfile.readFile(path.join(base, `${name}.json`));
}
export async function save(name: string, data: any) {
  return jsonfile.writeFile(path.join(base, `${name}.json`), data, { spaces: 2 });
}
