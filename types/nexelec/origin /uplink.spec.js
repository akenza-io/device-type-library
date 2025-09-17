// IMPORTANT NOTE: The sample payloads used in this tests suite are fabricated and do not represent real device data. 
const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Nexelec Origin uplink", () => {
    let systemSchema = null;
    let lifecycleSchema = null;
    let defaultSchema = null;
    let datalogSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);

        [systemSchema, lifecycleSchema, defaultSchema, datalogSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/system.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/datalog.schema.json`),
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
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data);
                assert.equal(value.data.productType, "ORIGIN+");
                utils.validateSchema(value.data, systemSchema, { throwError: true });
            });

            // datalog
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "datalog");
                assert.isObject(value.data);
                assert.equal(value.data.totalMeasurements, 18);
                assert.equal(value.data.samplingPeriod, 30);
                assert.equal(value.data.repetitionsInMessage, 3);

                utils.validateSchema(value.data, datalogSchema, { throwError: true });
            });

            // default
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.2);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.2);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23.1);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 23);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
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

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data)
                assert.equal(value.data.productType, "ORIGIN+")
                assert.equal(value.data.hardwareVersion, 1)
                assert.equal(value.data.softwareVersion, "1.0")
                assert.equal(value.data.magneticBaseDetection, "MAGNETIC_BASE_NEVER_DETECTED")
                utils.validateSchema(value.data, systemSchema, { throwError: true });
            })
            // lifecycle
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.isObject(value.data);
                assert.equal(value.data.remainingProductLife, 113);
                assert.equal(value.data.smokeSensorStatus, "OK");
                assert.equal(value.data.tempHumSensorStatus, "OK");
                assert.equal(value.data.batteryLevel, 100);
                assert.equal(value.data.batteryVoltage, 3055);

                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        })


    });
});
