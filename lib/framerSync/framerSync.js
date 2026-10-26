import { connect } from "framer-api";
import { glob } from "glob";
import { promises } from "fs";
import path from "path";

const fsp = promises;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")   // spaces, dots, symbols → "-"
    .replace(/^-+|-+$/g, ""); // Uses slug as a semi-hard reference
}

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

async function getAndPrepareCollection(framer, collectionId) {
  const collection = await framer.getCollection(collectionId);
  const fields = await collection.getFields();
  const translationTable = {};
  for (const field of fields) {
    translationTable[field.name] = field;
  }

  const items = await collection.getItems();
  const sortedItems = {};

  // Change structure for easier manipulation
  for (const item of items) {
    let { slug } = item;
    sortedItems[slug] = JSON.parse(JSON.stringify(item)); // Remove references to edit it
  }

  return [collection, sortedItems, translationTable, []];
}

async function updateLinkedReferences(collection, sortedItems, translationTable, toCheck) {
  const toDelete = [];
  const toCreate = [];
  toCheck.forEach(value => {
    let slug = slugify(value);
    if (sortedItems[slug] == undefined && slug !== "") {
      let newEntry = {
        "slug": slug,
        "fieldData": {}
      };
      newEntry.fieldData[translationTable["Title"].id] = {
        type: translationTable["Title"].type,
        value: value
      };

      toCreate.push(newEntry);
    } else {
      delete sortedItems[slug];
    }
  });

  // Remove leftover entries which do not corespond with any reference
  for (const [key, item] of Object.entries(sortedItems)) {
    toDelete.push(item.id);
  }
  await collection.removeItems(toDelete);

  // Add new items
  await collection.addItems(toCreate);
  return;
}

// These 4 Collections are linked
let [mainCollection, mainSortedItems, mainTranslationTable, mainToUpdateOrCreate] = await getAndPrepareCollection(framer, process.env.COLLECTION_ID); // Main table
let [connectivityCollection, connectivitySortedItems, connectivityTranslationTable, connectivityToCheck] = await getAndPrepareCollection(framer, mainTranslationTable["Connectivity"].collectionId);
let [useCasesCollection, useCasesSortedItems, useCasesTranslationTable, useCasesToCheck] = await getAndPrepareCollection(framer, mainTranslationTable["UseCases"].collectionId);
let [manufacturerCollection, manufacturerSortedItems, manufacturerTranslationTable, manufacturerToCheck] = await getAndPrepareCollection(framer, mainTranslationTable["Manufacturer"].collectionId);

