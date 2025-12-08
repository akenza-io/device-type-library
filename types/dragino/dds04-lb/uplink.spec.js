import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino dds04-lb Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    beforeEach(async () => {
        const script = rewire(`${__dirname}/uplink.js`);
        consume = init(script);
        [defaultSchema, lifecycleSchema] = await Promise.all([
            loadSchema(`${__dirname}/default.schema.json`),
            loadSchema(`${__dirname}/lifecycle.schema.json`),
        ]);
    });

    describe("consume()", () => {
        it("should decode the Dragino dds04-lb uplink default uplink", () => {
            const data = {
                data: {
                    payloadHex: "0D4A03160318031A031501",
                    port: 2,
                },
            };

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.data.interruptFlag, false);
                assert.equal(value.data.interruptLevel, "LOW");
                assert.equal(value.data.distance1, 79);
                assert.equal(value.data.distance2, 79.2);
                assert.equal(value.data.distance3, 79.4);
                assert.equal(value.data.distance4, 78.9);
                assert.equal(value.data.messageType, 1);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.402);

                validateSchema(value.data, lifecycleSchema, {
                    throwError: true,
                });
            });

            consume(data);
        });
    });
    describe("consume()", () => {
        it("should decode the Dragino dds04-lb uplink datalog", () => {
            const data = {
                data: {
                    payloadHex: "4301BB0BED0BFE64CCC6A44001BE0B5B0D3164CCC6C04001BE0B550C0264CCC6FC4101BE0B4E0BFD64CCC7174001BE0BF40BF764CCC761",
                    port: 3,
                },
            };


            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:36:36.000Z");
                assert.equal(value.data.interruptFlag, true);
                assert.equal(value.data.interruptLevel, "HIGH");
                assert.equal(value.data.pnackMd, false);
                assert.equal(value.data.distance1, 44.3);
                assert.equal(value.data.distance2, 305.3);
                assert.equal(value.data.distance3, 307);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:37:04.000Z");
                assert.equal(value.data.interruptFlag, false);
                assert.equal(value.data.interruptLevel, "LOW");
                assert.equal(value.data.pnackMd, false);
                assert.equal(value.data.distance1, 44.6);
                assert.equal(value.data.distance2, 290.7);
                assert.equal(value.data.distance3, 337.7);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:38:04.000Z");
                assert.equal(value.data.interruptFlag, false);
                assert.equal(value.data.interruptLevel, "LOW");
                assert.equal(value.data.pnackMd, false);
                assert.equal(value.data.distance1, 44.6);
                assert.equal(value.data.distance2, 290.1);
                assert.equal(value.data.distance3, 307.4);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:38:31.000Z");
                assert.equal(value.data.interruptFlag, true);
                assert.equal(value.data.interruptLevel, "LOW");
                assert.equal(value.data.pnackMd, false);
                assert.equal(value.data.distance1, 44.6);
                assert.equal(value.data.distance2, 289.4);
                assert.equal(value.data.distance3, 306.9);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");
                assert.equal(value.topic, "default");
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:39:45.000Z");
                assert.equal(value.data.interruptFlag, false);
                assert.equal(value.data.interruptLevel, "LOW");
                assert.equal(value.data.pnackMd, false);
                assert.equal(value.data.distance1, 44.6);
                assert.equal(value.data.distance2, 306);
                assert.equal(value.data.distance3, 306.3);

                validateSchema(value.data, defaultSchema, {
                    throwError: true,
                });
            });

            consume(data);
        });
    });
});
