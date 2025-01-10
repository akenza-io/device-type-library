const fs = require("fs");
const chai = require("chai");
const request = require("sync-request");
const { Validator } = require("jsonschema");

try {
  require("dotenv").config();
} catch (ex) {
  console.log("No dotenv file");
}

const { assert } = chai;
const bits = require("bits");
const hex = require("hex"); // hex

exports.loadSchema = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, fileContents) => {
      if (err) reject(err);
      const schema = JSON.parse(fileContents);
      resolve(schema);
    });
  });

let expectations = [];
exports.expectEmits = (callback) => {
  expectations.push((type, value) => {
    callback(type, value);
  });
};

exports.init = (script) => {
  expectations = [];
  emits = [];
  const consume = (event) => {
    script.__get__("consume")(event);
    return emits;
  };
  let nExpectation = 0;

  script.__set__({
    Bits: bits,
    Hex: hex,
    emit(type, value) {
      if (nExpectation >= expectations.length) {
        throw new Error("not enough expecatations provided");
      }

      expectations[nExpectation](type, value);
      nExpectation += 1;
      emits.push([type, value]);
    },
  });

  return (event) => {
    if (expectations.length <= 0) {
      throw new Error("at least one expectation must be set");
    }

    if (process.env.TEST_MODE === "INTEGRATION") {
      console.log("running in integration mode: calling script runner");
      // call script runner and feed results into callbacks
      const apiKey = process.env.API_KEY;

      const scriptPath = getCallerFile().replace(".spec", "");
      const src = fs.readFileSync(scriptPath, "utf8");
      const payload = {
        event,
        script: src,
      };
      const res = request("POST", process.env.SCRIPT_RUN_URL, {
        json: payload,
        headers: { "x-api-key": apiKey },
      });
      const results = JSON.parse(res.getBody("utf8"));
      results.forEach((result) => {
        expectations[nExpectation](result.type.toLowerCase(), result.event);
        nExpectation += 1;
      });

      return results; // TODO
    }
    return consume(event);


    assert.equal(
      nExpectation,
      expectations.length,
      "number of expected emits not reached",
    );
  };
};

const schemaCache = {};

function getMeasurementType(schema, path) {
  let measurementType = schema;
  const arr = path.split(".").filter((key) => key !== "");
  while (arr.length) {
    const key = arr.shift();
    if (measurementType[key] !== undefined) {
      measurementType = measurementType[key];
    } else {
      throw `${path} not present in schema`;
    }
  }
  return measurementType;
}

function loadRemoteSchema(uri) {
  const uriParts = uri.split("#");
  const schemaUri = uriParts[0];
  const schemaPath = uriParts[1];

  let schema;
  if (schemaCache[schemaUri] !== undefined) {
    schema = schemaCache[schemaUri];
  } else {
    const res = request("GET", uri);
    schema = JSON.parse(res.getBody("utf8"));
    schemaCache[schemaUri] = schema;
  }

  const paths = schemaPath.replace(/\//gi, ".");
  return getMeasurementType(schema, paths);
}

// Validates the schema and checks for missing schema keys
exports.validateSchema = (data, schema, throwError) => {
  const v = new Validator();
  v.addSchema(schema);

  let nextSchema = v.unresolvedRefs.shift();
  while (nextSchema !== undefined) {
    const schema = loadRemoteSchema(nextSchema);
    schema.$id = nextSchema;
    v.addSchema(schema, nextSchema);
    nextSchema = v.unresolvedRefs.shift();
  }

  const res = v.validate(data, schema, throwError);
  console.log(`validation result ${res}`);

  const dataKeys = Object.keys(data);
  const schemaKeys = Object.keys(schema.properties);
  const missingKeys = dataKeys.filter((x) => !schemaKeys.includes(x));
  if (missingKeys.length > 0) {
    throw new Error(`Missing keys in schema ${schema.title}: ${missingKeys}`);
  }
};

// nodejs is caching the module.parent.filename value, meaning each time module.parent.filename is accessed
// the value will be the caller which first called the function... this (officially) calls for a workaround according to https://github.com/nodejs/node-v0.x-archive/issues/6149
// more explanation and the solution used here can be found at https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
function getCallerFile() {
  let filename;
  const _pst = Error.prepareStackTrace;

  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };

  try {
    const err = new Error();
    let callerfile;
    const currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if (currentfile !== callerfile) {
        filename = callerfile;

        break;
      }
    }
  } catch (err) { }
  Error.prepareStackTrace = _pst;

  return filename;
}
