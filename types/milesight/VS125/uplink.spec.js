const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Axis People Counter Uplink", () => {
  let line1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/line1.schema.json`)
      .then((parsedSchema) => {
        line1Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Milesight VS125 line crossing data", () => {
      const data = {
        data: {
          "device_info": {
            "cus_device_id": "123456",
            "cus_site_id": "789123",
            "device_mac": "24:E1:24:FA:0C:6C",
            "device_name": "People Counter11",
            "device_sn": "6384E16179950009",
            "firmware_version": "V_125.1.0.1-chenjs-20240530a",
            "hardware_version": "V1.0",
            "ip_address": "192.168.60.183",
            "running_time": 58
          },
          "network_info": {
            "network_status": "true",
            "iccid": "89860117838009934120",
            "imei": "860425047368939",
            "cell_id": "340db80",
            "lac": "5299"
          },
          "line_trigger_data": [{
            "group": {
              "in": 0,
              "out": 0
            },
            "total": {
              "in": 27,
              "out": 27
            },
            "line": 1,
            "line_name": "Line1111111111111111111111111111",
            "line_uuid": "9a0440de-3188-4f6d-b886-bb20c97bd26b"
          }, {
            "group": {
              "in": 0,
              "out": 0
            },
            "total": {
              "in": 27,
              "out": 27
            },
            "line": 3,
            "line_name": "Line3333333333333333333333333333",
            "line_uuid": "82ffe54d-0191-484b-a2fc-495628a8f2a1"
          }],
          "time_info": {
            "dst_status": false,
            "enable_dst": true,
            "time": "2024-05-30T20:11:32+08:00",
            "time_zone": "UTC+8:00 China Standard Time (CT/CST)"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line1");
        assert.equal(value.data.totalCounterIn, 27);
        assert.equal(value.data.totalCounterOut, 27);

        utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line3");
        assert.equal(value.data.totalCounterIn, 27);
        assert.equal(value.data.totalCounterOut, 27);

        utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Milesight VS125 dwelltime payload", () => {
      const data = {
        data: {
          "device_info": {
            "cus_device_id": "123456",
            "cus_site_id": "789123",
            "device_mac": "24:E1:24:FA:0C:6C", // 4G不上传此内容
            "device_name": "People Counter11",
            "device_sn": "6384E16179950009",
            "firmware_version": "V_125.1.0.1-chenjs-20240530a",
            "hardware_version": "V1.0",
            "ip_address": "192.168.60.183",
            "running_time": 106,
            "wlan_mac": "24:E1:24:54:23:0A"
          },
          "network_info": {
            "network_status": "true",
            "iccid": "89860117838009934120",
            "imei": "860425047368939",
            "cell_id": "340db80",
            "lac": "5299"
          },
          "region_trigger_data": {
            "dwell_time_data": [{
              "duration": 96799,
              "dwell_end_time": "2024-05-30T20:12:20+08:00",
              "dwell_start_time": "2024-05-30T20:10:43+08:00",
              "people_id": 5,
              "region": 1,
              "region_name": "Region1",
              "region_uuid": "bd1e6ce2-e113-4ce4-a9b6-0633f7083cac",
            }]
          },
          "time_info": {
            "dst_status": false,
            "enable_dst": true,
            "time": "2024-05-30T20:12:20+08:00",
            "time_zone": "UTC+8:00 China Standard Time (CT/CST)"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "region1");
        assert.equal(value.data.duration, 96799);
        assert.equal(value.data.dwellTimeStart, "2024-05-30T20:10:43+08:00");
        assert.equal(value.data.dwellTimeEnd, "2024-05-30T20:12:20+08:00");

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Milesight VS125 periodic reporting payload", () => {
      const data = {
        data: {
          "device_info": {
            "cus_device_id": "123456",
            "cus_site_id": "789123",
            "device_mac": "24:E1:24:FA:0C:6C", // 4G不上传此内容
            "device_name": "People Counter11",
            "device_sn": "6384E16179950009",
            "firmware_version": "V_125.1.0.1-chenjs-20240530a",
            "hardware_version": "V1.0",
            "ip_address": "192.168.60.183",
            "running_time": 141,
            "wlan_mac": "24:E1:24:54:23:0A"
          },
          "network_info": {
            "network_status": "true", // 蜂窝网络连接状态，false为断开连接，true为连接状态
            "iccid": "89860117838009934120",
            "imei": "860425047368939",
            "cell_id": "340db80",
            "lac": "5299"
          },
          "line_periodic_data": [{
            "line": 1,
            "line_name": "Line1111111111111111111111111111",
            "line_uuid": "9a0440de-3188-4f6d-b886-bb20c97bd26b",
            "total": {
              "in": 0,
              "out": 0
            },
            "group": {
              "in": 0,
              "out": 0
            }
          },
          {
            "line": 2,
            "line_name": "Line2222222222222222222222222222",
            "line_uuid": "b138b9a1-ce58-40bd-98f4-c401dfc118c8",
            "total": {
              "in": 0,
              "out": 0
            },
            "group": {
              "in": 0,
              "out": 0
            }
          }
          ],
          "line_total_data": [{
            "line": 1,
            "line_name": "Line1111111111111111111111111111",
            "line_uuid": "9a0440de-3188-4f6d-b886-bb20c97bd26b",
            "total": {
              "in_counted": 0,
              "out_counted": 0,
              "capacity_counted": 0
            },
            "group": {
              "in_counted": 0,
              "out_counted": 0
            }
          },
          {
            "line": 2,
            "line_name": "Line1111111111111111111111111111",
            "line_uuid": "9a0440de-3188-4f6d-b886-bb20c97bd26b",
            "total": {
              "in_counted": 0,
              "out_counted": 0,
              "capacity_counted": 0
            },
          }
          ],
          "region_data": {
            "dwell_time_data": [{
              "avg_dwell_time": 308367,
              "max_dwell_time": 519934,
              "region": 1,
              "region_name": "Region1",
              "region_uuid": "bd1e6ce2-e113-4ce4-a9b6-0633f7083cac"
            }],
            "region_count_data": [{
              "total": {
                "current_total": 2 // 包括儿童和员工
              },
              "region": 1,
              "region_name": "Region1",
              "region_uuid": "bd1e6ce2-e113-4ce4-a9b6-0633f7083cac"
            }]
          },
          "time_info": {
            "dst_status": false,
            "enable_dst": true,
            "end_time": "2024-05-30T20:21:49+08:00",
            "start_time": "2024-05-30T20:20:49+08:00",
            "time_zone": "UTC+8:00 China Standard Time (CT/CST)"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line1");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line2");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line1");
        assert.equal(value.data.totalCountedCapacity, 0);
        assert.equal(value.data.totalCountedIn, 0);
        assert.equal(value.data.totalCountedOut, 0);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line2");
        assert.equal(value.data.totalCountedCapacity, 0);
        assert.equal(value.data.totalCountedIn, 0);
        assert.equal(value.data.totalCountedOut, 0);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "region1");
        assert.equal(value.data.avgDwellTime, 308367);
        assert.equal(value.data.maxDwellTime, 519934);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "region1");
        assert.equal(value.data.totalDwellers, 2);

        // utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
