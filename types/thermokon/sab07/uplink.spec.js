// test script for uplink.js decoder
const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Thermokon SAB07 Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let actuatorSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, lifecycleSchema, actuatorSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/actuator.schema.json`),
        ]);
    });


    describe("consume()", () => {

        // keep-alive command
        it("should decode the Thermokon SAB07 uplink", () => {
            const data = {
                data: {
                    payloadHex: "811DA878FA2C01F080",
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.sensorTemperature, 24.65);
                assert.equal(value.data.relativeHumidity, 46.88);
                assert.equal(value.data.targetTemperature, 29);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });


            // actuator test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "actuator");
                assert.equal(value.data.motorPosition, 250);
                assert.equal(value.data.motorRange, 300);
                utils.validateSchema(value.data, actuatorSchema, { throwError: true });
            });

            // lifecycle test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");


                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.5);
                assert.equal(value.data.openWindow, false);
                assert.equal(value.data.highMotorConsumption, false);
                assert.equal(value.data.lowMotorConsumption, false);
                assert.equal(value.data.brokenSensor, false);
                assert.equal(value.data.childLock, true);
                assert.equal(value.data.calibrationFailed, false);
                assert.equal(value.data.attachedBackplate, false);
                assert.equal(value.data.perceiveAsOnline, false);
                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });


            consume(data);
        });

    });
});