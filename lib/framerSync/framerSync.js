import { connect } from "framer-api";
import { glob } from "glob";
import { promises } from "fs";
import path from "path";

const fsp = promises;

async function getPictureUrl(filepath) {
  const dir = path.dirname(filepath);
  const files = await fsp.readdir(dir);

  const image = files.find((file) => /\.(png|jpe?g)$/i.test(file));
  if (!image) return undefined;

  const localUri = path.join(dir, image).split(path.sep).join("/");
  const match = localUri.match(/types\/.*$/);
  return match ? process.env.BASE_URL + match[0] : undefined;
}

const framer = await connect(
  "https://framer.com/projects/" + process.env.PROJECT_ID,
  process.env.FRAMER_API_KEY
);

const collection = await framer.getCollection(process.env.COLLECTION_ID);
const fields = await collection.getFields();
const translationTable = {};
for await (const field of fields) {
  translationTable[field.name] = field;
}

const items = await collection.getItems();
const sortedItems = {};
const toUpdateOrCreate = []; // Its the same function

// Change structure for easier manipulation
for await (const item of items) {
  let { slug } = item;
  sortedItems[slug] = JSON.parse(JSON.stringify(item)); // Remove references to edit it
}

// Loop over each meta
const files = await glob("types/*/*/meta.json", { absolute: true });
for await (const filepath of files) {
  const fileContents = await fsp.readFile(filepath, "utf8");
  const schema = JSON.parse(fileContents);
  const slug = `${schema.name} ${schema.manufacturer}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")   // spaces, dots, symbols → "-"
    .replace(/^-+|-+$/g, ""); // Uses slug as a semi-hard reference

  // Update existing entry
  if (sortedItems[slug] !== undefined) {
    sortedItems[slug].fieldData[translationTable["Name"].id].value = schema.name;
    sortedItems[slug].fieldData[translationTable["Manufacturer"].id].value = schema.manufacturer;
    sortedItems[slug].fieldData[translationTable["DescriptionURL"].id].value = schema.url;
    sortedItems[slug].fieldData[translationTable["Description"].id].value = schema.description;
    sortedItems[slug].fieldData[translationTable["Sensors"].id].value = Array.isArray(schema.availableSensors) ? schema.availableSensors.join(",") : schema.availableSensors ?? "";
    sortedItems[slug].fieldData[translationTable["UseCases"].id].value = Array.isArray(schema.useCases) ? schema.useCases.join(",") : schema.useCases ?? "";
    sortedItems[slug].fieldData[translationTable["Keywords"].id].value = Array.isArray(schema.keywords) ? schema.keywords.join(",") : schema.keywords ?? "";
    sortedItems[slug].fieldData[translationTable["Connectivity"].id].value = schema.connectivity;
    sortedItems[slug].fieldData[translationTable["PictureUrl"].id].value = await getPictureUrl(filepath);

    toUpdateOrCreate.push(sortedItems[slug]);
    delete sortedItems[slug];

    // Create new entry
  } else {
    let newEntry = {
      "slug": slug,
      "fieldData": {}
    };

    newEntry.fieldData[translationTable["Name"].id] = {
      type: translationTable["Name"].type,
      value: schema.name
    };
    newEntry.fieldData[translationTable["Manufacturer"].id] = {
      type: translationTable["Manufacturer"].type,
      value: schema.manufacturer
    };
    newEntry.fieldData[translationTable["DescriptionURL"].id] = {
      type: translationTable["DescriptionURL"].type,
      value: schema.url
    };
    newEntry.fieldData[translationTable["Description"].id] = {
      type: translationTable["Description"].type,
      value: schema.description
    };
    newEntry.fieldData[translationTable["Sensors"].id] = {
      type: translationTable["Sensors"].type,
      value: Array.isArray(schema.availableSensors)
        ? schema.availableSensors.join(",")
        : schema.availableSensors ?? ""
    };
    newEntry.fieldData[translationTable["UseCases"].id] = {
      type: translationTable["UseCases"].type,
      value: Array.isArray(schema.useCases)
        ? schema.useCases.join(",")
        : schema.useCases ?? ""
    };
    newEntry.fieldData[translationTable["Keywords"].id] = {
      type: translationTable["Keywords"].type,
      value: Array.isArray(schema.keywords)
        ? schema.keywords.join(",")
        : schema.keywords ?? ""
    };
    newEntry.fieldData[translationTable["Connectivity"].id] = {
      type: translationTable["Connectivity"].type,
      value: schema.connectivity
    };
    newEntry.fieldData[translationTable["PictureUrl"].id] = {
      type: translationTable["PictureUrl"].type,
      value: await getPictureUrl(filepath)
    };
    toUpdateOrCreate.push(newEntry);
  }
}

// Remove leftover entries which do not corespond with any metafile
const toDelete = [];
for await (const [slug, item] of Object.entries(sortedItems)) {
  toDelete.push(item.id);
}
await collection.removeItems(toDelete);

// Update or create new items
await collection.addItems(toUpdateOrCreate);
await framer.disconnect() // Kill stream

console.log("Everything updated")