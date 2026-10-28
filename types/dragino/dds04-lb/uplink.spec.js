import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino dds04-lb Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    before(() => {
        const script = rewire(`${import.meta.dirname}/uplink.js`);
        consume = init(script);
        defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
        lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);

        // Mock Date to a fixed point in time, only inside the decoder
        script.__set__(
            "Date",
            class extends Date {
                constructor(...args) {
                    if (args.length === 0) {
                        super("2023-08-04T10:00:00.000Z");
                    } else {
                        super(...args);
                    }
                }
            },
        );
    });

    describe("consume()", () => {
        it("should decode the Dragino dds04-lb uplink default uplink", () => {
            const data = {
                data: {
                    payloadHex: "0D4A03160318031A031501",
                    port: 2,
                },
            };

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.interruptFlag, false);
                assert.equal(data.interruptLevel, "LOW");
                assert.equal(data.distance1, 79);
                assert.equal(data.distance2, 79.2);
                assert.equal(data.distance3, 79.4);
                assert.equal(data.distance4, 78.9);
                assert.equal(data.messageType, "NORMAL_UPLINK");
            });

            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.batteryVoltage, 3.402);
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

            expectSample("default", defaultSchema, (data, value) => {
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:36:36.000Z");
                assert.equal(data.interruptFlag, true);
                assert.equal(data.interruptLevel, "HIGH");
                assert.equal(data.pnackMode, false);
                assert.equal(data.distance1, 44.3);
                assert.equal(data.distance2, 305.3);
                assert.equal(data.distance3, 307);
            });

            expectSample("default", defaultSchema, (data, value) => {
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:37:04.000Z");
                assert.equal(data.interruptFlag, false);
                assert.equal(data.interruptLevel, "LOW");
                assert.equal(data.pnackMode, false);
                assert.equal(data.distance1, 44.6);
                assert.equal(data.distance2, 290.7);
                assert.equal(data.distance3, 337.7);
            });

            expectSample("default", defaultSchema, (data, value) => {
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:38:04.000Z");
                assert.equal(data.interruptFlag, false);
                assert.equal(data.interruptLevel, "LOW");
                assert.equal(data.pnackMode, false);
                assert.equal(data.distance1, 44.6);
                assert.equal(data.distance2, 290.1);
                assert.equal(data.distance3, 307.4);
            });

            expectSample("default", defaultSchema, (data, value) => {
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:38:31.000Z");
                assert.equal(data.interruptFlag, true);
                assert.equal(data.interruptLevel, "LOW");
                assert.equal(data.pnackMode, false);
                assert.equal(data.distance1, 44.6);
                assert.equal(data.distance2, 289.4);
                assert.equal(data.distance3, 306.9);
            });

            expectSample("default", defaultSchema, (data, value) => {
                assert.equal(value.timestamp.toISOString(), "2023-08-04T09:39:45.000Z");
                assert.equal(data.interruptFlag, false);
                assert.equal(data.interruptLevel, "LOW");
                assert.equal(data.pnackMode, false);
                assert.equal(data.distance1, 44.6);
                assert.equal(data.distance2, 306);
                assert.equal(data.distance3, 306.3);
            });

            consume(data);
        });
    });
});
