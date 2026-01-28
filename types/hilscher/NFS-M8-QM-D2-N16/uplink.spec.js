

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("NFS-M8-QM-D2-N16 Uplink", () => {
  let system_monitoring_schema = null;

  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/system_monitoring.schema.json`)
      .then((parsedSchema) => {
        system_monitoring_schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the hilscher system monitoring payload", () => {
      const system_monitoring_data = { data: { data: [{ "cpu": { "user": 27.8, "system": 8.7, "uptime": 425618, "average": 38 }, "memory": { "used": 1165074432, "cache": 400633856, "free": 463405056, "available": 690655232, "total": 2052063232, "buffers": 22949888 }, "network": { "received": 27985, "sent": 19661 }, "process": { "all": 0, "running": 0, "blocked": 0, "sleeping": 0, "idle": 0, "unknown": 0, "processDetails": [] } }] } };

      expectEmits((type, value) => {
        assert.typeOf(value.data, "object");
        assert.equal(type, "sample");
        assert.equal(value.topic, "system_monitoring");

        assert.equal(value.data.cpuLoadPercent, 38);
        assert.equal(value.data.memoryFreeMegaByte, 463);

        validateSchema(value.data, system_monitoring_schema, { throwError: true });
      });

      consume(system_monitoring_data);

      const variable_IOLink_data = { data: { Messages: [{"DataSetWriterId":25,"SequenceNumber":11815,"Timestamp":"2026-01-28T15:45:41.014Z","Filter":"processDataInput","Source":"vega.com/VEGAPOINT/VEGAPOINT,2021/52037373","Payload":{"CustomKey_Parent":"192.168.0.2:4840","CustomKey_Port":"Port X2","CustomKey_UserTag":"","Measured value":90.4,"Switching output 1":true,"Switching output 2":false,"Temperature":25.6}}] } };

      consume(variable_IOLink_data);

    });
  });
});