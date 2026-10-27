
import bits from "bits";
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino SE0X-LB Uplink", () => {
    let defaultSchema = null;
    let rawSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      rawSchema = loadSchema(`${import.meta.dirname}/raw.schema.json`);
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    });


    describe("consume()", () => {
        it("should decode the Dragino S31LB-LS on port 2", () => {
            const data = {
                data: {
                    port: 2,
                    payloadHex: "0CAE0CCC8F0000183E045F000009EC000000000aEC00000008e80000",
                },
            };

            expectSample("raw", rawSchema, (data) => {
                assert.equal(data.rawSoilConductivity1, 1119);
                assert.equal(data.rawSoilConductivity2, 0);
                assert.equal(data.rawSoilConductivity3, 0);
                assert.equal(data.rawSoilConductivity4, 0);

                assert.equal(data.soilDielectricConstant1, 0);
                assert.equal(data.soilDielectricConstant2, 0);
                assert.equal(data.soilDielectricConstant3, 0);
                assert.equal(data.soilDielectricConstant4, 0.8);

                assert.equal(data.rawSoilHumidity1, 6206);
                assert.equal(data.rawSoilHumidity2, 2540);
                assert.equal(data.rawSoilHumidity3, 2796);
                assert.equal(data.rawSoilHumidity4, 59392);
            });

            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.batteryVoltage, 3.246);
                assert.equal(data.batteryLevel, 70);
            });

            consume(data);
        });
    });
});