// Loop over each meta file
const files = await glob("types/*/*/meta.json", { absolute: true });
for await (const filepath of files) {
  const fileContents = await fsp.readFile(filepath, "utf8");
  const schema = JSON.parse(fileContents);
  const mainSlug = slugify(schema.name + " " + schema.manufacturer);
  const connectivitySlug = slugify(schema.connectivity);
  !connectivityToCheck.includes(schema.connectivity) && connectivityToCheck.push(schema.connectivity); // Save references for later
  const manufacturerSlug = slugify(schema.manufacturer);
  !manufacturerToCheck.includes(schema.manufacturer) && manufacturerToCheck.push(schema.manufacturer); // Save references for later
  let useCasesSlugs = [];
  schema.useCases.forEach(usecase => {
    useCasesSlugs.push(slugify(usecase));
    !useCasesToCheck.includes(usecase) && useCasesToCheck.push(usecase); // Save references for later
  });


  // Update existing entry
  if (mainSortedItems[mainSlug] !== undefined) {
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Name"].id].value = schema.name;
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Manufacturer"].id].value = manufacturerSlug;
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["DescriptionURL"].id].value = schema.url;
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Description"].id].value = schema.description;
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Sensors"].id].value = Array.isArray(schema.availableSensors) ? schema.availableSensors.join(", ") : schema.availableSensors ?? ""; // Space is intentional for better readability on the website
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["UseCases"].id].value = useCasesSlugs;
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Keywords"].id].value = Array.isArray(schema.keywords) ? schema.keywords.join(",") : schema.keywords ?? "";
    mainSortedItems[mainSlug].fieldData[mainTranslationTable["Connectivity"].id].value = connectivitySlug;

    mainSortedItems[mainSlug].fieldData[mainTranslationTable["PictureUrl"].id].value = await getPictureUrl(filepath);

    mainToUpdateOrCreate.push(mainSortedItems[mainSlug]);
    delete mainSortedItems[mainSlug];

    // Create new entry
  } else {
    let newEntry = {
      "slug": mainSlug,
      "fieldData": {}
    };

    newEntry.fieldData[mainTranslationTable["Name"].id] = {
      type: mainTranslationTable["Name"].type,
      value: schema.name
    };
    newEntry.fieldData[mainTranslationTable["Manufacturer"].id] = {
      type: mainTranslationTable["Manufacturer"].type,
      value: manufacturerSlug
    };
    newEntry.fieldData[mainTranslationTable["DescriptionURL"].id] = {
      type: mainTranslationTable["DescriptionURL"].type,
      value: schema.url
    };
    newEntry.fieldData[mainTranslationTable["Description"].id] = {
      type: mainTranslationTable["Description"].type,
      value: schema.description
    };
    newEntry.fieldData[mainTranslationTable["Sensors"].id] = {
      type: mainTranslationTable["Sensors"].type,
      value: Array.isArray(schema.availableSensors)
        ? schema.availableSensors.join(", ")
        : schema.availableSensors ?? ""
    }; // Space is intentional for better readability on the website
    newEntry.fieldData[mainTranslationTable["UseCases"].id] = {
      type: mainTranslationTable["UseCases"].type,
      value: useCasesSlugs
    };
    newEntry.fieldData[mainTranslationTable["Keywords"].id] = {
      type: mainTranslationTable["Keywords"].type,
      value: Array.isArray(schema.keywords)
        ? schema.keywords.join(",")
        : schema.keywords ?? ""
    };
    newEntry.fieldData[mainTranslationTable["Connectivity"].id] = {
      type: mainTranslationTable["Connectivity"].type,
      value: connectivitySlug
    };
    newEntry.fieldData[mainTranslationTable["PictureUrl"].id] = {
      type: mainTranslationTable["PictureUrl"].type,
      value: await getPictureUrl(filepath)
    };
    mainToUpdateOrCreate.push(newEntry);
  }
}

// Update linked tables first with new values
await updateLinkedReferences(connectivityCollection, connectivitySortedItems, connectivityTranslationTable, connectivityToCheck);
await updateLinkedReferences(useCasesCollection, useCasesSortedItems, useCasesTranslationTable, useCasesToCheck);
await updateLinkedReferences(manufacturerCollection, manufacturerSortedItems, manufacturerTranslationTable, manufacturerToCheck);

// Load references again, if one has been created a new id is needed to link
connectivitySortedItems = (await getAndPrepareCollection(framer, mainTranslationTable["Connectivity"].collectionId))[1];
useCasesSortedItems = (await getAndPrepareCollection(framer, mainTranslationTable["UseCases"].collectionId))[1];
manufacturerSortedItems = (await getAndPrepareCollection(framer, mainTranslationTable["Manufacturer"].collectionId))[1];

// Remove leftover entries which do not corespond with any metafile
const toDelete = [];
for (const [mainSlug, item] of Object.entries(mainSortedItems)) {
  toDelete.push(item.id);
}
await mainCollection.removeItems(toDelete);

// Rewrite slugs to their actual id references
mainToUpdateOrCreate.forEach(device => {
  device.fieldData[mainTranslationTable["Connectivity"].id].value = connectivitySortedItems[device.fieldData[mainTranslationTable["Connectivity"].id].value].id;
  device.fieldData[mainTranslationTable["Manufacturer"].id].value = manufacturerSortedItems[device.fieldData[mainTranslationTable["Manufacturer"].id].value].id;
  for (let i = 0; i < device.fieldData[mainTranslationTable["UseCases"].id].value.length; i++) {
    device.fieldData[mainTranslationTable["UseCases"].id].value[i] = useCasesSortedItems[device.fieldData[mainTranslationTable["UseCases"].id].value[i]].id;
  }
});

// Update or create new items
await mainCollection.addItems(mainToUpdateOrCreate);

await framer.disconnect() // Kill stream

console.log("Everything updated")