import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Advantech WISE2410 uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let climateSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      climateSchema = loadSchema(`${import.meta.dirname}/climate.schema.json`);
    });

    describe("consume()", () => {
        it("should decode the WISE2410 data report and emit correct samples", () => {
            const data = {
                data: {
                    port: 1,
                    payloadHex: "817858500807000000b45f00005441e2ff00000700050004000600ad0202000000010000000700050004004300f9001000000001000000080005000400fcff5002fcff000002000300000000244d905c60091b0002f00d254d905c58",
                },
            };

            expectSample("climate", climateSchema, (data) => {
                assert.equal(data.temperature, 24.50);
            });


            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.deviceEvent, 0);
                assert.equal(data.batteryVoltage, 3.568);
                assert.equal(data.batteryLevel, 84);
                assert.equal(data.powerSource, "BATTERY");
            });

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.sensorEventX, 0);
                assert.equal(data.velocityRmsX, 0.07);
                assert.equal(data.accelerationPeakX, 0.005);
                assert.equal(data.accelerationRmsX, 0.004);
                assert.equal(data.kurtosisX, 0.06);
                assert.equal(data.crestFactorX, 6.85);
                assert.equal(data.skewnessX, 0.02);
                assert.equal(data.standardDeviationX, 0);
                assert.equal(data.displacementX, 1);
                assert.equal(data.sensorEventY, 0);
                assert.equal(data.velocityRmsY, 0.07);
                assert.equal(data.accelerationPeakY, 0.005);
                assert.equal(data.accelerationRmsY, 0.004);
                assert.equal(data.kurtosisY, 0.67);
                assert.equal(data.crestFactorY, 2.49);
                assert.equal(data.skewnessY, 0.16);
                assert.equal(data.standardDeviationY, 0);
                assert.equal(data.displacementY, 1);
                assert.equal(data.sensorEventZ, 0);
                assert.equal(data.velocityRmsZ, 0.08);
                assert.equal(data.accelerationPeakZ, 0.005);
                assert.equal(data.accelerationRmsZ, 0.004);
                assert.equal(data.kurtosisZ, -0.04);
                assert.equal(data.crestFactorZ, 5.92);
                assert.equal(data.skewnessZ, -0.04);
                assert.equal(data.standardDeviationZ, 0);
                assert.equal(data.displacementZ, 2);
            });
            consume(data);
        });

        it("should decode the WISE2410 with powerline connection", () => {
            const data = {
                data: {
                    port: 1,
                    payloadHex: "818D4E5007060000B45F00005538E2FF000014001E001500F4FF67012E00180006000000150020001700E6FF8E0226001A00040000001B0026001B000000000000000000000060091B0001000047D7895CF0",
                },
            };

            expectSample("climate", climateSchema, (data) => {
                assert.equal(data.temperature, 24.50);
            });


            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.deviceEvent, 0);
                assert.equal(data.powerSource, "POWER_LINE");
            });

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.sensorEventX, 0);
                assert.equal(data.velocityRmsX, 0.2);
                assert.equal(data.accelerationPeakX, 0.3);
                assert.equal(data.accelerationRmsX, 0.21);
                assert.equal(data.kurtosisX, -0.12);
                assert.equal(data.crestFactorX, 3.59);
                assert.equal(data.skewnessX, 0.46);
                assert.equal(data.standardDeviationX, 0.24);
                assert.equal(data.displacementX, 6);
                assert.equal(data.sensorEventY, 0);
                assert.equal(data.velocityRmsY, 0.21);
                assert.equal(data.accelerationPeakY, 0.32);
                assert.equal(data.accelerationRmsY, 0.23);
                assert.equal(data.kurtosisY, -0.26);
                assert.equal(data.crestFactorY, 6.54);
                assert.equal(data.skewnessY, 0.38);
                assert.equal(data.standardDeviationY, 0.26);
                assert.equal(data.displacementY, 4);
                assert.equal(data.sensorEventZ, 0);
                assert.equal(data.velocityRmsZ, 0.27);
                assert.equal(data.accelerationPeakZ, 0.38);
                assert.equal(data.accelerationRmsZ, 0.27);
                assert.equal(data.kurtosisZ, 0);
                assert.equal(data.crestFactorZ, 0);
                assert.equal(data.skewnessZ, 0);
                assert.equal(data.standardDeviationZ, 0);
                assert.equal(data.displacementZ, 0);
            });

            consume(data);



        });
    });

});