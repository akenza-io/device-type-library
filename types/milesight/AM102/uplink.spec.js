const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight AM102 Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let systemSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, lifecycleSchema, systemSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/system.schema.json`),
        ]);
    });

    describe("consume()", () => {
        it("should decode the basic information payload from the user guide", () => {
            const data = {
                data: {
                    // Payload from Section 6.1 of the User Guide
                    payloadHex: "ff0bff166710b32620711912ff090100ff0a0101ff180013",
                    port: 85,
                },
            };

            // The decoder should emit a single 'system' sample
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.deepEqual(value.data, {
                    deviceStatus: "on",
                    sn: "6710b32620711912",
                    hardwareVersion: "v1.0",
                    firmwareVersion: "v1.1",
                    temperatureEnabled: true,
                    humidityEnabled: true,
                });
                utils.validateSchema(value.data, systemSchema, { throwError: true });
            });

            consume(data);
        });

        it("should decode the periodic sensor data payload from the user guide", () => {
            const data = {
                data: {
                    // Payload from Section 6.2, Example 1 of the User Guide
                    payloadHex: "0175640367ff0004684f",
                    port: 85,
                },
            };

            // Expect the 'default' topic for sensor readings
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.deepEqual(value.data, {
                    temperature: 25.5,
                    humidity: 39.5,
                });
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            // Expect the 'lifecycle' topic for the battery level
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.deepEqual(value.data, {
                    batteryLevel: 100,
                });
                utils.validateSchema(value.data, lifecycleSchema, {
                    throwError: true,
                });
            });

            consume(data);
        });

        it("should decode the historical data payload from the user guide", () => {
            const data = {
                data: {
                    // Payload from Section 6.4, Reply Example (AM102 part only)
                    payloadHex: "20ce5c44ec63d30059",
                    port: 85,
                },
            };

            // Historical data is emitted on the 'default' topic with a specific timestamp
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.deepEqual(value.data, {
                    temperature: 21.1,
                    humidity: 44.5,
                });
                // The timestamp in the PDF (63ec445c) corresponds to 2023-02-15 10:33:00
                assert.equal(
                    value.timestamp.toISOString(),
                    "2023-02-15T10:33:00.000Z",
                );
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            consume(data);
        });
    });
});
