const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Xovis Uplink", () => {
  let lineCountSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/line_count.schema.json`)
      .then((parsedSchema) => {
        lineCountSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Xovis Event Sensor payload", () => {
      const data = {
        data: {
          values: [
            {
              timestamp: 1632385264305,
              type: "LineCrossing",
              serial: "80:1F:12:D5:30:DC",
              direction: "forward",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Line 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "ZoneExit",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "LineCount",
              serial: "80:1F:12:D5:30:DC",
              direction: "forward",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Line 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "CountZoneExit",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "FillLevelChanged",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 0,
                x: 0,
                y: 0,
                height: 0,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "UNKNOWN",
            },
          ],
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "line_count") {
          assert.equal(value.topic, "line_count");
          assert.equal(value.data.fw, 1);
        }

        validate(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Xovis Event Sensor payload", () => {
      const data = {
        data: {
          "sensor-time": {
            timezone: "Europe/Zurich",
            time: "2021-09-23T10:21:06+02:00",
          },
          status: {
            code: "OK",
          },
          content: {
            element: [
              {
                "element-id": 0,
                "element-name": "Line 0",
                "sensor-type": "SINGLE_SENSOR",
                "data-type": "LINE",
                from: "2021-09-23T10:20:00+02:00",
                to: "2021-09-23T10:21:00+02:00",
                resolution: "ONE_MINUTE",
                measurement: [
                  {
                    from: "2021-09-23T10:20:00+02:00",
                    to: "2021-09-23T10:21:00+02:00",
                    value: [
                      {
                        value: 1,
                        label: "fw",
                      },
                      {
                        value: 0,
                        label: "bw",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          "sensor-info": {
            "serial-number": "80:1F:12:D5:30:DC",
            "ip-address": "192.168.0.94",
            name: "Office Entrance",
            group: "Akenza Office",
            "device-type": "PC2S - UL",
          },
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "line_count") {
          assert.equal(value.topic, "line_count");
          assert.equal(value.data.fw, 1);
        }

        validate(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
/*

const event = {
  live_data: {
    package_info: {
      version: "5.0",
      id: 150,
      agent_id: 1005,
    },
    sensor_info: {
      serial_number: "80:1F:12:D5:30:DC",
      type: "SINGLE_SENSOR",
      timezone: "Europe/Zurich",
    },
    frames: [
      {
        framenumber: 4137403,
        time: 1645780665470,
        tracked_objects: [
          {
            track_id: 490,
            type: "GROUP",
            position: [-0.045263, 0.077018, 1.738642],
            attributes: {},
          },
        ],
        events: [
          {
            category: "SCENE",
            type: "LINE_CROSS_BACKWARD",
            attributes: {
              track_id: 490,
              sequence_number: 0,
              geometry_id: 2,
              geometry_type: "LINE",
              geometry_name: "Line 0",
            },
          },
        ],
      },
    ],
  },
};


const event = {
  status_data: {
    package_info: {
      version: "5.0",
      id: 1,
      agent_id: 1006,
    },
    sensor_info: {
      serial_number: "80:1F:12:D5:30:DC",
    },
    states: {
      device: {
        info: {
          fw_version: "5.0.3-9738700b2d",
          hw_bom_rev: "G",
          hw_id: "5",
          hw_pcb_rev: "E",
          hw_prod_rev: "AD",
          prod_code: "PC2SUL",
          serial: "80:1F:12:D5:30:DC",
          type: "PC2S",
          variant: "",
        },
        state: {
          details: {
            temperatures: {
              die: 66,
              housing: 52,
            },
            uptime_sec: 334753,
          },
          state: "OK",
        },
      },
      time: {
        state: {
          details: {
            ntp_host: "tristate.trifence.ch",
            ntp_host_stratum: 3,
            ntp_rms_offset: 0.000018726,
            ntp_root_delay: 0.00175826,
            ntp_root_dispersion: 0.000277602,
            time: "2022-02-25T11:20:05+01:00",
            tz_offset_sec: 3600,
          },
          state: "OK",
        },
      },
      network: {
        state: {
          details: {
            ipv4: {
              address: "192.168.0.94",
              dhcp_enabled: true,
              dhcp_state: "bound",
              dns_entries: ["192.168.0.1"],
              fallback_enabled: true,
              gateway: "192.168.0.1",
              netmask: "255.255.255.0",
            },
            ipv6: {
              addresses: [],
              dns_entries: [],
              gateways: [],
            },
            link: {
              mac: "80:1F:12:D5:30:DC",
              mtu: 1500,
              rx_dropped: 1789,
              rx_errors: 0,
              rx_frame_errors: 0,
              rx_over_errors: 0,
              rx_packets: 274141,
              tx_errors: 0,
              tx_packets: 75716,
            },
          },
          state: "OK",
        },
        remotes: {
          state: {
            remote_states: [
              {
                connected: true,
                id: 0,
              },
            ],
          },
        },
      },
      updates: {
        state: {
          last_update: {
            successful: true,
            time: "2022-02-21T14:18:01+01:00",
            version: "5.0.3-9738700b2d",
          },
          state: "OK",
          version: "5.0.3-9738700b2d",
        },
      },
      license: {
        status: {
          licensed_lifetime: [],
          licensed_recurring: [],
          licensed_test: [],
          test_license_available: true,
        },
      },
      singlesensor: {
        status: {
          frames_processed: 4184138,
          illumination: "SUFFICIENT",
        },
        data: {
          push: {
            agents: {
              status: {
                agent_states: [
                  {
                    id: 1000,
                    name: "Migrated events push (id 0)",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: 4139005,
                        package_id: 932465,
                      },
                      no_of_dropped: 1256,
                      no_of_sent: 556,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 443,
                        reason: {
                          code: 6,
                          info: "Could not resolve host: data-gateway.akenza.io",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=u84wkakwh9c7krw0xap3kvr2ngi87s52&deviceId=6F898A9E151CE490&topic=default",
                        time: "2022-02-24T13:19:55.460+01:00",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=u84wkakwh9c7krw0xap3kvr2ngi87s52&deviceId=6F898A9E151CE490&topic=default",
                        time: "2022-02-25T10:19:54.655+01:00",
                      },
                      no_of_failed: 9146,
                      no_of_successful: 556,
                    },
                    type: "LEGACY_EVENT",
                  },
                  {
                    id: 1001,
                    name: "Migrated events push (id 1)",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: 4139005,
                        package_id: 932465,
                      },
                      no_of_dropped: 1265,
                      no_of_sent: 556,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 443,
                        reason: {
                          code: 6,
                          info: "Could not resolve host: data-gateway.core.akenza.io",
                        },
                        server:
                          "https://data-gateway.core.akenza.io/v2/up/90ab12d26d0f1453e84cea5e00ae2684?id=xovisnewoffice",
                        time: "2022-02-24T13:20:02.612+01:00",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server:
                          "https://data-gateway.core.akenza.io/v2/up/90ab12d26d0f1453e84cea5e00ae2684?id=xovisnewoffice",
                        time: "2022-02-25T10:19:55.160+01:00",
                      },
                      no_of_failed: 9165,
                      no_of_successful: 556,
                    },
                    type: "LEGACY_EVENT",
                  },
                  {
                    id: 1002,
                    name: "Migrated events push (id 2)",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: 4139005,
                        package_id: 932465,
                      },
                      no_of_dropped: 1264,
                      no_of_sent: 556,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 443,
                        reason: {
                          code: 6,
                          info: "Could not resolve host: enhtd18ajzys.x.pipedream.net",
                        },
                        server: "https://enhtd18ajzys.x.pipedream.net",
                        time: "2022-02-24T13:20:01.877+01:00",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server: "https://enhtd18ajzys.x.pipedream.net",
                        time: "2022-02-25T10:19:54.770+01:00",
                      },
                      no_of_failed: 9165,
                      no_of_successful: 556,
                    },
                    type: "LEGACY_EVENT",
                  },
                  {
                    id: 1003,
                    name: "Migrated line count data push (id 3)",
                    package_info: {
                      last_processed: {
                        ack: false,
                        index: 34136,
                        package_id: 188012,
                      },
                      no_of_dropped: 176984,
                      no_of_sent: 11049,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 443,
                        reason: {
                          code: 6,
                          info: "Could not resolve host: data-gateway.akenza.io",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=fv2n9r0fax1huucdrvg1bcw2m401axo6&deviceId=FC86D2BD0A9C4090&topic=default",
                        time: "2022-02-25T10:54:22.480+01:00",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=fv2n9r0fax1huucdrvg1bcw2m401axo6&deviceId=FC86D2BD0A9C4090&topic=default",
                        time: "2022-02-25T11:20:02.719+01:00",
                      },
                      no_of_failed: 14825,
                      no_of_successful: 11049,
                    },
                    type: "LEGACY_LINE_COUNT",
                  },
                  {
                    id: 1004,
                    name: "Migrated events push (id 4)",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: 4139005,
                        package_id: 932465,
                      },
                      no_of_dropped: 1267,
                      no_of_sent: 556,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 443,
                        reason: {
                          code: 6,
                          info: "Could not resolve host: data-gateway.akenza.io",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=fv2n9r0fax1huucdrvg1bcw2m401axo6&deviceId=EE26CA3516835D09&topic=default",
                        time: "2022-02-24T13:19:54.739+01:00",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=fv2n9r0fax1huucdrvg1bcw2m401axo6&deviceId=EE26CA3516835D09&topic=default",
                        time: "2022-02-25T10:19:54.654+01:00",
                      },
                      no_of_failed: 9165,
                      no_of_successful: 556,
                    },
                    type: "LEGACY_EVENT",
                  },
                  {
                    id: 1005,
                    name: "akenza.io New Platform Test",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: 4139006,
                        package_id: 152,
                      },
                      no_of_dropped: 0,
                      no_of_sent: 322,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 0,
                        reason: {
                          code: 0,
                          info: "",
                        },
                        server: "",
                        time: "",
                      },
                      last_successful: {
                        port: 443,
                        reason: {
                          code: 200,
                          info: "OK",
                        },
                        server:
                          "https://data-gateway.akenza.io/v3/capture?secret=lhjs7xpq40m0v0wxicn39mebp2nwlwde&deviceId=DD05F85EDD0BE36D&topic=default",
                        time: "2022-02-25T10:19:54.730+01:00",
                      },
                      no_of_failed: 0,
                      no_of_successful: 322,
                    },
                    type: "LIVE_DATA",
                  },
                  {
                    id: 1006,
                    name: "akenza.io New Platfrom Test",
                    package_info: {
                      last_processed: {
                        ack: true,
                        index: -1,
                        package_id: 0,
                      },
                      no_of_dropped: 0,
                      no_of_sent: 0,
                    },
                    transmit_info: {
                      last_failed: {
                        port: 0,
                        reason: {
                          code: 0,
                          info: "",
                        },
                        server: "",
                        time: "",
                      },
                      last_successful: {
                        port: 0,
                        reason: {
                          code: 0,
                          info: "",
                        },
                        server: "",
                        time: "",
                      },
                      no_of_failed: 0,
                      no_of_successful: 0,
                    },
                    type: "STATUS",
                  },
                ],
                last_stored: "2022-02-25T11:19:17.406+01:00",
              },
            },
          },
        },
      },
      multisensor: {
        status: {
          active_singlesensors: [],
          alignment: false,
          enabled: false,
          frames_processed: 0,
        },
      },
    },
  },
};
*/
