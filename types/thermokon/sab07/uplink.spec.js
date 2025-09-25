
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Thermokon SAB07 Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let actuatorSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire(`${__dirname}/uplink.js`);
        consume = init(script);
        [defaultSchema, lifecycleSchema, actuatorSchema] = await Promise.all([
            loadSchema(`${__dirname}/default.schema.json`),
            loadSchema(`${__dirname}/lifecycle.schema.json`),
            loadSchema(`${__dirname}/actuator.schema.json`),
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

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.sensorTemperature, 24.65);
                assert.equal(value.data.relativeHumidity, 46.88);
                assert.equal(value.data.targetTemperature, 29);

                validateSchema(value.data, defaultSchema, { throwError: true });
            });


            // actuator test
            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "actuator");
                assert.equal(value.data.motorPosition, 250);
                assert.equal(value.data.motorRange, 300);
                validateSchema(value.data, actuatorSchema, { throwError: true });
            });

            // lifecycle test
            expectEmits((type, value) => {
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
                validateSchema(value.data, lifecycleSchema, { throwError: true });
            });


            consume(data);
        });

    });
});