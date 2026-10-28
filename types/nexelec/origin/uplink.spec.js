import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Nexelec Origin uplink", () => {
    let systemSchema = null;
    let lifecycleSchema = null;
    let temperatureSchema = null;
    let datalogSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
      datalogSchema = loadSchema(`${import.meta.dirname}/datalog.schema.json`);
    });


    describe("consume()", () => {
        it("decodes datalog event", () => {
            const data = {
                timestamp: new Date().getTime() / 1000,
                data: {
                    port: 56,
                    payloadHex: "b105487838521484e1384e1384e1284a1284a1284a1284a1284a12",
                },
            };

            // system
            expectSample("system", systemSchema, (data) => {
                assert.equal(data.productType, "ORIGIN+");
            });

            // datalog
            expectSample("datalog", datalogSchema, (data) => {
                assert.equal(data.totalMeasurements, 18);
                assert.equal(data.samplingPeriod, 30);
                assert.equal(data.repetitionsInMessage, 3);
            });

            // temperature (historical)
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.2);
            });

            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.2);
            });

            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.1);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.1);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.1);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.1);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23.1);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });
            expectSample("temperature", temperatureSchema, (data) => {
                assert.equal(data.temperature, 23);
            });

            consume(data);
        });

        it("decodes system event", () => {
            const data = {
                timestamp: new Date().toISOString(),
                data: {
                    port: 56,
                    payloadHex: "b100010a7130d3",
                }
            }

            expectSample("system", systemSchema, (data) => {
                assert.equal(data.productType, "ORIGIN+")
                assert.equal(data.hardwareVersion, 1)
                assert.equal(data.softwareVersion, "1.0")
                assert.equal(data.magneticBaseDetection, "MAGNETIC_BASE_NEVER_DETECTED")
            })
            // lifecycle
            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.remainingProductLife, 113);
                assert.equal(data.smokeSensorStatus, "OK");
                assert.equal(data.tempHumSensorStatus, "OK");
                assert.equal(data.batteryLevel, 100);
                assert.equal(data.batteryVoltage, 3055);
            });

            consume(data);
        })


    });
});
