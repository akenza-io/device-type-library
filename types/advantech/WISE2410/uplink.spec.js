import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Advantech WISE2410 uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let climateSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire(`${__dirname}/uplink.js`);
        consume = init(script);

        [defaultSchema, lifecycleSchema, climateSchema] = await Promise.all([
            loadSchema(`${__dirname}/default.schema.json`),
            loadSchema(`${__dirname}/lifecycle.schema.json`),
            loadSchema(`${__dirname}/climate.schema.json`),
        ]);
    });

    describe("consume()", () => {
        it("should decode the WISE2410 data report and emit correct samples", () => {
            const data = {
                data: {
                    port: 1,
                    payloadHex: "817858500807000000b45f00005441e2ff00000700050004000600ad0202000000010000000700050004004300f9001000000001000000080005000400fcff5002fcff000002000300000000244d905c60091b0002f00d254d905c58",
                },
            };

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "climate");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 24.50);
                validateSchema(value.data, climateSchema, { throwError: true });
            });


            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.isObject(value.data);
                assert.equal(value.data.deviceEvent, 0);
                assert.equal(value.data.batteryVoltage, 3.568);
                assert.equal(value.data.batteryLevel, 84);
                assert.equal(value.data.powerSource, "BATTERY");
                validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.sensorEventX, 0);
                assert.equal(value.data.velocityRmsX, 0.07);
                assert.equal(value.data.accelerationPeakX, 0.005);
                assert.equal(value.data.accelerationRmsX, 0.004);
                assert.equal(value.data.kurtosisX, 0.06);
                assert.equal(value.data.crestFactorX, 6.85);
                assert.equal(value.data.skewnessX, 0.02);
                assert.equal(value.data.standardDeviationX, 0);
                assert.equal(value.data.displacementX, 1);
                assert.equal(value.data.sensorEventY, 0);
                assert.equal(value.data.velocityRmsY, 0.07);
                assert.equal(value.data.accelerationPeakY, 0.005);
                assert.equal(value.data.accelerationRmsY, 0.004);
                assert.equal(value.data.kurtosisY, 0.67);
                assert.equal(value.data.crestFactorY, 2.49);
                assert.equal(value.data.skewnessY, 0.16);
                assert.equal(value.data.standardDeviationY, 0);
                assert.equal(value.data.displacementY, 1);
                assert.equal(value.data.sensorEventZ, 0);
                assert.equal(value.data.velocityRmsZ, 0.08);
                assert.equal(value.data.accelerationPeakZ, 0.005);
                assert.equal(value.data.accelerationRmsZ, 0.004);
                assert.equal(value.data.kurtosisZ, -0.04);
                assert.equal(value.data.crestFactorZ, 5.92);
                assert.equal(value.data.skewnessZ, -0.04);
                assert.equal(value.data.standardDeviationZ, 0);
                assert.equal(value.data.displacementZ, 2);
                validateSchema(value.data, defaultSchema, { throwError: true });
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

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "climate");
                assert.isObject(value.data);
                assert.equal(value.data.temperature, 24.50);
                validateSchema(value.data, climateSchema, { throwError: true });
            });


            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.isObject(value.data);
                assert.equal(value.data.deviceEvent, 0);
                assert.equal(value.data.powerSource, "POWER_LINE");
                validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.isObject(value.data);
                assert.equal(value.data.sensorEventX, 0);
                assert.equal(value.data.velocityRmsX, 0.2);
                assert.equal(value.data.accelerationPeakX, 0.3);
                assert.equal(value.data.accelerationRmsX, 0.21);
                assert.equal(value.data.kurtosisX, -0.12);
                assert.equal(value.data.crestFactorX, 3.59);
                assert.equal(value.data.skewnessX, 0.46);
                assert.equal(value.data.standardDeviationX, 0.24);
                assert.equal(value.data.displacementX, 6);
                assert.equal(value.data.sensorEventY, 0);
                assert.equal(value.data.velocityRmsY, 0.21);
                assert.equal(value.data.accelerationPeakY, 0.32);
                assert.equal(value.data.accelerationRmsY, 0.23);
                assert.equal(value.data.kurtosisY, -0.26);
                assert.equal(value.data.crestFactorY, 6.54);
                assert.equal(value.data.skewnessY, 0.38);
                assert.equal(value.data.standardDeviationY, 0.26);
                assert.equal(value.data.displacementY, 4);
                assert.equal(value.data.sensorEventZ, 0);
                assert.equal(value.data.velocityRmsZ, 0.27);
                assert.equal(value.data.accelerationPeakZ, 0.38);
                assert.equal(value.data.accelerationRmsZ, 0.27);
                assert.equal(value.data.kurtosisZ, 0);
                assert.equal(value.data.crestFactorZ, 0);
                assert.equal(value.data.skewnessZ, 0);
                assert.equal(value.data.standardDeviationZ, 0);
                assert.equal(value.data.displacementZ, 0);
                validateSchema(value.data, defaultSchema, { throwError: true });
            });

            consume(data);



        });
    });

});