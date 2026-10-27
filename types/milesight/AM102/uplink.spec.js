
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight AM102 Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let systemSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    });

    describe("consume()", () => {
        it("should decode the basic information payload from the user guide", () => {
            const data = {
                data: {
                    payloadHex: "ff0bffff166710b32620711912ff090100ff0a0101ff180013",
                    port: 85,
                },
            };

            expectSample("system", systemSchema, (data) => {
                assert.deepEqual(data, {
                    deviceStatus: "ON",
                    sn: "6710b32620711912",
                    hardwareVersion: "v1.0",
                    firmwareVersion: "v1.1",
                    temperatureEnabled: true,
                    humidityEnabled: true,
                });
            });

            consume(data);
        });

        it("should decode the periodic sensor data payload from the user guide", () => {
            const data = {
                data: {
                    payloadHex: "0175640367ff0004684f",
                    port: 85,
                },
            };

            expectSample("default", defaultSchema, (data) => {
                assert.deepEqual(data, {
                    temperature: 25.5,
                    humidity: 39.5,
                });
            });

            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.deepEqual(data, {
                    batteryLevel: 100,
                });
            });

            consume(data);
        });

        it("should decode the historical data payload from the user guide", () => {
            const data = {
                data: {
                    payloadHex: "20ce5c44ec63d30059",
                    port: 85,
                },
            };

            // Historical data is emitted on the 'default' topic with a specific timestamp
            expectSample("default", defaultSchema, (data) => {
                assert.deepEqual(data, {
                    temperature: 21.1,
                    humidity: 44.5,
                });
            });

            consume(data);
        });
    });
});
