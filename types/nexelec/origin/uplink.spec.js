import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Nexelec Origin uplink", () => {
    let systemSchema = null;
    let lifecycleSchema = null;
    let defaultSchema = null;
    let datalogSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire(`${__dirname}/uplink.js`);
        consume = init(script);

        [systemSchema, lifecycleSchema, defaultSchema, datalogSchema] = await Promise.all([
            loadSchema(`${__dirname}/system.schema.json`),
            loadSchema(`${__dirname}/lifecycle.schema.json`),
            loadSchema(`${__dirname}/default.schema.json`),
            loadSchema(`${__dirname}/datalog.schema.json`),
        ])

    });


    describe("consume()", () => {
        it("decodes datalog event", () => {
            const data = {
                data: {
                    port: 56,
                    payloadHex: "b105487838521484e1384e1384e1284a1284a1284a1284a1284a12",
                },
            };

            // system
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data);
                assert.equal(value.data.productType, "ORIGIN+");
                validateSchema(value.data, systemSchema, { throwError: true });
            });

            // datalog
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "datalog");
                assert.isObject(value.data);
                assert.equal(value.data.totalMeasurements, 18);
                assert.equal(value.data.samplingPeriod, 30);
                assert.equal(value.data.repetitionsInMessage, 3);

                validateSchema(value.data, datalogSchema, { throwError: true });
            });

            // default
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.2);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.2);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });

            consume(data);
        });

        it("decodes system event", () => {
            const data = {
                data: {
                    port: 56,
                    payloadHex: "b100010a7130d3",
                }
            }

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data)
                assert.equal(value.data.productType, "ORIGIN+")
                assert.equal(value.data.hardwareVersion, 1)
                assert.equal(value.data.softwareVersion, "1.0")
                assert.equal(value.data.magneticBaseDetection, "MAGNETIC_BASE_NEVER_DETECTED")
                validateSchema(value.data, systemSchema, { throwError: true });
            })
            // lifecycle
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.isObject(value.data);
                assert.equal(value.data.remainingProductLife, 113);
                assert.equal(value.data.smokeSensorStatus, "OK");
                assert.equal(value.data.tempHumSensorStatus, "OK");
                assert.equal(value.data.batteryLevel, 100);
                assert.equal(value.data.batteryVoltage, 3055);

                validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        })


    });
});
