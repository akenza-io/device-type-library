import { glob } from "glob";
import { promises } from "fs";
import Ajv from "ajv";
import { assert } from "chai";
import path from "path";

let validate;
const fsp = promises;

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


before(async () => {
  const metaSchemaContents = await fsp.readFile(`${__dirname}/meta.schema.json`, "utf8");
  const metaSchema = JSON.parse(metaSchemaContents);

  // compile schema just once here
  const ajv = new Ajv();
  validate = ajv.compile(metaSchema);
});

async function validateMeta(filepath) {
  // read and parse the file
  const fileContents = await fsp.readFile(filepath, "utf8");
  const schema = JSON.parse(fileContents);

  // validate the schema
  const isValid = validate(schema);
  if (!isValid) {
    const errorDetails = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Invalid meta file ${filepath}:\n${errorDetails}`);
  }

  if (schema.name.length > 64) {
    throw new Error(`Name: ${schema.name} cannot be longer than 64 characters`);
  }

  // check for missing topics schema files in the folder
  const folder = filepath.replace("meta.json", "");
  const schemas = await fsp.readdir(folder);
  const schemaJsonFiles = schemas.filter((name) => name.includes(".schema.json"));
  const missingTopics = schemaJsonFiles
    .map((name) => name.replace(".schema.json", ""))
    .filter((topic) => !schema.outputTopics.includes(topic));

  if (missingTopics.length > 0) {
    throw new Error(`Missing topics in ${schema.name}: ${missingTopics.join(", ")}`);
  }
}

describe("validate meta.json file", () => {
  it("should validate meta.json file", async () => {
    const files = await glob("**/meta.json", { absolute: true });
    assert.isNotEmpty(files, "No meta.json files found");

    const validationPromises = files.map(file => validateMeta(file));

    await Promise.all(validationPromises);
  });

});


const fileNameRegex = /^[a-zA-Z0-9._-]+$/;

describe("validate file names", () => {
  it("should validate all file names", async () => {
    const files = await glob("types/**", { absolute: true, nodir: true });

    for (const filepath of files) {
      const filename = path.basename(filepath)
      if (!fileNameRegex.test(filename)) {
        assert.fail(`${filepath} is invalid`);
      }
    }
  });
});
