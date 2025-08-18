// test script for uplink.js decoder
const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");
const { assert } = chai;

describe("Dragino S31LB-LS Uplink", () => {  // Group of related tests
    // Setup code runs before tests
    let defaultSchema = null;
    let lifecycleSchema = null;
    let configSchema = null;
    let consume = null;

    // load schemas and consume function
    before(async () => {
        // Load schemas and prepare test environment
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, lifecycleSchema, configSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/config.schema.json`),
        ]);
    });


    describe("consume()", () => {
        it("should decode the Dragino S31LB-LS lifecycle report uplink", () => {
            const data = {
                data: {
                    port: 5,
                    payloadHex: "0A010001000E10",
                },
            };

            // lifecycle test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.6);
                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            // config test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "config");
                assert.equal(value.data.sensorModel, "S31-LB/LS");
                assert.equal(value.data.firmwareVersion, "1.0.0");
                assert.equal(value.data.freqencyBand, "EU868");
                assert.equal(value.data.subBand, "0");


                utils.validateSchema(value.data, configSchema, { throwError: true });
            });

            consume(data);

        });

        it("should decode the Dragino S31LB-LS default report uplink", () => {
            const data = {
                data: {
                    port: 2,
                    payloadHex: "0e1c68a2ef9b0001130191",
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.alarmFlag, false);
                assert.equal(value.data.pa8, "High");
                assert.equal(value.data.temperature, 27.5);
                assert.equal(value.data.humidity, 40.1);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            // lifecycle test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.612);
                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        });

        it("should decode the Dragino S31LB-LS default report uplink", () => {
            const data = {
                data: {
                    port: 3,
                    payloadHex: "0000025D00E14266C1A420",
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.alarmFlag, false);
                assert.equal(value.data.pa8, "High");
                assert.equal(value.data.temperature, 22.5);
                assert.equal(value.data.humidity, 60.5);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            consume(data);
        });
    });
});