

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Xovis V5 Uplink", () => {
  let lineCountSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/line_count.schema.json`)
      .then((parsedSchema) => {
        lineCountSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let countSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/count.schema.json`).then((parsedSchema) => {
      countSchema = parsedSchema;
      done();
    });
  });

  let trackSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/track.schema.json`).then((parsedSchema) => {
      trackSchema = parsedSchema;
      done();
    });
  });

  let faceMaskSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/face_mask.schema.json`)
      .then((parsedSchema) => {
        faceMaskSchema = parsedSchema;
        done();
      });
  });

  let genderSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gender.schema.json`).then((parsedSchema) => {
      genderSchema = parsedSchema;
      done();
    });
  });

  let tagSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/tag.schema.json`).then((parsedSchema) => {
      tagSchema = parsedSchema;
      done();
    });
  });

  let viewDirectionSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/view_direction.schema.json`)
      .then((parsedSchema) => {
        viewDirectionSchema = parsedSchema;
        done();
      });
  });

  let queueSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/queue.schema.json`).then((parsedSchema) => {
      queueSchema = parsedSchema;
      done();
    });
  });

  let queueTimeSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/queue_time.schema.json`)
      .then((parsedSchema) => {
        queueTimeSchema = parsedSchema;
        done();
      });
  });

  let ageSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/age.schema.json`)
      .then((parsedSchema) => {
        ageSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Xovis V5 event payload", () => {
      const data = {
        data: {
          live_data: {
            package_info: {
              version: "5.0",
              id: 150,
              agent_id: 1005,
            },
            frames: [
              {
                framenumber: 4137403,
                time: 1645780665470,
                tracked_objects: [
                  {
                    track_id: 490,
                    type: "PERSON",
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
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 status payload", () => {
      const data = {
        data: {
          status_data: {
            package_info: {
              version: "5.0",
              id: 1,
              agent_id: 1006,
            },
            states: {
              device: {
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
                  details: {},
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
                    agents: {},
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
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceStatus, "OK");
        assert.equal(value.data.multisensor, false);
        assert.equal(value.data.networkStatus, "OK");
        assert.equal(value.data.singleSensorIllumination, "SUFFICIENT");
        assert.equal(value.data.timeStatus, "OK");
        assert.equal(value.data.updateStatus, "OK");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 summated logic payload", () => {
      const data = {
        data: {
          logics_data: {
            package_info: {
              version: "5.0",
              id: 28,
              agent_id: 1008,
            },
            logics: [
              {
                id: 1,
                name: "Zone 0",
                info: "XLT_4X_ZONE_COUNT",
                geometries: [
                  {
                    id: 1,
                    type: "ZONE",
                    name: "Zone 0",
                  },
                ],
                records: [
                  {
                    from: 1645792860000,
                    to: 1645792920000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792920000,
                    to: 1645792980000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792980000,
                    to: 1645793040000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645793040000,
                    to: 1645793100000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
              {
                id: 2,
                name: "Line 0",
                info: "XLT_4X_LINE_IN_OUT_COUNT",
                geometries: [
                  {
                    id: 1,
                    type: "ZONE",
                    name: "Zone 0",
                  },
                  {
                    id: 2,
                    type: "LINE",
                    name: "Line 0",
                  },
                ],
                records: [
                  {
                    from: 1645792860000,
                    to: 1645792920000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 1,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792920000,
                    to: 1645792980000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 3,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 1,
                      },
                    ],
                  },
                  {
                    from: 1645792980000,
                    to: 1645793040000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 0,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645793040000,
                    to: 1645793100000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 0,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 4);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 logic payload", () => {
      const data = {
        data: {
          logics_data: {
            package_info: {
              version: "5.0",
              id: 28,
              agent_id: 1008,
            },
            logics: [
              {
                id: 1,
                name: "Zone 0",
                info: "XLT_4X_ZONE_COUNT",
                geometries: [
                  {
                    id: 1,
                    type: "ZONE",
                    name: "Zone 0",
                  },
                ],
                records: [
                  {
                    from: 1645792860000,
                    to: 1645792920000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792920000,
                    to: 1645792980000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792980000,
                    to: 1645793040000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645793040000,
                    to: 1645793100000,
                    counts: [
                      {
                        id: 1,
                        name: "balance",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
              {
                id: 2,
                name: "Line 0",
                info: "XLT_4X_LINE_IN_OUT_COUNT",
                geometries: [
                  {
                    id: 1,
                    type: "ZONE",
                    name: "Zone 0",
                  },
                  {
                    id: 2,
                    type: "LINE",
                    name: "Line 0",
                  },
                ],
                records: [
                  {
                    from: 1645792860000,
                    to: 1645792920000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 1,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792920000,
                    to: 1645792980000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 0,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645792980000,
                    to: 1645793040000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 0,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                  {
                    from: 1645793040000,
                    to: 1645793100000,
                    counts: [
                      {
                        id: 2,
                        name: "fw",
                        value: 0,
                      },
                      {
                        id: 3,
                        name: "bw",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 periodic live data payload", () => {
      const data = {
        data: {
          live_data: {
            package_info: {
              version: "5.0",
              id: 2,
              agent_id: 1005,
            },
            frames: [
              {
                framenumber: 4344822,
                time: 1645797259355,
                tracked_objects: [
                  {
                    track_id: 527,
                    type: "PERSON",
                    position: [0.072379, 0.077282, 1.71439],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 527,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4344846,
                time: 1645797261275,
                tracked_objects: [
                  {
                    track_id: 518,
                    type: "GROUP",
                    position: [0.072379, 0.077282, 1.71439],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 518,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4344894,
                time: 1645797265115,
                tracked_objects: [
                  {
                    track_id: 528,
                    type: "PERSON",
                    position: [-0.180745, 0.026927, 1.772541],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 528,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4344918,
                time: 1645797267035,
                tracked_objects: [
                  {
                    track_id: 519,
                    type: "GROUP",
                    position: [-0.180745, 0.026927, 1.772541],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 519,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4345175,
                time: 1645797287595,
                tracked_objects: [
                  {
                    track_id: 529,
                    type: "PERSON",
                    position: [-0.102097, -0.054579, 1.756457],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 529,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4345199,
                time: 1645797289515,
                tracked_objects: [
                  {
                    track_id: 520,
                    type: "GROUP",
                    position: [-0.102097, -0.054579, 1.756457],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 520,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4345253,
                time: 1645797293835,
                tracked_objects: [
                  {
                    track_id: 530,
                    type: "PERSON",
                    position: [0.330857, -0.034957, 1.731911],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 530,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 4345277,
                time: 1645797295755,
                tracked_objects: [
                  {
                    track_id: 521,
                    type: "GROUP",
                    position: [0.330857, -0.034957, 1.731911],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 521,
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
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 live data with all extra datapoints enabled", () => {
      const data = {
        data: {
          live_data: {
            package_info: {
              version: "5.0",
              id: 1,
              agent_id: 1005,
            },
            frames: [
              {
                framenumber: 11966447,
                time: 1646407003605,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.230998, -1.492389, 1.697618],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1128,
                      sequence_number: 0,
                    },
                  },
                ],
              },
              {
                framenumber: 11966448,
                time: 1646407003685,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.247394, -1.426181, 1.698018],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966449,
                time: 1646407003765,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.224341, -1.313508, 1.691786],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966450,
                time: 1646407003845,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.217325, -1.207006, 1.682291],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966451,
                time: 1646407003925,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.19989, -1.111508, 1.690361],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966452,
                time: 1646407004005,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.178692, -1.023109, 1.705723],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966453,
                time: 1646407004085,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.166309, -0.945956, 1.719778],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966454,
                time: 1646407004165,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.133622, -0.872649, 1.728683],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966455,
                time: 1646407004245,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.115301, -0.793415, 1.726287],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966456,
                time: 1646407004325,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.080167, -0.698018, 1.716523],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966457,
                time: 1646407004405,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.041215, -0.594662, 1.705063],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966458,
                time: 1646407004485,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.009047, -0.488379, 1.700671],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966459,
                time: 1646407004565,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.008566, -0.391278, 1.701377],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966460,
                time: 1646407004645,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.00741, -0.298571, 1.713344],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966461,
                time: 1646407004725,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.002029, -0.200734, 1.715847],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966462,
                time: 1646407004805,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.013848, -0.105575, 1.710568],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966463,
                time: 1646407004885,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.026859, -0.019344, 1.702423],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966464,
                time: 1646407004965,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.04495, 0.07921, 1.700344],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1128,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 1128,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1128,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 1,
                    },
                  },
                ],
              },
              {
                framenumber: 11966465,
                time: 1646407005045,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.065595, 0.158668, 1.702734],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966466,
                time: 1646407005125,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.078247, 0.232741, 1.708673],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966467,
                time: 1646407005205,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.084661, 0.311712, 1.717292],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966468,
                time: 1646407005285,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.078502, 0.396152, 1.724172],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966469,
                time: 1646407005365,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.072889, 0.478748, 1.725783],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966470,
                time: 1646407005445,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.059888, 0.555019, 1.719496],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966471,
                time: 1646407005525,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.032698, 0.656811, 1.706559],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.230998, -1.492389, 1.697618],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1105,
                      sequence_number: 0,
                    },
                  },
                ],
              },
              {
                framenumber: 11966472,
                time: 1646407005605,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [-0.005077, 0.769876, 1.696661],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.247394, -1.426181, 1.698018],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966473,
                time: 1646407005685,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.021379, 0.884135, 1.693526],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.224341, -1.313508, 1.691786],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966474,
                time: 1646407005765,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.045902, 0.987409, 1.69585],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.217325, -1.207006, 1.682291],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966475,
                time: 1646407005845,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.023901, 1.105752, 1.698549],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.19989, -1.111508, 1.690361],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966476,
                time: 1646407005925,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.02327, 1.222277, 1.693322],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.178692, -1.023109, 1.705723],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966477,
                time: 1646407006005,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.040654, 1.329077, 1.681709],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.166309, -0.945956, 1.719778],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966478,
                time: 1646407006085,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.042702, 1.441937, 1.668934],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.133622, -0.872649, 1.728683],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966479,
                time: 1646407006165,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.061326, 1.540757, 1.66415],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.115301, -0.793415, 1.726287],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966480,
                time: 1646407006245,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.082599, 1.638831, 1.661572],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.080167, -0.698018, 1.716523],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966481,
                time: 1646407006325,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.086695, 1.699837, 1.656103],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.041215, -0.594662, 1.705063],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966482,
                time: 1646407006405,
                tracked_objects: [
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.099425, 1.76971, 1.634351],
                    attributes: {},
                  },
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.009047, -0.488379, 1.700671],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966483,
                time: 1646407006484,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.008566, -0.391278, 1.701377],
                    attributes: {},
                  },
                  {
                    track_id: 1128,
                    type: "PERSON",
                    position: [0.09, 1.77, 1.634351],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1128,
                      sequence_number: 1,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1128,
                      sequence_number: 1,
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_DECREMENT",
                    attributes: {
                      track_id: 1128,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 0,
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1128,
                      logic_id: 2,
                      logic_name: "Line 0",
                      counter_id: 3,
                      counter_name: "bw",
                      counter_value: 926,
                    },
                  },
                ],
              },
              {
                framenumber: 11966484,
                time: 1646407006564,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.00741, -0.298571, 1.713344],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966485,
                time: 1646407006644,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.002029, -0.200734, 1.715847],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966486,
                time: 1646407006724,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.013848, -0.105575, 1.710568],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966487,
                time: 1646407006804,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.026859, -0.019344, 1.702423],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966488,
                time: 1646407006884,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.04495, 0.07921, 1.700344],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1105,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 1105,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 11966489,
                time: 1646407006964,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.065595, 0.158668, 1.702734],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966490,
                time: 1646407007044,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.078247, 0.232741, 1.708673],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966491,
                time: 1646407007124,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.084661, 0.311712, 1.717292],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966492,
                time: 1646407007204,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.078502, 0.396152, 1.724172],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966493,
                time: 1646407007284,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.072889, 0.478748, 1.725783],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966494,
                time: 1646407007364,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.059888, 0.555019, 1.719496],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966495,
                time: 1646407007444,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.032698, 0.656811, 1.706559],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966496,
                time: 1646407007524,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [-0.005077, 0.769876, 1.696661],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966497,
                time: 1646407007604,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.021379, 0.884135, 1.693526],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966498,
                time: 1646407007684,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.045902, 0.987409, 1.69585],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966499,
                time: 1646407007764,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.023901, 1.105752, 1.698549],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966500,
                time: 1646407007844,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.02327, 1.222277, 1.693322],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966501,
                time: 1646407007924,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.040654, 1.329077, 1.681709],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966502,
                time: 1646407008004,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.042702, 1.441937, 1.668934],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966503,
                time: 1646407008084,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.061326, 1.540757, 1.66415],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966504,
                time: 1646407008164,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.082599, 1.638831, 1.661572],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966505,
                time: 1646407008244,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.086695, 1.699837, 1.656103],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966506,
                time: 1646407008324,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.099425, 1.76971, 1.634351],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11966507,
                time: 1646407008404,
                tracked_objects: [
                  {
                    track_id: 1105,
                    type: "GROUP",
                    position: [0.09, 1.77, 1.634351],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1105,
                      sequence_number: 1,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1105,
                      sequence_number: 1,
                    },
                  },
                ],
              },
              {
                framenumber: 11967535,
                time: 1646407090646,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.243385, -0.935111, 1.94183],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1129,
                      sequence_number: 0,
                    },
                  },
                ],
              },
              {
                framenumber: 11967536,
                time: 1646407090726,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.236451, -0.908471, 1.9554],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967537,
                time: 1646407090806,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.229758, -0.862601, 1.971941],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967538,
                time: 1646407090886,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.192982, -0.759752, 1.979282],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967539,
                time: 1646407090966,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.170997, -0.676234, 1.977127],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967540,
                time: 1646407091046,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.148893, -0.602973, 1.968372],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967541,
                time: 1646407091126,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.125649, -0.5106, 1.958546],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967542,
                time: 1646407091206,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.095107, -0.420398, 1.945529],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967543,
                time: 1646407091286,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.065657, -0.322932, 1.930261],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967544,
                time: 1646407091366,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.035904, -0.227874, 1.922485],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967545,
                time: 1646407091446,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.012845, -0.135363, 1.921904],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967546,
                time: 1646407091526,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.00752, -0.052883, 1.926159],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967547,
                time: 1646407091606,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.001546, 0.021355, 1.936133],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1129,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 1129,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1129,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 1,
                    },
                  },
                ],
              },
              {
                framenumber: 11967548,
                time: 1646407091686,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.000547, 0.095355, 1.946291],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967549,
                time: 1646407091766,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.00251, 0.165004, 1.950773],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967550,
                time: 1646407091846,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.018267, 0.225993, 1.952315],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967551,
                time: 1646407091926,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.024458, 0.284302, 1.947522],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967552,
                time: 1646407092006,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.042108, 0.35495, 1.939708],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967553,
                time: 1646407092086,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.067142, 0.425931, 1.933697],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967554,
                time: 1646407092166,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.101962, 0.492748, 1.933328],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967555,
                time: 1646407092246,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.123067, 0.56219, 1.937185],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967556,
                time: 1646407092326,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.127176, 0.62549, 1.944595],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967557,
                time: 1646407092406,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.125819, 0.677677, 1.954191],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967558,
                time: 1646407092486,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.122829, 0.730454, 1.95985],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967559,
                time: 1646407092566,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.112946, 0.781668, 1.963971],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.243385, -0.935111, 1.94183],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1106,
                      sequence_number: 0,
                    },
                  },
                ],
              },
              {
                framenumber: 11967560,
                time: 1646407092646,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.10589, 0.8391, 1.963226],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.236451, -0.908471, 1.9554],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967561,
                time: 1646407092726,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.088631, 0.899253, 1.960111],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.229758, -0.862601, 1.971941],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967562,
                time: 1646407092806,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.082166, 0.957265, 1.961559],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.192982, -0.759752, 1.979282],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967563,
                time: 1646407092886,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.065085, 1.04911, 1.952751],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.170997, -0.676234, 1.977127],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967564,
                time: 1646407092966,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.021349, 1.124644, 1.943132],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.148893, -0.602973, 1.968372],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967565,
                time: 1646407093046,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.065642, 1.173399, 1.929785],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.125649, -0.5106, 1.958546],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967566,
                time: 1646407093126,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.120083, 1.219036, 1.913823],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.095107, -0.420398, 1.945529],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967567,
                time: 1646407093206,
                tracked_objects: [
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.173475, 1.251752, 1.897691],
                    attributes: {},
                  },
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.065657, -0.322932, 1.930261],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967568,
                time: 1646407093286,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.035904, -0.227874, 1.922485],
                    attributes: {},
                  },
                  {
                    track_id: 1129,
                    type: "PERSON",
                    position: [-0.18, 1.26, 1.897691],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1129,
                      sequence_number: 1,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1129,
                      sequence_number: 1,
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_DECREMENT",
                    attributes: {
                      track_id: 1129,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 0,
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1129,
                      logic_id: 2,
                      logic_name: "Line 0",
                      counter_id: 3,
                      counter_name: "bw",
                      counter_value: 927,
                    },
                  },
                ],
              },
              {
                framenumber: 11967569,
                time: 1646407093366,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.012845, -0.135363, 1.921904],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967570,
                time: 1646407093446,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.00752, -0.052883, 1.926159],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967571,
                time: 1646407093526,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.001546, 0.021355, 1.936133],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1106,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_BACKWARD",
                    attributes: {
                      track_id: 1106,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 11967572,
                time: 1646407093606,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.000547, 0.095355, 1.946291],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967573,
                time: 1646407093686,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.00251, 0.165004, 1.950773],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967574,
                time: 1646407093766,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.018267, 0.225993, 1.952315],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967575,
                time: 1646407093846,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.024458, 0.284302, 1.947522],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967576,
                time: 1646407093926,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.042108, 0.35495, 1.939708],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967577,
                time: 1646407094006,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.067142, 0.425931, 1.933697],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967578,
                time: 1646407094086,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.101962, 0.492748, 1.933328],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967579,
                time: 1646407094166,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.123067, 0.56219, 1.937185],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967580,
                time: 1646407094246,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.127176, 0.62549, 1.944595],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967581,
                time: 1646407094326,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.125819, 0.677677, 1.954191],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967582,
                time: 1646407094406,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.122829, 0.730454, 1.95985],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967583,
                time: 1646407094486,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.112946, 0.781668, 1.963971],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967584,
                time: 1646407094566,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.10589, 0.8391, 1.963226],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967585,
                time: 1646407094646,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.088631, 0.899253, 1.960111],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967586,
                time: 1646407094726,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.082166, 0.957265, 1.961559],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967587,
                time: 1646407094806,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.065085, 1.04911, 1.952751],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967588,
                time: 1646407094886,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.021349, 1.124644, 1.943132],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967589,
                time: 1646407094966,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.065642, 1.173399, 1.929785],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967590,
                time: 1646407095046,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.120083, 1.219036, 1.913823],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967591,
                time: 1646407095126,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.173475, 1.251752, 1.897691],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967592,
                time: 1646407095206,
                tracked_objects: [
                  {
                    track_id: 1106,
                    type: "GROUP",
                    position: [-0.18, 1.26, 1.897691],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1106,
                      sequence_number: 1,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1106,
                      sequence_number: 1,
                    },
                  },
                ],
              },
              {
                framenumber: 11967642,
                time: 1646407099206,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.153487, 0.917795, 1.965973],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1130,
                      sequence_number: 0,
                    },
                  },
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1130,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1130,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 1,
                    },
                  },
                ],
              },
              {
                framenumber: 11967643,
                time: 1646407099286,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.147653, 0.821805, 1.94704],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967644,
                time: 1646407099366,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.137017, 0.727227, 1.929892],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967645,
                time: 1646407099446,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.134363, 0.653192, 1.919048],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967646,
                time: 1646407099526,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.123007, 0.538343, 1.923891],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967647,
                time: 1646407099606,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.12305, 0.447208, 1.935262],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967648,
                time: 1646407099686,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.10883, 0.350147, 1.94905],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967649,
                time: 1646407099766,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.093504, 0.259588, 1.961527],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967650,
                time: 1646407099846,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.072297, 0.169721, 1.969445],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967651,
                time: 1646407099926,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.041428, 0.092852, 1.972446],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967652,
                time: 1646407100006,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [0.010149, 0.018278, 1.968557],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1130,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 1130,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_DECREMENT",
                    attributes: {
                      track_id: 1130,
                      logic_id: 1,
                      logic_name: "Zone 0",
                      counter_id: 1,
                      counter_name: "balance",
                      counter_value: 0,
                    },
                  },
                ],
              },
              {
                framenumber: 11967653,
                time: 1646407100086,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.021247, -0.057344, 1.958922],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967654,
                time: 1646407100166,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.059074, -0.149064, 1.946867],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967655,
                time: 1646407100246,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.100119, -0.270185, 1.939321],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967656,
                time: 1646407100326,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.141153, -0.393411, 1.939315],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967657,
                time: 1646407100406,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.167947, -0.450492, 1.946788],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967658,
                time: 1646407100486,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.184741, -0.515974, 1.957839],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967659,
                time: 1646407100566,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.202808, -0.594399, 1.966252],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967660,
                time: 1646407100646,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.217377, -0.673413, 1.970849],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967661,
                time: 1646407100726,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.226739, -0.769335, 1.966735],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967662,
                time: 1646407100806,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.243968, -0.873479, 1.959075],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967663,
                time: 1646407100886,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.259271, -0.995027, 1.952452],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967664,
                time: 1646407100966,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.265952, -1.072779, 1.949077],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967665,
                time: 1646407101046,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.265727, -1.134613, 1.938923],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967666,
                time: 1646407101126,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.269023, -1.187231, 1.920635],
                    attributes: {},
                  },
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.153487, 0.917795, 1.965973],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_CREATE",
                    attributes: {
                      track_id: 1107,
                      sequence_number: 0,
                    },
                  },
                  {
                    category: "SCENE",
                    type: "ZONE_ENTRY",
                    attributes: {
                      track_id: 1107,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                ],
              },
              {
                framenumber: 11967667,
                time: 1646407101206,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.284218, -1.242016, 1.89332],
                    attributes: {},
                  },
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.147653, 0.821805, 1.94704],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967668,
                time: 1646407101287,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.294937, -1.305538, 1.857044],
                    attributes: {},
                  },
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.137017, 0.727227, 1.929892],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967669,
                time: 1646407101366,
                tracked_objects: [
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.307138, -1.403205, 1.802871],
                    attributes: {},
                  },
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.134363, 0.653192, 1.919048],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967670,
                time: 1646407101446,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.123007, 0.538343, 1.923891],
                    attributes: {},
                  },
                  {
                    track_id: 1130,
                    type: "PERSON",
                    position: [-0.31, -1.4, 1.802871],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1130,
                      sequence_number: 1,
                    },
                  },
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 1130,
                      logic_id: 2,
                      logic_name: "Line 0",
                      counter_id: 2,
                      counter_name: "fw",
                      counter_value: 935,
                    },
                  },
                ],
              },
              {
                framenumber: 11967671,
                time: 1646407101526,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.12305, 0.447208, 1.935262],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967672,
                time: 1646407101607,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.10883, 0.350147, 1.94905],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967673,
                time: 1646407101687,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.093504, 0.259588, 1.961527],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967674,
                time: 1646407101766,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.072297, 0.169721, 1.969445],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967675,
                time: 1646407101847,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.041428, 0.092852, 1.972446],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967676,
                time: 1646407101927,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [0.010149, 0.018278, 1.968557],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "ZONE_EXIT",
                    attributes: {
                      track_id: 1107,
                      sequence_number: 0,
                      geometry_id: 1,
                      geometry_type: "ZONE",
                      geometry_name: "Zone 0",
                    },
                  },
                  {
                    category: "SCENE",
                    type: "LINE_CROSS_FORWARD",
                    attributes: {
                      track_id: 1107,
                      sequence_number: 0,
                      geometry_id: 2,
                      geometry_type: "LINE",
                      geometry_name: "Line 0",
                    },
                  },
                ],
              },
              {
                framenumber: 11967677,
                time: 1646407102007,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.021247, -0.057344, 1.958922],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967678,
                time: 1646407102087,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.059074, -0.149064, 1.946867],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967679,
                time: 1646407102167,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.100119, -0.270185, 1.939321],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967680,
                time: 1646407102247,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.141153, -0.393411, 1.939315],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967681,
                time: 1646407102327,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.167947, -0.450492, 1.946788],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967682,
                time: 1646407102407,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.184741, -0.515974, 1.957839],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967683,
                time: 1646407102487,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.202808, -0.594399, 1.966252],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967684,
                time: 1646407102567,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.217377, -0.673413, 1.970849],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967685,
                time: 1646407102647,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.226739, -0.769335, 1.966735],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967686,
                time: 1646407102727,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.243968, -0.873479, 1.959075],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967687,
                time: 1646407102807,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.259271, -0.995027, 1.952452],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967688,
                time: 1646407102887,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.265952, -1.072779, 1.949077],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967689,
                time: 1646407102967,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.265727, -1.134613, 1.938923],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967690,
                time: 1646407103047,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.269023, -1.187231, 1.920635],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967691,
                time: 1646407103127,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.284218, -1.242016, 1.89332],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967692,
                time: 1646407103207,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.294937, -1.305538, 1.857044],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967693,
                time: 1646407103287,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.307138, -1.403205, 1.802871],
                    attributes: {},
                  },
                ],
              },
              {
                framenumber: 11967694,
                time: 1646407103367,
                tracked_objects: [
                  {
                    track_id: 1107,
                    type: "GROUP",
                    position: [-0.31, -1.4, 1.802871],
                    attributes: {},
                  },
                ],
                events: [
                  {
                    category: "SCENE",
                    type: "TRACK_DELETE",
                    attributes: {
                      track_id: 1107,
                      sequence_number: 1,
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1128);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "ZONE_ENTRY");
        assert.equal(value.data.geometryName, "Zone 0");
        assert.equal(value.data.trackId, 1128);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.counterValue, 1);
        assert.equal(value.data.countType, "COUNT_INCREMENT");
        assert.equal(value.data.logicName, "Zone 0");

        validateSchema(value.data, countSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1105);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1129);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "ZONE_ENTRY");
        assert.equal(value.data.geometryName, "Zone 0");
        assert.equal(value.data.trackId, 1129);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.counterValue, 1);
        assert.equal(value.data.countType, "COUNT_INCREMENT");
        assert.equal(value.data.logicName, "Zone 0");

        validateSchema(value.data, countSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1106);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1130);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "ZONE_ENTRY");
        assert.equal(value.data.geometryName, "Zone 0");
        assert.equal(value.data.trackId, 1130);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.counterValue, 1);
        assert.equal(value.data.countType, "COUNT_INCREMENT");
        assert.equal(value.data.logicName, "Zone 0");

        validateSchema(value.data, countSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "ZONE_EXIT");
        assert.equal(value.data.geometryName, "Zone 0");
        assert.equal(value.data.trackId, 1130);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.counterValue, 0);
        assert.equal(value.data.countType, "COUNT_DECREMENT");
        assert.equal(value.data.logicName, "Zone 0");

        validateSchema(value.data, countSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "TRACK_CREATE");
        assert.equal(value.data.trackId, 1107);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "track");
        assert.equal(value.data.trackType, "ZONE_ENTRY");
        assert.equal(value.data.geometryName, "Zone 0");
        assert.equal(value.data.trackId, 1107);
        assert.equal(value.data.sequenceNumber, 0);

        validateSchema(value.data, trackSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 addons payload", () => {
      const data = {
        data: {
          live_data: {
            package_info: {
              version: "5.0",
              id: 659,
              agent_id: 1017,
            },
            sensor_info: {
              serial_number: "80:1F:12:D5:30:DC",
              type: "SINGLE_SENSOR",
              timezone: "Europe/Zurich",
            },
            frames: [
              {
                framenumber: 31515889,
                time: 1662646445611,
                tracked_objects: [
                  {
                    track_id: 1428,
                    type: "PERSON",
                    position: [1.945132, -1.617844, 1.458451],
                    attributes: {
                      gender: "MALE",
                      tag: "NO_TAG",
                      face_mask: "NO_MASK",
                      view_direction: [0.497341, -0.867555],
                    },
                  },
                  {
                    track_id: 2147485051,
                    type: "GROUP",
                    position: [1.385632, -0.69409, 1.696455],
                    attributes: {
                      tag: "NO_TAG",
                      members: 1,
                      members_with_tag: 0,
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gender");
        assert.equal(value.data.gender, "MALE");

        validateSchema(value.data, genderSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tag");
        assert.equal(value.data.tag, false);

        validateSchema(value.data, tagSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "face_mask");
        assert.equal(value.data.faceMask, false);

        validateSchema(value.data, faceMaskSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "view_direction");
        assert.equal(value.data.xCoordinate, 0.497341);
        assert.equal(value.data.yCoordinate, -0.867555);

        validateSchema(value.data, viewDirectionSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Xovis V5 count payload", () => {
      const data = {
        data: {
          live_data: {
            package_info: { version: "5.0", id: 97, agent_id: 1022 },
            sensor_info: {
              serial_number: "80:1F:12:D5:30:DC",
              type: "SINGLE_SENSOR",
            },
            frames: [
              {
                framenumber: 251830,
                time: 1673875622987,
                illumination: "SUFFICIENT",
                tracked_objects: [
                  {
                    track_id: 111,
                    type: "PERSON",
                    position: [-0.620745, -0.685637, 1.656886],
                    attributes: { person_height: 1.646858 },
                  },
                ],
                events: [
                  {
                    category: "COUNT",
                    type: "COUNT_INCREMENT",
                    attributes: {
                      track_id: 111,
                      logic_id: 4,
                      logic_name: "Line-based logic 2",
                      counter_id: 6,
                      counter_name: "fw",
                      counter_value: 1471,
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.counterValue, 1471);
        assert.equal(value.data.direction, "fw");
        assert.equal(value.data.countType, "COUNT_INCREMENT");
        assert.equal(value.data.logicName, "Line-based logic 2");

        validateSchema(value.data, countSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 logic mask & gender payload", () => {
      const data = {
        data: {
          logics_data: {
            package_info: {
              version: "5.0",
              id: 2,
              agent_id: 1003,
            },
            sensor_info: {
              serial_number: "80:1F:12:D3:27:CA",
              type: "SINGLE_SENSOR",
            },
            logics: [
              {
                id: 3,
                name: "Line-based logic 3",
                info: "XLT_LINE_IN_OUT_COUNT",
                geometries: [
                  {
                    id: 2,
                    type: "LINE",
                    name: "Line 0",
                  },
                ],
                records: [
                  {
                    from: 1684325340000,
                    to: 1684325400000,
                    samples: 1,
                    samples_expected: 1,
                    counts: [
                      {
                        id: 8,
                        name: "fw",
                        value: 1,
                      },
                      {
                        id: 9,
                        name: "bw",
                        value: 0,
                      },
                      {
                        id: 10,
                        name: "fw-male",
                        value: 1,
                      },
                      {
                        id: 11,
                        name: "bw-male",
                        value: 0,
                      },
                      {
                        id: 12,
                        name: "fw-female",
                        value: 0,
                      },
                      {
                        id: 13,
                        name: "bw-female",
                        value: 0,
                      },
                      {
                        id: 14,
                        name: "fw-mask",
                        value: 0,
                      },
                      {
                        id: 15,
                        name: "bw-mask",
                        value: 0,
                      },
                      {
                        id: 16,
                        name: "fw-no_mask",
                        value: 1,
                      },
                      {
                        id: 17,
                        name: "bw-no_mask",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.bw, 0);
        assert.equal(value.data.fw, 1);

        validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gender");
        assert.equal(value.data.fwMen, 1);
        assert.equal(value.data.fwWoman, 0);
        assert.equal(value.data.bwMen, 0);
        assert.equal(value.data.bwWomen, 0);

        validateSchema(value.data, genderSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "face_mask");
        assert.equal(value.data.fwMask, 0);
        assert.equal(value.data.fwNoMask, 1);
        assert.equal(value.data.bwMask, 0);
        assert.equal(value.data.bwNoMask, 0);

        validateSchema(value.data, faceMaskSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 logic queue statistic payload", () => {
      const data = {
        data: {
          logics_data: {
            package_info: {
              version: "5.0",
              id: 71,
              agent_id: 1001,
            },
            sensor_info: {
              serial_number: "00:6E:02:00:6D:BC",
              type: "SINGLE_SENSOR",
            },
            logics: [
              {
                id: 1000,
                name: "Queue statistics 1",
                info: "XLT_QUEUE_STATISTICS",
                geometries: [
                  {
                    id: 1000,
                    type: "ZONE",
                    name: "Zone 1",
                  },
                ],
                records: [
                  {
                    from: 1720000500000,
                    to: 1720000560000,
                    samples: 1,
                    samples_expected: 1,
                    counts: [
                      {
                        id: 1000001,
                        name: "queue-length",
                        value: 0,
                      },
                      {
                        id: 1000002,
                        name: "outflow",
                        value: 8,
                      },
                      {
                        id: 1000003,
                        name: "queueing-time",
                        value: 124.426003,
                        unit: "seconds",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "queue");
        assert.equal(value.data.outflow, 8);
        assert.equal(value.data.queueingTime, 124);
        assert.equal(value.data.queueLength, 0);

        validateSchema(value.data, queueSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 logic queue statistic payload", () => {
      const data = {
        state: {},
        data: {
          live_data: {
            package_info: {
              version: "5.0",
              id: 6,
              agent_id: 1002,
            },
            sensor_info: {
              serial_number: "00:6E:02:01:AB:7C",
              type: "MULTI_SENSOR",
              multisensor_id: 1,
              alignment_id: "ea49f0ddcafc4a97e28553debdaf0315614e4700",
              id: "97:4A:FC:CA:DD:F0",
            },
            frames: [
              {
                framenumber: 31757307,
                frametype: "FULL",
                time: 1725001494320,
                tracked_objects: [
                  {
                    track_id: 57060,
                    type: "PERSON",
                    position: [-0.254185, 2.785019, 1.435505],
                    attributes: {
                      person_height: 1.464321,
                      members: 0,
                      members_with_tag: 0,
                    },
                  },
                ],
                events: [
                  {
                    category: "COUNT",
                    type: "TIME_CHANGE",
                    attributes: {
                      track_id: 57060,
                      counter_id: 1000003,
                      unit: "seconds",
                      amount: 4.202,
                      counter_value: 10.922001,
                      logic_id: 1000,
                      logic_name: "Queue statistics 1",
                      counter_name: "queueing-time",
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "queue_time");
        assert.equal(value.data.counterValue, 10.922001);
        assert.equal(value.data.queueTime, 4.2);

        validateSchema(value.data, queueTimeSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Xovis V5 new addons", () => {
      const data = {
        data: {
          "live_data": {
            "frames": [
              {
                "framenumber": 5361973,
                "frametype": "FULL",
                "time": 1759748596284,
                "illumination": "SUFFICIENT",
                "tracked_objects": [
                  {
                    "track_id": 82,
                    "type": "PERSON",
                    "position": [
                      -0.67,
                      -1.56,
                      1.76
                    ],
                    "attributes": {
                      "person_height": 1.8,
                      "age": 40,
                      "gender": "NOT_SURE",
                      "tag": "NO_TAG",
                      "face_mask": "NO_MASK",
                      "view_direction": [
                        -0.201882,
                        -0.97941
                      ]
                    }
                  },
                  {
                    "track_id": 2147483724,
                    "type": "GROUP",
                    "position": [
                      -0.02,
                      0.81,
                      1.79
                    ],
                    "attributes": {
                      "tag": "NO_TAG",
                      "members": 1,
                      "members_with_tag": 0
                    }
                  }
                ],
                "events": []
              }
            ],
            "package_info": {
              "agent_id": 1029,
              "id": 469,
              "version": "5.0"
            },
            "sensor_info": {
              "serial_number": "80:1F:12:D5:30:DC",
              "type": "SINGLE_SENSOR"
            }
          }
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gender");
        assert.equal(value.data.gender, "NOT_SURE");

        validateSchema(value.data, genderSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "age");
        assert.equal(value.data.age, 40);

        validateSchema(value.data, ageSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tag");
        assert.equal(value.data.tag, false);

        validateSchema(value.data, tagSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "face_mask");
        assert.equal(value.data.faceMask, false);

        validateSchema(value.data, faceMaskSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "view_direction");
        assert.equal(value.data.xCoordinate, -0.201882);
        assert.equal(value.data.yCoordinate, -0.97941);

        validateSchema(value.data, viewDirectionSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
