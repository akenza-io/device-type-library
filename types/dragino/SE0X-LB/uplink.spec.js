const chai = require("chai");
const bits = require("bits");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Dragino SE0X-LB Uplink", () => {
    let defaultSchema = null;
    let rawSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [rawSchema, defaultSchema, lifecycleSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/raw.schema.json`),
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
        ]);
    });


    describe("consume()", () => {
        it("should decode the Dragino S31LB-LS on port 2", () => {
            const data = {
                data: {
                    port: 2,
                    payloadHex: "0CAE0CCC8F0000183E045F000009EC000000000aEC00000008e80000",
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "raw");
                assert.equal(value.data.rawSoilConductivity1, 1119);
                assert.equal(value.data.rawSoilConductivity2, 0);
                assert.equal(value.data.rawSoilConductivity3, 0);
                assert.equal(value.data.rawSoilConductivity4, 0);

                assert.equal(value.data.soilDielectricConstant1, 0);
                assert.equal(value.data.soilDielectricConstant2, 0);
                assert.equal(value.data.soilDielectricConstant3, 0);
                assert.equal(value.data.soilDielectricConstant4, 0.8);

                assert.equal(value.data.rawSoilHumidity1, 6206);
                assert.equal(value.data.rawSoilHumidity2, 2540);
                assert.equal(value.data.rawSoilHumidity3, 2796);
                assert.equal(value.data.rawSoilHumidity4, 59392);

                utils.validateSchema(value.data, rawSchema, { throwError: true });
            });

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.246);
                assert.equal(value.data.batteryLevel, 70);
                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        });
    });
});