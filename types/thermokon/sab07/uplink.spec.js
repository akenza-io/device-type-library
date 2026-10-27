
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Thermokon SAB07 Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let actuatorSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      actuatorSchema = loadSchema(`${import.meta.dirname}/actuator.schema.json`);
    });


    describe("consume()", () => {

        // keep-alive command
        it("should decode the Thermokon SAB07 uplink", () => {
            const data = {
                data: {
                    payloadHex: "811DA878FA2C01F080",
                },
            };

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.sensorTemperature, 24.65);
                assert.equal(data.relativeHumidity, 46.88);
                assert.equal(data.targetTemperature, 29);
            });


            // actuator test
            expectSample("actuator", actuatorSchema, (data) => {
                assert.equal(data.motorPosition, 250);
                assert.equal(data.motorRange, 300);
            });

            // lifecycle test
            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.batteryVoltage, 3.5);
                assert.equal(data.openWindow, false);
                assert.equal(data.highMotorConsumption, false);
                assert.equal(data.lowMotorConsumption, false);
                assert.equal(data.brokenSensor, false);
                assert.equal(data.childLock, true);
                assert.equal(data.calibrationFailed, false);
                assert.equal(data.attachedBackplate, false);
                assert.equal(data.perceiveAsOnline, false);
            });


            consume(data);
        });

    });
});