const decoder = !(function (e, r) {
  for (const a in r) e[a] = r[a];
  r.__esModule && Object.defineProperty(e, "__esModule", { value: !0 });
})(
  this,
  (() => {
    const e = {
      58: (e) => {
        e.exports = Object.freeze({
          STOP_ANGLE_DETECTION: "STOP_ANGLE_DETECTION",
          START_ANGLE_DETECTION: "START_ANGLE_DETECTION",
        });
      },
      455: (e) => {
        e.exports = Object.freeze({
          CHARGING: "CHARGING",
          OPERATING: "OPERATING",
          UNKNOWN: "UNKNOWN",
        });
      },
      509: (e) => {
        e.exports = Object.freeze({
          BLE_NOT_RESPONDING: "BLE_NOT_RESPONDING",
          INTERNAL_ERROR: "INTERNAL_ERROR",
          SHARED_ANTENNA_NOT_AVAILABLE: "SHARED_ANTENNA_NOT_AVAILABLE",
          BLE_BUSY: "BLE_BUSY",
          SCAN_ALREADY_ON_GOING: "SCAN_ALREADY_ON_GOING",
          NO_BEACON_DETECTED: "NO_BEACON_DETECTED",
          HARDWARE_INCOMPATIBILITY: "HARDWARE_INCOMPATIBILITY",
          UNKNOWN_BLE_FIRMWARE_VERSION: "UNKNOWN_BLE_FIRMWARE_VERSION",
        });
      },
      784: (e) => {
        e.exports = Object.freeze({
          DEBUG_CRASH_INFORMATION: "DEBUG_CRASH_INFORMATION",
          TX_POWER_INDEX_VALUE: "TX_POWER_INDEX_VALUE",
          UPLINK_LENGTH_ERR: "UPLINK_LENGTH_ERR",
          GENERIC_ERROR: "GENERIC_ERROR",
          SPECIFIC_FIRMWARE_PARAMETERS: "SPECIFIC_FIRMWARE_PARAMETERS",
          UNKNOWN: "UNKNOWN",
        });
      },
      697: (e) => {
        e.exports = Object.freeze({
          RESET: "RESET",
          READ_CURRENT_ERROR_AND_SEND_IT: "READ_CURRENT_ERROR_AND_SEND_IT",
          MAKE_TRACKER_RING: "MAKE_TRACKER_RING",
          TRIGGER_AN_ERROR: "TRIGGER_AN_ERROR",
          RESET_BLE_PAIRING: "RESET_BLE_PAIRING",
          TRIGGER_HEARTBEAT_MESSAGE: "TRIGGER_HEARTBEAT_MESSAGE",
          READ_TX_POWER_INDEX: "READ_TX_POWER_INDEX",
          WRITE_TX_POWER_INDEX: "WRITE_TX_POWER_INDEX",
          TRIGGER_BLE_BOOTLOADER: "TRIGGER_BLE_BOOTLOADER",
          SPECIFIC_FIRMWARE_PARAMETERS_REQUEST:
            "SPECIFIC_FIRMWARE_PARAMETERS_REQUEST",
          CONFIGURE_STARTUP_MODES: "CONFIGURE_STARTUP_MODES",
          START_AND_STOP_BLE_ADVERTISEMENT: "START_AND_STOP_BLE_ADVERTISEMENT",
        });
      },
      7: (e) => {
        e.exports = Object.freeze({
          POS_ON_DEMAND: "POS_ON_DEMAND",
          SET_MODE: "SET_MODE",
          REQUEST_CONFIG: "REQUEST_CONFIG",
          START_SOS: "START_SOS",
          STOP_SOS: "STOP_SOS",
          REQUEST_TEMPERATURE_STATUS: "REQUEST_TEMPERATURE_STATUS",
          PROXIMITY: "PROXIMITY",
          ANGLE_DETECTION: "ANGLE_DETECTION",
          SET_PARAM: "SET_PARAM",
          DEBUG_COMMAND: "DEBUG_COMMAND",
        });
      },
      659: (e) => {
        e.exports = Object.freeze({ STATIC: "STATIC", MOVING: "MOVING" });
      },
      789: (e) => {
        e.exports = Object.freeze({
          INVALID_GEOLOC_SENSOR: "INVALID_GEOLOC_SENSOR",
          INVALID_GEOLOC_CONFIG: "INVALID_GEOLOC_CONFIG",
        });
      },
      109: (e) => {
        e.exports = Object.freeze({
          GEOLOC_START: "GEOLOC_START",
          MOTION_START: "MOTION_START",
          MOTION_END: "MOTION_END",
          BLE_CONNECTED: "BLE_CONNECTED",
          BLE_DISCONNECTED: "BLE_DISCONNECTED",
          TEMPERATURE_ALERT: "TEMPERATURE_ALERT",
          BLE_BOND_DELETED: "BLE_BOND_DELETED",
          SOS_MODE_START: "SOS_MODE_START",
          SOS_MODE_END: "SOS_MODE_END",
          ANGLE_DETECTION: "ANGLE_DETECTION",
          GEOFENCING: "GEOFENCING",
        });
      },
      803: (e) => {
        e.exports = Object.freeze({
          FIX_2D: "FIX_2D",
          FIX_3D: "FIX_3D",
          UNKNOWN: "UNKNOWN",
        });
      },
      493: (e) => {
        e.exports = Object.freeze({
          SWITCH_ON: "SWITCH_ON",
          SWITCH_OFF: "SWITCH_OFF",
          FLAT_BATTERY: "FLAT_BATTERY",
          ALERT: "ALERT",
          SOS_MODE: "SOS_MODE",
          SOS_MODE_CLEAR: "SOS_MODE_CLEAR",
          RESET: "RESET",
          BLE_ADVERTISING: "BLE_ADVERTISING",
          BLE_BONDED: "BLE_BONDED",
          BLE_DEBONDED: "BLE_DEBONDED",
          BLE_LINK_LOSS: "BLE_LINK_LOSS",
          PROX_WARNING: "PROX_WARNING",
          PROX_WARNING_REMINDER: "PROX_WARNING_REMINDER",
          PROX_ALARM: "PROX_ALARM",
          PROX_ALARM_REMINDER: "PROX_ALARM_REMINDER",
        });
      },
      161: (e) => {
        e.exports = Object.freeze({
          POSITION_MESSAGE: "POSITION_MESSAGE",
          EXTENDED_POSITION_MESSAGE: "EXTENDED_POSITION_MESSAGE",
          HEARTBEAT: "HEARTBEAT",
          ENERGY_STATUS: "ENERGY_STATUS",
          SHUTDOWN: "SHUTDOWN",
          FRAME_PENDING: "FRAME_PENDING",
          DEBUG: "DEBUG",
          ACTIVITY_STATUS: "ACTIVITY_STATUS",
          CONFIGURATION: "CONFIGURATION",
          SHOCK_DETECTION: "SHOCK_DETECTION",
          HEARTBEAT: "HEARTBEAT",
          EVENT: "EVENT",
          DATA_SCAN_COLLECTION: "DATA_SCAN_COLLECTION",
          PROXIMITY_DETECTION: "PROXIMITY_DETECTION",
          UNKNOWN: "UNKNOWN",
        });
      },
      101: (e) => {
        e.exports = Object.freeze({
          ACTIVITY_COUNTER: "ACTIVITY_COUNTER",
          DEVICE_CONFIGURATION: "DEVICE_CONFIGURATION",
          SHOCK_DETECTION: "SHOCK_DETECTION",
          PERIODIC_ACTIVITY: "PERIODIC_ACTIVITY",
        });
      },
      137: (e) => {
        e.exports = Object.freeze({
          STAND_BY: "STAND_BY",
          MOTION_TRACKING: "MOTION_TRACKING",
          PERMANENT_TRACKING: "PERMANENT_TRACKING",
          MOTION_START_END_TRACKING: "MOTION_START_END_TRACKING",
          ACTIVITY_TRACKING: "ACTIVITY_TRACKING",
          OFF: "OFF",
          UNKNOWN: "UNKNOWN",
        });
      },
      158: (e) => {
        e.exports = Object.freeze({
          GPS: "GPS",
          GPS_TIMEOUT: "GPS_TIMEOUT",
          ENCRYPTED_WIFI_BSSIDS: "ENCRYPTED_WIFI_BSSIDS",
          WIFI_TIMEOUT: "WIFI_TIMEOUT",
          WIFI_FAILURE: "WIFI_FAILURE",
          XGPS_DATA: "XGPS_DATA",
          XGPS_DATA_WITH_GPS_SW_TIME: "XGPS_DATA_WITH_GPS_SW_TIME",
          BLE_BEACON_SCAN: "BLE_BEACON_SCAN",
          BLE_BEACON_FAILURE: "BLE_BEACON_FAILURE",
          WIFI_BSSIDS_WITH_NO_CYPHER: "WIFI_BSSIDS_WITH_NO_CYPHER",
          BLE_BEACON_SCAN_SHORT_ID: "BLE_BEACON_SCAN_SHORT_ID",
          BLE_BEACON_SCAN_LONG_ID: "BLE_BEACON_SCAN_LONG_ID",
          UNKNOWN: "UNKNOWN",
        });
      },
      347: (e) => {
        e.exports = Object.freeze({
          RESET_DEVICE: "RESET_DEVICE",
          DELETE_CONFIG_RESET: "DELETE_CONFIG_RESET",
          DELETE_CONFIG_BLE_BOND_RESET: "DELETE_CONFIG_BLE_BOND_RESET",
        });
      },
      396: (e) => {
        e.exports = Object.freeze({
          USER_ACTION: "USER_ACTION",
          LOW_BATTERY: "LOW_BATTERY",
          DOWNLINK_REQUEST: "DOWNLINK_REQUEST",
          BLE_REQUEST: "BLE_REQUEST",
          BLE_CONNECTED: "BLE_CONNECTED",
        });
      },
      927: (e) => {
        e.exports = Object.freeze({
          USER_TIMEOUT: "USER_TIMEOUT",
          T0_TIMEOUT: "T0_TIMEOUT",
          T1_TIMEOUT: "T1_TIMEOUT",
          UNKNOWN: "UNKNOWN",
        });
      },
      649: (e, r, a) => {
        const o = a(896);
        const t = a(130);
        const i = a(700);
        const d = a(50);
        const n = a(778);
        const m = a(781);
        const u = a(530);
        const c = a(973);
        const s = a(893);
        const l = a(159);
        const p = a(890);
        const I = a(173);
        const y = a(32);
        const b = a(627);
        const T = a(307);
        const w = a(271);
        const E = a(928);
        const f = (function () {
          const e = {};
          const r = {};
          let a = 0;
          for (; a < E.length; ) {
            for (let o = 0; o < E[a].firmwareParameters.length; o++) {
              (e[E[a].firmwareParameters[o].id] = E[a].firmwareParameters[o]),
                (r[E[a].firmwareParameters[o].driverParameterName] =
                  E[a].firmwareParameters[o]);
            }
            a++;
          }
          return [e, r];
        })();
        const v = f[0];
        const g = f[1];
        const _ = a(161);
        const N = a(101);
        const k = a(137);
        const h = a(659);
        const S = a(455);
        const P = a(158);
        const O = a(927);
        const A = a(509);
        const R = a(784);
        const M = a(396);
        const D = a(109);
        const C = a(7);
        const F = a(697);
        const B = a(347);
        const L = a(493);
        const G = a(789);
        const V = a(58);
        const x = a(803);
        function W(e) {
          for (var r = [], a = (e.length, 0); a < e.length; a += 2) {
            r[a / 2] = 255 & parseInt(e.substring(a, a + 2), 16);
          }
          return r;
        }
        W("FF0205");
        const U = (e) => (
          Object.keys(e).forEach(
            (r) =>
              (e[r] && typeof e[r] === "object" && U(e[r])) ||
              (!e[r] && (e[r] === null || void 0 === e[r]) && delete e[r]),
          ),
          e
        );
        function X(e) {
          if (e.length < 1) {
            throw new Error(
              "The payload is not valid to determine Message Type",
            );
          }
          switch (7 & e[5]) {
            case 1:
              return N.ACTIVITY_COUNTER;
            case 2:
              return N.DEVICE_CONFIGURATION;
            case 3:
              return N.SHOCK_DETECTION;
            case 4:
              return N.PERIODIC_ACTIVITY;
            default:
              throw new Error("The Misc Data Tag is unknown");
          }
        }
        function H(e) {
          if (e.length < 5) {
            throw new Error(
              "The payload is not valid to determine Raw Position Type",
            );
          }
          switch (15 & e[4]) {
            case 0:
              return P.GPS;
            case 1:
              return P.GPS_TIMEOUT;
            case 2:
              return P.ENCRYPTED_WIFI_BSSIDS;
            case 3:
              return P.WIFI_TIMEOUT;
            case 4:
              return P.WIFI_FAILURE;
            case 5:
              return P.XGPS_DATA;
            case 6:
              return P.XGPS_DATA_WITH_GPS_SW_TIME;
            case 7:
              return P.BLE_BEACON_SCAN;
            case 8:
              return P.BLE_BEACON_FAILURE;
            case 9:
              return P.WIFI_BSSIDS_WITH_NO_CYPHER;
            case 10:
              return P.BLE_BEACON_SCAN_SHORT_ID;
            case 11:
              return P.BLE_BEACON_SCAN_LONG_ID;
            default:
              return P.UNKNOWN;
          }
        }
        function Y(e) {
          if (e.length < 6) {
            throw new Error("The payload is not valid to determine age");
          }
          return ye(e[5], 0, 2040, 8, 0);
        }
        function K(e) {
          if (e.length < 7) {
            throw new Error("The payload is not valid to determine age");
          }
          return (e[5] << 8) + e[6];
        }
        function z(e, r) {
          let a;
          let o;
          const t = e.length;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (a = 12), (o = ""), (e = e.slice(8, 12));
              break;
            case _.POSITION_MESSAGE:
              (a = 9), (o = "00"), (e = e.slice(6, 9));
          }
          if (t < a) {
            throw new Error(
              "The payload is not valid to determine GPS latitude",
            );
          }
          const i = pe(e) + o;
          let d = parseInt(i, 16);
          return d > 2147483647 && (d -= 4294967296), d / Math.pow(10, 7);
        }
        function j(e, r) {
          let a;
          let o;
          const t = e.length;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (a = 16), (o = ""), (e = e.slice(12, 16));
              break;
            case _.POSITION_MESSAGE:
              (a = 12), (o = "00"), (e = e.slice(9, 12));
          }
          if (t < a) {
            throw new Error(
              "The payload is not valid to determine GPS longitude",
            );
          }
          const i = pe(e) + o;
          let d = parseInt(i, 16);
          return d > 2147483647 && (d -= 4294967296), d / Math.pow(10, 7);
        }
        function q(e, r) {
          let a;
          switch ((e.length, r)) {
            case _.EXTENDED_POSITION_MESSAGE:
              (a = 19), (e = e[18]);
              break;
            case _.POSITION_MESSAGE:
              (a = 13), (e = e[12]);
          }
          return Math.floor(ye(e, 0, 1e3, 8, 0));
        }
        function Q(e, r) {
          let a;
          let o;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (a = 8), (o = e[7]);
              break;
            case _.POSITION_MESSAGE:
              (a = 6), (o = e[5]);
          }
          if (e.length < a) {
            throw new Error(
              "The payload is not valid to determine timeout cause",
            );
          }
          switch (o) {
            case 0:
              return O.USER_TIMEOUT;
            case 1:
              return O.T0_TIMEOUT;
            case 2:
              return O.T1_TIMEOUT;
            default:
              throw new Error("The timeout cause is unknown");
          }
        }
        function J(e, r) {
          const a = [];
          let o;
          const t = e.length;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (o = 12), (e = e.slice(8, 12));
              break;
            case _.POSITION_MESSAGE:
              (o = 10), (e = e.slice(6, 10));
          }
          if (t < o) {
            throw new Error(
              "The payload is not valid to determine Best Satellites C/N",
            );
          }
          return (
            a.push(Math.round(ye(e[0], 0, 50, 8, 0))),
            a.push(Math.round(ye(e[1], 0, 50, 8, 0))),
            a.push(Math.round(ye(e[2], 0, 50, 8, 0))),
            a.push(Math.round(ye(e[3], 0, 50, 8, 0))),
            a
          );
        }
        function Z(e, r) {
          const a = e.length;
          let o;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (o = 13), (e = e.slice(7));
              break;
            case _.POSITION_MESSAGE:
              (o = 11), (e = e.slice(5));
          }
          if (a < o) {
            throw new Error(
              "The payload is not valid to determine battery voltage measures",
            );
          }
          for (var t = [], i = 0; i < 6; i++) {
            const r = ye(e[i], 2.8, 4.2, 8, 2);
            t.push(Math.floor(100 * r) / 100);
          }
          return t;
        }
        function $(e, r) {
          const a = e.length;
          let o;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (o = 14), (e = e[13]);
              break;
            case _.POSITION_MESSAGE:
              (o = 12), (e = e[11]);
          }
          if (a < o) {
            throw new Error("The payload is not valid to determine error code");
          }
          return e;
        }
        function ee(e, r) {
          let a = 0;
          const o = [];
          let t;
          let d;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (t = 14), (d = 7);
              break;
            case _.POSITION_MESSAGE:
              (t = 13), (d = 6);
          }
          for (; e.length >= t + 7 * a; ) {
            const r = `${Ie(e[d + 7 * a])}:${Ie(e[d + 1 + 7 * a])}:${Ie(
              e[d + 2 + 7 * a],
            )}:${Ie(e[d + 3 + 7 * a])}:${Ie(e[d + 4 + 7 * a])}:${Ie(
              e[d + 5 + 7 * a],
            )}`;
            let t = e[d + 6 + 7 * a];
            t > 127 && (t -= 256), o.push(new i.BssidInfo(r, t)), a++;
          }
          return o;
        }
        function re(e, r) {
          let a = 0;
          const o = [];
          let t;
          let i;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (t = 14), (i = 7);
              break;
            case _.POSITION_MESSAGE:
              (t = 13), (i = 6);
          }
          for (; e.length >= t + 7 * a; ) {
            const r = `${Ie(e[i + 7 * a])}-${Ie(e[i + 1 + 7 * a])}-${Ie(
              e[i + 2 + 7 * a],
            )}-${Ie(e[i + 3 + 7 * a])}-${Ie(e[i + 4 + 7 * a])}-${Ie(
              e[i + 5 + 7 * a],
            )}`;
            let t = e[i + 6 + 7 * a];
            t > 127 && (t -= 256), o.push(new d.BeaconIdInfo(r, t)), a++;
          }
          return o;
        }
        function ae(e, r) {
          let a = 0;
          const o = [];
          let t;
          let i;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (t = 24), (i = 7);
              break;
            case _.POSITION_MESSAGE:
              (t = 23), (i = 6);
          }
          for (; e.length >= t + 7 * a; ) {
            const r = `${Ie(e[i + 7 * a])}-${Ie(e[i + 1 + 7 * a])}-${Ie(
              e[i + 2 + 7 * a],
            )}-${Ie(e[i + 3 + 7 * a])}-${Ie(e[i + 4 + 7 * a])}-${Ie(
              e[i + 5 + 7 * a],
            )}-${Ie(e[i + 6 + 7 * a])}-${Ie(e[i + 7 + 7 * a])}-${Ie(
              e[i + 8 + 7 * a],
            )}-${Ie(e[i + 9 + 7 * a])}-${Ie(e[i + 10 + 7 * a])}-${Ie(
              e[i + 11 + 7 * a],
            )}-${Ie(e[i + 12 + 7 * a])}-${Ie(e[i + 13 + 7 * a])}-${Ie(
              e[i + 14 + 7 * a],
            )}-${Ie(e[i + 15 + 7 * a])}`;
            let t = e[i + 16 + 7 * a];
            t > 127 && (t -= 256), o.push(new d.BeaconIdInfo(r, t)), a++;
          }
          return o;
        }
        function oe(e, r) {
          let a;
          let o;
          switch (r) {
            case _.EXTENDED_POSITION_MESSAGE:
              (a = 8), (o = 7);
              break;
            case _.POSITION_MESSAGE:
              (a = 6), (o = 5);
          }
          if (e.length < a) {
            throw new Error(
              "The payload is not valid to determine Ble Beacon Failure",
            );
          }
          switch (e[o]) {
            case 0:
              return A.BLE_NOT_RESPONDING;
            case 1:
              return A.INTERNAL_ERROR;
            case 2:
              return A.SHARED_ANTENNA_NOT_AVAILABLE;
            case 3:
              return A.SCAN_ALREADY_ON_GOING;
            case 4:
              return A.BLE_BUSY;
            case 5:
              return A.NO_BEACON_DETECTED;
            case 6:
              return A.HARDWARE_INCOMPATIBILITY;
            case 7:
              return A.UNKNOWN_BLE_FIRMWARE_VERSION;
            default:
              throw new Error("The Ble Beacon Failure is unknown");
          }
        }
        function te(e, r) {
          if (e.length < r + 2) {
            throw new Error("The payload is not valid to determine axis value");
          }
          let a = (e[r] << 8) + e[r + 1];
          return (a = be(a)), a;
        }
        function ie(e) {
          if (e == null) return !1;
          for (const r of e) if (r < 0) return !0;
          return !1;
        }
        function de(e, r, a, o, t) {
          for (let t = 0; t < r.length; t++) {
            let d = a[t];
            const n = v[r[t]];
            if (void 0 === n) throw new Error(`${r[t]} unknown parameter id`);
            const m = n.driverParameterName;
            if (n.id == 246) {
              if (d == 0) e[m] = "UNKNOWN";
              else {
                const r = ue(w, d);
                if (((parametersProfile = r[1]), (name = r[0]), o && d != 0)) {
                  for (const r of Object.entries(parametersProfile)) {
                    e[r[0]] = r[1];
                  }
                }
                e[m] = name;
              }
            } else {
              if (
                !(
                  (n.readOnly != null && n.readOnly && o) ||
                  n.readOnly == null ||
                  (n.readOnly != null && !n.readOnly)
                )
              ) {
                throw new Error(
                  "Parameter is read only, not allowed to be set",
                );
              }
              switch (n.parameterType.type) {
                case "ParameterTypeNumber":
                  const r = n.parameterType.range;
                  const a = n.parameterType.multiply;
                  const o = n.parameterType.additionalValues;
                  if (
                    ((r.minimum < 0 || ie(o)) &&
                      d > 2147483647 &&
                      (d -= 4294967296),
                    !ne(
                      d,
                      r.minimum,
                      r.maximum,
                      r.exclusiveMinimum,
                      r.exclusiveMaximum,
                      o,
                    ))
                  ) {
                    throw new Error(`${m} parameter value is out of range`);
                  }
                  if ((a != null && (d *= a), n.id == 19)) {
                    if (e.confirmedUplink == null) {
                      const r = {};
                      (r[m] = d), (e.confirmedUplink = r);
                    } else {
                      const r = e.confirmedUplink;
                      (r[m] = d), (e.confirmedUplink = r);
                    }
                  } else e[m] = d;
                  (n.id != 253 && n.id != 254) ||
                    (e[m] = `${((d >> 16) & 255).toString()}.${(
                      (d >> 8) &
                      255
                    ).toString()}.${(255 & d).toString()}`);
                  break;
                case "ParameterTypeString":
                  if (n.parameterType.firmwareValues.indexOf(d) == -1) {
                    throw new Error(`${m} parameter value is unknown`);
                  }
                  e[m] =
                    n.parameterType.possibleValues[
                      n.parameterType.firmwareValues.indexOf(d)
                    ];
                  break;
                case "ParameterTypeBitMap":
                  const t = n.parameterType.properties;
                  const u = n.parameterType.bitMap;
                  let c = parseInt(1, 16);
                  const s = {};
                  for (const e of t) {
                    const r = e.name;
                    const a = e.type;
                    const o = u.find((e) => e.valueFor === r);
                    switch (a) {
                      case "PropertyBoolean":
                        o.length != null && (c = me(o.length));
                        var i = Boolean((d >> o.bitShift) & c);
                        o.inverted != null && o.inverted && (i = !i),
                          (s[e.name] = i);
                        break;
                      case "PropertyString":
                        o.length != null && (c = me(o.length));
                        const r = (d >> o.bitShift) & c;
                        e.possibleValues,
                          (s[e.name] =
                            e.possibleValues[e.firmwareValues.indexOf(r)]);
                        break;
                      case "PropertyObject":
                        const a = {};
                        for (const e of o.values) {
                          if (e.type == "BitMapValue") {
                            let r = parseInt(1, 16);
                            e.length != null && (r = me(e.length)),
                              (i = Boolean((d >> e.bitShift) & r)),
                              e.inverted != null && e.inverted && (i = !i),
                              (a[e.valueFor] = i);
                          }
                        }
                        s[e.name] = a;
                        break;
                      default:
                        throw new Error("Property type is unknown");
                    }
                  }
                  n.id == 18
                    ? ((s[m] = d),
                      e.confirmedUplink == null
                        ? (e.confirmedUplink = s)
                        : (e.confirmedUplink = { ...s, ...e.confirmedUplink }))
                    : (e[m] = s);
                  break;
                default:
                  throw new Error("Parameter type is unknown");
              }
            }
          }
        }
        function ne(e, r, a, o, t, i) {
          let d = !1;
          return (
            !(i == null || !i.includes(e)) ||
            (o != null && o == 1 && (r -= 1),
            t != null && t == 1 && (a -= 1),
            e >= r && e <= a && (d = !0),
            d)
          );
        }
        function me(e) {
          let r = 0;
          for (let a = 0; a < e; a++) r += Math.pow(2, a);
          return parseInt(r, 16);
        }
        function ue(e, r) {
          let a = 0;
          let o = [];
          for (; a < e.length; ) {
            for (let t = 0; t < e[a].profiles.length; t++) {
              if (e[a].profiles[t].id == r) {
                return (
                  (o = e[a].profiles[t].parameters),
                  (name = e[a].profiles[t].name),
                  [name, o]
                );
              }
            }
            a++;
          }
          if (o.length == 0) {
            throw new Error("Dynamic profile value is unknown");
          }
        }
        function ce(e, r) {
          let a = 0;
          let o = null;
          if (r == "UNKNOWN") return 0;
          for (; a < e.length; ) {
            for (let t = 0; t < e[a].profiles.length; t++) {
              if (e[a].profiles[t].name == r) {
                return (o = e[a].profiles[t].id), o;
              }
            }
            a++;
          }
          if (o == null) throw new Error("Dynamic profile value is unknown");
        }
        function se(e) {
          return `00000000${(e &= 4294967295)
            .toString(16)
            .toUpperCase()}`.slice(-8);
        }
        function le(e, r, a, o) {
          return [te(e, r), te(e, a), te(e, o)];
        }
        function pe(e) {
          for (var r = "", a = 0; a < e.length; a++) r += Ie(e[a]);
          return r;
        }
        function Ie(e) {
          let r = e.toString(16);
          return r.length < 2 && (r = `0${r}`), r;
        }
        function ye(e, r, a, o, t) {
          return (e - t / 2) / (((1 << o) - 1 - t) / (a - r)) + r;
        }
        function be(e) {
          return e > 32767 && (e -= 65536), e;
        }
        e.exports = {
          decodeUplink(e) {
            const r = new o.AbeewayUplinkPayload();
            const a = e.bytes;
            switch (
              ((r.messageType = (function (e) {
                if (e.length < 1) {
                  throw new Error(
                    "The payload is not valid to determine Message Type",
                  );
                }
                switch (e[0]) {
                  case 0:
                    return _.FRAME_PENDING;
                  case 3:
                    return _.POSITION_MESSAGE;
                  case 4:
                    return _.ENERGY_STATUS;
                  case 5:
                    return _.HEARTBEAT;
                  case 7:
                    switch (X(e)) {
                      case N.ACTIVITY_COUNTER:
                        return _.ACTIVITY_STATUS;
                      case N.DEVICE_CONFIGURATION:
                        return _.CONFIGURATION;
                      case N.SHOCK_DETECTION:
                        return _.SHOCK_DETECTION;
                      case N.PERIODIC_ACTIVITY:
                        return _.ACTIVITY_STATUS;
                    }
                  case 9:
                    return _.SHUTDOWN;
                  case 10:
                    return _.EVENT;
                  case 11:
                    return _.DATA_SCAN_COLLECTION;
                  case 12:
                    return _.PROXIMITY_DETECTION;
                  case 14:
                    return _.EXTENDED_POSITION_MESSAGE;
                  case 15:
                    return _.DEBUG;
                  default:
                    return _.UNKNOWN;
                }
              })(a)),
              r.messageType != _.FRAME_PENDING &&
                ((r.trackingMode = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine Tracking mode",
                    );
                  }
                  switch ((e[1] >> 5) & 7) {
                    case 0:
                      return k.STAND_BY;
                    case 1:
                      return k.MOTION_TRACKING;
                    case 2:
                      return k.PERMANENT_TRACKING;
                    case 3:
                      return k.MOTION_START_END_TRACKING;
                    case 4:
                      return k.ACTIVITY_TRACKING;
                    case 5:
                      return k.OFF;
                    default:
                      throw new Error("The Mode is unknown");
                  }
                })(a)),
                (r.deviceConfiguration = {}),
                (r.deviceConfiguration.mode = r.trackingMode),
                (r.sosFlag = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine User Action",
                    );
                  }
                  return (e[1] >> 4) & 1;
                })(a)),
                (r.appState = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine App State",
                    );
                  }
                  return (e[1] >> 3) & 1;
                })(a)),
                (r.dynamicMotionState = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine Moving",
                    );
                  }
                  switch ((e[1] >> 2) & 1) {
                    case 0:
                      return h.STATIC;
                    case 1:
                      return h.MOVING;
                    default:
                      throw new Error("The Dynamic Motion State is unknown");
                  }
                })(a)),
                e.fPort == 18
                  ? ((r.batteryLevel = (function (e) {
                      if (e.length < 3) {
                        throw new Error(
                          "The payload is not valid to determine Battery Level",
                        );
                      }
                      const r = e[2];
                      return r == 0 || r == 255 ? null : r;
                    })(a)),
                    (r.batteryStatus = (function (e) {
                      if (e.length < 3) {
                        throw new Error(
                          "The payload is not valid to determine Battery Status",
                        );
                      }
                      const r = e[2];
                      return r == 0
                        ? S.CHARGING
                        : r == 255
                        ? S.UNKNOWN
                        : S.OPERATING;
                    })(a)))
                  : (r.batteryVoltage = (function (e) {
                      if (e.length < 3) {
                        throw new Error(
                          "The payload is not valid to determine Battery Voltage",
                        );
                      }
                      if (e[2] == 0) return 0;
                      const r = ye(e[2], 2.8, 4.2, 8, 2);
                      return Math.round(100 * r) / 100;
                    })(a)),
                (r.temperatureMeasure = (function (e) {
                  if (e.length < 4) {
                    throw new Error(
                      "The payload is not valid to determine Temperature",
                    );
                  }
                  const r = ye(e[3], -44, 85, 8, 0);
                  return Math.round(10 * r) / 10;
                })(a)),
                (r.periodicPosition = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine Periodic Position",
                    );
                  }
                  return ((e[1] >> 1) & 1) == 1;
                })(a)),
                (r.onDemand = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine On Demand Position",
                    );
                  }
                  return (1 & e[1]) == 1;
                })(a)),
                (r.ackToken = (function (e) {
                  if (e.length < 5) {
                    throw new Error(
                      "The payload is not valid to determine Ack Token",
                    );
                  }
                  return (e[4] >> 4) & 15;
                })(a))),
              (r.payload = pe(a)),
              r.messageType)
            ) {
              case _.POSITION_MESSAGE:
                switch (((r.rawPositionType = H(a)), r.rawPositionType)) {
                  case P.GPS:
                    (r.age = Y(a)),
                      (r.gpsLatitude = z(a, _.POSITION_MESSAGE)),
                      (r.gpsLongitude = j(a, _.POSITION_MESSAGE)),
                      (r.horizontalAccuracy = q(a, _.POSITION_MESSAGE));
                    break;
                  case P.GPS_TIMEOUT:
                    (r.timeoutCause = Q(a, _.POSITION_MESSAGE)),
                      (r.bestSatellitesCOverN = J(a, _.POSITION_MESSAGE));
                    break;
                  case P.ENCRYPTED_WIFI_BSSIDS:
                    break;
                  case P.WIFI_TIMEOUT:
                    r.batteryVoltageMeasures = Z(a, _.POSITION_MESSAGE);
                    break;
                  case P.WIFI_FAILURE:
                    (r.batteryVoltageMeasures = Z(a, _.POSITION_MESSAGE)),
                      (r.errorCode = $(a, _.POSITION_MESSAGE));
                    break;
                  case P.XGPS_DATA:
                  case P.XGPS_DATA_WITH_GPS_SW_TIME:
                    break;
                  case P.WIFI_BSSIDS_WITH_NO_CYPHER:
                    (r.age = Y(a)),
                      a.length >= 13 &&
                        (r.wifiBssids = ee(a, _.POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_SCAN:
                    (r.age = Y(a)), (r.bleBssids = ee(a, _.POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_FAILURE:
                    r.bleBeaconFailure = oe(a, _.POSITION_MESSAGE);
                    break;
                  case P.BLE_BEACON_SCAN_SHORT_ID:
                    (r.age = Y(a)),
                      (r.bleBeaconIds = re(a, _.POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_SCAN_LONG_ID:
                    (r.age = Y(a)),
                      (r.bleBeaconIds = ae(a, _.POSITION_MESSAGE));
                    break;
                  default:
                    throw new Error("The Fix Type is unknown");
                }
                break;
              case _.EXTENDED_POSITION_MESSAGE:
                switch (((r.rawPositionType = H(a)), r.rawPositionType)) {
                  case P.GPS:
                    (r.gpsFlag = (function (e) {
                      if (e.length < 8) {
                        throw new Error(
                          "The payload is not valid to determine GPS flag",
                        );
                      }
                      switch (e[7]) {
                        case 0:
                          return x.FIX_2D;
                        case 1:
                          return x.FIX_3D;
                        default:
                          return x.UNKNOWN;
                      }
                    })(a)),
                      (r.age = K(a)),
                      (r.gpsLatitude = z(a, _.EXTENDED_POSITION_MESSAGE)),
                      (r.gpsLongitude = j(a, _.EXTENDED_POSITION_MESSAGE)),
                      (r.horizontalAccuracy = q(
                        a,
                        _.EXTENDED_POSITION_MESSAGE,
                      )),
                      (r.gpsCourseOverGround = (function (e) {
                        if (e.length < 21) {
                          throw new Error(
                            "The payload is not valid to determine GPS course over ground",
                          );
                        }
                        return (e[19] << 8) + e[20];
                      })(a)),
                      (r.gpsSpeedOverGround = (function (e) {
                        if (e.length < 23) {
                          throw new Error(
                            "The payload is not valid to determine GPS speed over ground",
                          );
                        }
                        return (e[21] << 8) + e[22];
                      })(a)),
                      r.gpsFlag == x.FIX_3D &&
                        (r.gpsAltitude = (function (e) {
                          if (e.length < 18) {
                            throw new Error(
                              "The payload is not valid to determine GPS altitude",
                            );
                          }
                          return ((e[16] << 8) + e[17]) / Math.pow(10, 2);
                        })(a)),
                      a.length > 24 &&
                        (r.gpsPrevious = (function (e) {
                          if (e.length < 26) {
                            throw new Error(
                              "The payload is not valid to determine previous gps",
                            );
                          }
                          const r = {};
                          switch (
                            ((r.age = ye(e[23], 0, 2040, 8, 0)),
                            (previousFix = (e[24] << 8) + e[25]),
                            previousFix >> 15)
                          ) {
                            case 0:
                              r.dynamicMotionState = h.STATIC;
                              break;
                            case 1:
                              r.dynamicMotionState = h.MOVING;
                              break;
                            default:
                              throw new Error(
                                "The dynamic motion state of the previous fix is unknown",
                              );
                          }
                          return (
                            (previousN = (previousFix >> 12) & 7),
                            (previousLatitudeDelta = (previousFix >> 6) & 63),
                            (previousLongitudeDelta = 63 & previousFix),
                            (r.latitude =
                              parseInt(pe(e.slice(8, 12)), 16) -
                              ye(previousLatitudeDelta, -32, 31, 6, 0) *
                                (1 << previousN)),
                            r.latitude > 2147483647 &&
                              (r.latitude -= 4294967296),
                            (r.latitude /= Math.pow(10, 7)),
                            (r.longitude =
                              parseInt(pe(e.slice(12, 16)), 16) -
                              ye(previousLongitudeDelta, -32, 31, 6, 0) *
                                (1 << previousN)),
                            r.longitude > 2147483647 &&
                              (r.longitude -= 4294967296),
                            (r.longitude /= Math.pow(10, 7)),
                            r
                          );
                        })(a));
                    break;
                  case P.GPS_TIMEOUT:
                    (r.age = K(a)),
                      (r.timeoutCause = Q(a, _.EXTENDED_POSITION_MESSAGE)),
                      (r.bestSatellitesCOverN = J(
                        a,
                        _.EXTENDED_POSITION_MESSAGE,
                      ));
                    break;
                  case P.ENCRYPTED_WIFI_BSSIDS:
                    break;
                  case P.WIFI_TIMEOUT:
                    (r.age = K(a)),
                      (r.batteryVoltageMeasures = Z(
                        a,
                        _.EXTENDED_POSITION_MESSAGE,
                      ));
                    break;
                  case P.WIFI_FAILURE:
                    (r.age = K(a)),
                      (r.batteryVoltageMeasures = Z(
                        a,
                        _.EXTENDED_POSITION_MESSAGE,
                      )),
                      (r.errorCode = $(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  case P.XGPS_DATA:
                  case P.XGPS_DATA_WITH_GPS_SW_TIME:
                    break;
                  case P.WIFI_BSSIDS_WITH_NO_CYPHER:
                    (r.age = K(a)),
                      a.length >= 14 &&
                        (r.wifiBssids = ee(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_SCAN:
                    (r.age = K(a)),
                      (r.bleBssids = ee(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_FAILURE:
                    (r.age = K(a)),
                      (r.bleBeaconFailure = oe(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_SCAN_SHORT_ID:
                    (r.age = K(a)),
                      (r.bleBeaconIds = re(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  case P.BLE_BEACON_SCAN_LONG_ID:
                    (r.age = K(a)),
                      (r.bleBeaconIds = ae(a, _.EXTENDED_POSITION_MESSAGE));
                    break;
                  default:
                    throw new Error("The Fix Type is unknown");
                }
                break;
              case _.HEARTBEAT:
                (r.resetCause = (function (e) {
                  if (e.length < 6) {
                    throw new Error(
                      "The payload is not valid to determine Reset Cause",
                    );
                  }
                  return e[5];
                })(a)),
                  a.length > 6 &&
                    (r.firmwareVersion = (function (e) {
                      if (e.length < 9) {
                        throw new Error(
                          "The payload is not valid to determine HeartBeat Firmware Version",
                        );
                      }
                      return `${e[6].toString()}.${e[7].toString()}.${e[8].toString()}`;
                    })(a)),
                  a.length > 9 &&
                    (r.bleFirmwareVersion = (function (e) {
                      if (e.length < 12) {
                        throw new Error(
                          "The payload is not valid to determine HeartBeat BLE Firmware Version",
                        );
                      }
                      return `${e[9].toString()}.${e[10].toString()}.${e[11].toString()}`;
                    })(a));
                break;
              case _.ENERGY_STATUS:
                (r.gpsOnRuntime = (function (e) {
                  if (e.length < 9) {
                    throw new Error(
                      "The payload is not valid to determine GPS On Runtime",
                    );
                  }
                  return parseInt(pe(e.slice(5, 9)), 16);
                })(a)),
                  (r.gpsStandbyRuntime = (function (e) {
                    if (e.length < 13) {
                      throw new Error(
                        "The payload is not valid to determine GPS Standby Runtime",
                      );
                    }
                    return parseInt(pe(e.slice(9, 13)), 16);
                  })(a)),
                  (r.wifiScanCount = (function (e) {
                    if (e.length < 17) {
                      throw new Error(
                        "The payload is not valid to determine Wifi Scan Count",
                      );
                    }
                    return parseInt(pe(e.slice(13, 17)), 16);
                  })(a));
                break;
              case _.ACTIVITY_STATUS:
                switch (((r.miscDataTag = X(a)), r.miscDataTag)) {
                  case N.ACTIVITY_COUNTER:
                    r.activityCount = (function (e) {
                      if (e.length < 10) {
                        throw new Error(
                          "The payload is not valid to determine activity counter",
                        );
                      }
                      return parseInt(pe(e.slice(6, 10)), 16);
                    })(a);
                    break;
                  case N.PERIODIC_ACTIVITY:
                    (r.activityReportingWindow = (function (e) {
                      if (e.length < 18) {
                        throw new Error(
                          "The payload is not valid to determine periodic activity",
                        );
                      }
                      const r = [];
                      for (let a = 0; a < 6; a++) {
                        r.push((e[6 + 2 * a] << 8) + e[7 + 2 * a]);
                      }
                      return r;
                    })(a)),
                      (r.activityCount = (function (e) {
                        if (e.length < 22) {
                          throw new Error(
                            "The payload is not valid to determine activity counter in periodic report",
                          );
                        }
                        return parseInt(pe(e.slice(18, 22)), 16);
                      })(a));
                }
                break;
              case _.SHOCK_DETECTION:
                (r.miscDataTag = X(a)),
                  (r.nbOfshock = (function (e) {
                    if (e.length < 7) {
                      throw new Error(
                        "The payload is not valid to determine Nb of shocks",
                      );
                    }
                    return e[6];
                  })(a)),
                  (r.accelerometerShockData = (function (e) {
                    return [te(e, 7), te(e, 9), te(e, 11)];
                  })(a));
                break;
              case _.CONFIGURATION:
                (r.miscDataTag = X(a)),
                  (r.deviceConfiguration = (function (e) {
                    let r = 0;
                    const a = {};
                    if ((e.length - 6) % 5 != 0) {
                      throw new Error(
                        "The payload is not valid to determine configuration parameters",
                      );
                    }
                    const o = [];
                    const t = [];
                    for (; e.length >= 11 + 5 * r; ) {
                      o.push(e[6 + 5 * r]),
                        t.push(
                          parseInt(pe(e.slice(7 + 5 * r, 11 + 5 * r)), 16),
                        ),
                        r++;
                    }
                    return de(a, o, t, !0), a;
                  })(a)),
                  r.deviceConfiguration.mode == null &&
                    (r.deviceConfiguration.mode = r.trackingMode);
                break;
              case _.DEBUG:
                switch (
                  ((r.debugCommandTag = (function (e) {
                    if (e.length < 5) {
                      throw new Error(
                        "The payload is not valid to determine Debug Command Tag",
                      );
                    }
                    switch (15 & e[4]) {
                      case 0:
                        return R.DEBUG_CRASH_INFORMATION;
                      case 1:
                        return R.TX_POWER_INDEX_VALUE;
                      case 2:
                        return R.UPLINK_LENGTH_ERR;
                      case 3:
                        return R.GENERIC_ERROR;
                      case 4:
                        return R.SPECIFIC_FIRMWARE_PARAMETERS;
                      default:
                        throw new Error("The Debug Command Tag is unknown");
                    }
                  })(a)),
                  r.debugCommandTag)
                ) {
                  case R.DEBUG_CRASH_INFORMATION:
                    (r.debugErrorCode = (function (e) {
                      if (e.length < 6) {
                        throw new Error(
                          "The payload is not valid to determine Debug Error Code",
                        );
                      }
                      return e[5];
                    })(a)),
                      (r.debugCrashInfo = (function (e) {
                        if (e.length < 6) {
                          throw new Error(
                            "The payload is not valid to determine Debug Error Info",
                          );
                        }
                        let r = "";
                        for (let a = 6; a < e.length; a++) {
                          r += String.fromCharCode(e[a]);
                        }
                        return r;
                      })(a));
                    break;
                  case R.TX_POWER_INDEX_VALUE:
                    r.txPowerIndex = (function (e) {
                      if (e.length < 6) {
                        throw new Error(
                          "The payload is not valid to determine TxIndex Power",
                        );
                      }
                      return e[5];
                    })(a);
                    break;
                  case R.UPLINK_LENGTH_ERR:
                    r.lengthErrCounter = (function (e) {
                      if (e.length < 7) {
                        throw new Error(
                          "The payload is not valid to determine Ul Length Error counter",
                        );
                      }
                      return (e[5] << 8) + e[6];
                    })(a);
                    break;
                  case R.GENERIC_ERROR:
                    r.genericErrorCode = (function (e) {
                      if (e.length < 6) {
                        throw new Error(
                          "The payload is not valid to determine generic error code",
                        );
                      }
                      switch (e[5]) {
                        case 0:
                          return G.INVALID_GEOLOC_SENSOR;
                        case 1:
                          return G.INVALID_GEOLOC_CONFIG;
                        default:
                          return e[5];
                      }
                    })(a);
                    break;
                  case R.SPECIFIC_FIRMWARE_PARAMETERS:
                    r.specificFirmwareParameters = (function (e) {
                      if (e.length < 17) {
                        throw new Error(
                          "The payload is not valid to determine specific firmware parameters",
                        );
                      }
                      return [
                        se((e[5] << 24) + (e[6] << 16) + (e[7] << 8) + e[8]),
                        se((e[9] << 24) + (e[10] << 16) + (e[11] << 8) + e[12]),
                        se(
                          (e[13] << 24) + (e[14] << 16) + (e[15] << 8) + e[16],
                        ),
                      ];
                    })(a);
                    break;
                  default:
                    throw new Error("The Debug Command Tag is unknown");
                }
                break;
              case _.SHUTDOWN:
                r.shutdownCause = (function (e) {
                  if (e.length < 6) {
                    throw new Error(
                      "The payload is not valid to determine ShutDown Cause",
                    );
                  }
                  switch (e[5]) {
                    case 0:
                      return M.USER_ACTION;
                    case 1:
                      return M.LOW_BATTERY;
                    case 2:
                      return M.DOWNLINK_REQUEST;
                    case 3:
                      return M.BLE_REQUEST;
                    case 4:
                      return M.BLE_CONNECTED;
                    default:
                      throw new Error("The ShutDown Cause is unknown");
                  }
                })(a);
                break;
              case _.FRAME_PENDING:
                r.currentAckTokenValue = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine Ack Token value",
                    );
                  }
                  return e[1];
                })(a);
                break;
              case _.EVENT:
                switch (
                  ((r.eventType = (function (e) {
                    if (e.length < 6) {
                      throw new Error(
                        "The payload is not valid to determine event type",
                      );
                    }
                    switch (e[5]) {
                      case 0:
                        return D.GEOLOC_START;
                      case 1:
                        return D.MOTION_START;
                      case 2:
                        return D.MOTION_END;
                      case 3:
                        return D.BLE_CONNECTED;
                      case 4:
                        return D.BLE_DISCONNECTED;
                      case 5:
                        return D.TEMPERATURE_ALERT;
                      case 6:
                        return D.BLE_BOND_DELETED;
                      case 7:
                        return D.SOS_MODE_START;
                      case 8:
                        return D.SOS_MODE_END;
                      case 9:
                        return D.ANGLE_DETECTION;
                      case 10:
                        return D.GEOFENCING;
                      default:
                        throw new Error("The event type is unknown");
                    }
                  })(a)),
                  r.eventType)
                ) {
                  case D.MOTION_END:
                    r.trackerOrientation = (function (e) {
                      if (e.length < 12) {
                        throw new Error(
                          "The payload is not valid to determine Tracker Orientation",
                        );
                      }
                      return [te(e, 6), te(e, 8), te(e, 10)];
                    })(a);
                    break;
                  case D.TEMPERATURE_ALERT:
                    r.measuredTemperature = (function (e) {
                      if (e.length < 13) {
                        throw new Error(
                          "The payload is not valid to determine measured temperature",
                        );
                      }
                      const r = new n.MeasuredTemperature();
                      switch (e[6]) {
                        case 0:
                          r.state = n.TemperatureState.NORMAL;
                          break;
                        case 1:
                          r.state = n.TemperatureState.HIGH;
                          break;
                        case 2:
                          r.state = n.TemperatureState.LOW;
                          break;
                        case 3:
                          r.state = n.TemperatureState.FEATURE_NOT_ACTIVATED;
                        default:
                          throw new Error("The Temperature state is unknown");
                      }
                      return (
                        (r.max = Math.round(10 * ye(e[7], -44, 85, 8, 0)) / 10),
                        (r.min = Math.round(10 * ye(e[8], -44, 85, 8, 0)) / 10),
                        (r.highCounter = (e[9] << 8) + e[10]),
                        (r.lowCounter = (e[11] << 8) + e[12]),
                        r
                      );
                    })(a);
                    break;
                  case D.ANGLE_DETECTION:
                    r.angleDetection = (function (e) {
                      if (e.length < 13) {
                        throw new Error(
                          "The payload is not valid to determine angle detection",
                        );
                      }
                      const r = new y.AngleDetection();
                      const a = new I.AngleDetectionFlags();
                      switch (e[6] >> 5) {
                        case 0:
                          a.transition = I.Transition.LEARNING_TO_NORMAL;
                          break;
                        case 1:
                          a.transition = I.Transition.NORMAL_TO_LEARNING;
                          break;
                        case 2:
                          a.transition = I.Transition.NORMAL_TO_CRITICAL;
                          break;
                        case 3:
                          a.transition = I.Transition.CRITICAL_TO_NORMAL;
                          break;
                        case 4:
                          a.transition = I.Transition.CRITICAL_TO_LEARNING;
                          break;
                        default:
                          throw new Error(
                            "The transition flag of angle detection is unknown",
                          );
                      }
                      switch ((e[6] >> 3) & 3) {
                        case 0:
                          a.triggerType =
                            I.TriggerType.CRITICAL_ANGLE_REPORTING;
                          break;
                        case 1:
                          a.triggerType =
                            I.TriggerType.ANGLE_DEVIATION_REPORTING;
                          break;
                        case 2:
                          a.triggerType = I.TriggerType.SHOCK_TRIGGER;
                          break;
                        case 3:
                          a.triggerType = I.TriggerType.RFU;
                          break;
                        default:
                          throw new Error(
                            "The trigger type flag of angle detection is unknown",
                          );
                      }
                      return (
                        (a.notificationIdentifier = 7 & e[6]),
                        (r.flags = a),
                        (r.age = (e[7] << 8) + e[8]),
                        (r.referenceVector = le(e, 9, 11, 13)),
                        (r.criticalVector = le(e, 15, 17, 19)),
                        (r.angle = be(e[21])),
                        r
                      );
                    })(a);
                    break;
                  case D.GEOFENCING:
                    r.geofencingNotification = (function (e) {
                      const r = new b.GeofencingNotification();
                      switch (
                        ((r.geofencingFormat = (e[6] >> 4) & 15), 15 & e[6])
                      ) {
                        case 0:
                          r.geofencingType = b.GeofencingType.SAFE_AREA;
                          break;
                        case 1:
                          r.geofencingType = b.GeofencingType.ENTRY;
                          break;
                        case 2:
                          r.geofencingType = b.GeofencingType.EXIT;
                          break;
                        case 3:
                          r.geofencingType = b.GeofencingType.HAZARD;
                          break;
                        default:
                          throw new Error("The geofencing type is unknown");
                      }
                      return (
                        r.geofencingFormat == 0 &&
                          (r.id = (e[7] << 16) + (e[8] << 8) + e[9]),
                        r
                      );
                    })(a);
                }
                break;
              case _.DATA_SCAN_COLLECTION:
                r.dataScanCollection = (function (e) {
                  if (e.length < 8) {
                    throw new Error(
                      "The payload is not valid to determine scan collection",
                    );
                  }
                  const r = new m.ScanCollection();
                  switch (15 & e[4]) {
                    case 0:
                      r.scanType = m.ScanType.BLE_BEACONS;
                      break;
                    case 1:
                      r.scanType = m.ScanType.WIFI_BSSID;
                      break;
                    case 2:
                      r.scanType = m.ScanType.BLE_BEACONS_COLLECTION;
                      break;
                    default:
                      throw new Error("ScanType is unknown");
                  }
                  const a = (e[5] >> 7) & 1;
                  switch (((r.again = a == 1), (e[5] >> 6) & 1)) {
                    case 0:
                      r.dataFormat = m.DataFormat.BEACON_ID;
                      break;
                    case 1:
                      r.dataFormat = m.DataFormat.MAC_ADDRESS;
                      break;
                    default:
                      throw new Error("DataFormat is unknown");
                  }
                  switch (
                    ((r.fragmentIdentification = 31 & e[5]),
                    (r.collectionIdentifier = e[6]),
                    (r.hash = e[7]),
                    r.dataFormat)
                  ) {
                    case m.DataFormat.BEACON_ID:
                      if ((e.length - 8) % 4 != 0) {
                        throw new Error(
                          "The payload is not valid to determine 4-byte scan result",
                        );
                      }
                      let a = 0;
                      const o = [];
                      for (; e.length >= 12 + 4 * a; ) {
                        let t = null;
                        t =
                          r.scanType == m.ScanType.BLE_BEACONS_COLLECTION
                            ? pe(e.slice(9 + 4 * a, 12 + 4 * a))
                            : pe(e.slice(10 + 4 * a, 12 + 4 * a));
                        let i = e[8 + 4 * a];
                        i > 127 && (i -= 256),
                          o.push(new d.BeaconIdInfo(t, i)),
                          a++;
                      }
                      r.beaconIdData = o;
                      break;
                    case m.DataFormat.MAC_ADDRESS:
                      if ((e.length - 8) % 7 != 0) {
                        throw new Error(
                          "The payload is not valid to determine 7-byte scan result",
                        );
                      }
                      let t = 0;
                      const n = [];
                      for (; e.length >= 15 + 7 * t; ) {
                        const r = `${Ie(e[9 + 7 * t])}:${Ie(
                          e[10 + 7 * t],
                        )}:${Ie(e[11 + 7 * t])}:${Ie(e[12 + 7 * t])}:${Ie(
                          e[13 + 7 * t],
                        )}:${Ie(e[14 + 7 * t])}`;
                        let a = e[8 + 7 * t];
                        a > 127 && (a -= 256),
                          n.push(new i.BssidInfo(r, a)),
                          t++;
                      }
                      r.macAddressData = n;
                  }
                  return r;
                })(a);
                break;
              case _.PROXIMITY_DETECTION:
                if (a.length < 6) {
                  throw new AbeewayException(
                    "The payload is not valid to determine proximity payload Type",
                  );
                }
                let e;
                let o;
                switch (7 & a[5]) {
                  case 0:
                    e = u.NotificationType.WARNING_MESSAGE;
                    break;
                  case 1:
                    e = u.NotificationType.ALERT_MESSAGE;
                    break;
                  case 2:
                    e = u.NotificationType.RECORD_MESSAGE;
                    break;
                  case 3:
                    r.proximityDailyReport = (function (e) {
                      if (e.length < 42) {
                        throw new Error(
                          "The payload is not valid to determine proximity daily report",
                        );
                      }
                      const r = new c.ProximityDailyReport();
                      return (
                        (r.dailyAlertDay0 = parseInt(pe(e.slice(6, 10)), 16)),
                        (r.dailyWarningDay0 = parseInt(
                          pe(e.slice(10, 14)),
                          16,
                        )),
                        (r.dailyExposureDay0 = parseInt(
                          pe(e.slice(14, 18)),
                          16,
                        )),
                        (r.dailyAlertDay1 = parseInt(pe(e.slice(18, 22)), 16)),
                        (r.dailyWarningDay1 = parseInt(
                          pe(e.slice(22, 26)),
                          16,
                        )),
                        (r.dailyExposureDay1 = parseInt(
                          pe(e.slice(26, 30)),
                          16,
                        )),
                        (r.dailyAlertDay2 = parseInt(pe(e.slice(30, 34)), 16)),
                        (r.dailyWarningDay2 = parseInt(
                          pe(e.slice(34, 38)),
                          16,
                        )),
                        (r.dailyExposureDay2 = parseInt(
                          pe(e.slice(38, 42)),
                          16,
                        )),
                        r
                      );
                    })(a);
                    break;
                  case 4:
                    o = !1;
                    break;
                  case 5:
                    o = !0;
                    break;
                  case 6:
                    r.proximityDailyResponse = (function (e) {
                      if (e.length < 19) {
                        throw new Error(
                          "The payload is not valid to determine proximity daily response",
                        );
                      }
                      const r = new s.ProximityDailyResponse();
                      return (
                        (r.dayIdentifier = e[6]),
                        (r.dailyAlert = parseInt(pe(e.slice(7, 11)), 16)),
                        (r.dailyWarning = parseInt(pe(e.slice(11, 15)), 16)),
                        (r.dailyExposure = parseInt(pe(e.slice(15, 19)), 16)),
                        r
                      );
                    })(a);
                    break;
                  default:
                    throw new Error(
                      "The Proximity Notification Type is unknown",
                    );
                }
                e != null &&
                  (r.proximityNotification = (function (e, r) {
                    if (e.length < 38) {
                      throw new Error(
                        "The payload is not valid to determine proximity notification",
                      );
                    }
                    const a = new (0, u.ProximityNotification)();
                    switch (
                      ((a.notificationType = r),
                      (a.encrypted = ((e[5] >> 7) & 1) != 0),
                      (e[5] >> 5) & 3)
                    ) {
                      case 0:
                        a.recordAction = u.RecordAction.RECORD_START;
                        break;
                      case 1:
                        a.recordAction = u.RecordAction.RECORD_UPDATE;
                        break;
                      case 2:
                        a.recordAction = u.RecordAction.RECORD_STOP;
                        break;
                      default:
                        throw new Error(
                          "The proximity notification record action is unknown",
                        );
                    }
                    return (
                      (a.rollingProximityIdentifier = pe(e.slice(6, 22))),
                      (a.closestDistanceRecording =
                        ((e[22] << 8) + e[23]) / 10),
                      (a.distanceAverageRecorded = ((e[24] << 8) + e[25]) / 10),
                      (a.cumulatedExposure = (e[26] << 8) + e[27]),
                      (a.metadata = pe(e.slice(28, 32))),
                      (a.cumulatedContactDuration =
                        65535 * ((e[5] >> 3) & 3) + (e[32] << 8) + e[33]),
                      (a.currentDailyExposure = parseInt(
                        pe(e.slice(34, 38)),
                        16,
                      )),
                      a
                    );
                  })(a, e)),
                  o != null &&
                    (r.proximityWhiteListing = (function (e, r) {
                      if (e.length < 23) {
                        throw new Error(
                          "The payload is not valid to determine proximity white listing",
                        );
                      }
                      const a = new l.ProximityWhiteListing();
                      switch (
                        ((a.solicited = r),
                        (a.encrypted = ((e[5] >> 7) & 1) != 0),
                        (a.rollingProximityIdentifier = pe(e.slice(6, 22))),
                        7 & e[22])
                      ) {
                        case 0:
                          a.list = l.List.PEER_LIST;
                          break;
                        case 1:
                          a.list = l.List.WARNING_LIST;
                          break;
                        case 2:
                          a.list = l.List.ALERT_LIST;
                          break;
                        default:
                          throw new Error(
                            "The payload is not valid to determine proximity white listing list",
                          );
                      }
                      switch ((e[22] >> 3) & 1) {
                        case 0:
                          a.recordStatus = l.RecordStatus.NOT_WHITE_LISTED;
                          break;
                        case 1:
                          a.recordStatus = l.RecordStatus.WHITE_LISTED;
                      }
                      return a;
                    })(a, o));
                break;
              default:
                throw new Error("The message type is unknown");
            }
            return U(r);
          },
          decodeDownlink(e) {
            const r = new t.AbeewayDownlinkPayload();
            const a = e.bytes;
            switch (
              ((r.payload = pe(a)),
              (r.ackToken = (function (e) {
                if (e.length < 2) {
                  throw new Error(
                    "The payload is not valid to determine Ack Token",
                  );
                }
                return 15 & e[1];
              })(a)),
              (r.downMessageType = (function (e) {
                if (e.length < 2) {
                  throw new Error(
                    "The payload is not valid to determine downlink message type",
                  );
                }
                switch (e[0]) {
                  case 1:
                    return C.POS_ON_DEMAND;
                  case 2:
                    return C.SET_MODE;
                  case 3:
                    return C.REQUEST_CONFIG;
                  case 4:
                    return C.START_SOS;
                  case 5:
                    return C.STOP_SOS;
                  case 6:
                    return C.REQUEST_TEMPERATURE_STATUS;
                  case 7:
                    return C.PROXIMITY;
                  case 8:
                    return C.ANGLE_DETECTION;
                  case 11:
                    return C.SET_PARAM;
                  case 255:
                    return C.DEBUG_COMMAND;
                  default:
                    throw new Error("The downlink message type is Unknown");
                }
              })(a)),
              r.downMessageType)
            ) {
              case C.POS_ON_DEMAND:
                break;
              case C.SET_MODE:
                r.modeValue = (function (e) {
                  if (e.length < 3) {
                    throw new Error(
                      "The payload is not valid to determine operational mode",
                    );
                  }
                  switch (e[2]) {
                    case 0:
                      return k.STAND_BY;
                    case 1:
                      return k.MOTION_TRACKING;
                    case 2:
                      return k.PERMANENT_TRACKING;
                    case 3:
                      return k.MOTION_START_END_TRACKING;
                    case 4:
                      return k.ACTIVITY_TRACKING;
                    case 5:
                      return k.OFF;
                    default:
                      throw new Error("The mode is unknown");
                  }
                })(a);
                break;
              case C.REQUEST_CONFIG:
                if (a.length > 2) {
                  if (a.length < 3 || a.length > 22) {
                    throw new Error(
                      "The payload is not valid to determine Parameters",
                    );
                  }
                  (r.listParameterID = (function (e) {
                    const r = [];
                    for (let a = 2; a < e.length; a++) r.push(e[a]);
                    return r;
                  })(a)),
                    (r.listParameterIDNames = (function (e) {
                      const r = [];
                      for (const a of e) {
                        let e = null;
                        (e =
                          v[a].driverParameterName == "gpsEHPE"
                            ? "GPS_EHPE"
                            : v[a].driverParameterName == "mode"
                            ? "GET_MODE"
                            : v[a].driverParameterName == "firmwareVersion"
                            ? "FW_VERSION"
                            : v[a].driverParameterName == "bleFirmwareVersion"
                            ? "BLE_VERSION"
                            : v[a].driverParameterName
                                .replace(
                                  /[\w]([A-Z1-9])/g,
                                  (e) => `${e[0]}_${e[1]}`,
                                )
                                .toUpperCase()),
                          r.push(`${Ie(a).toUpperCase()}:${e}`);
                      }
                      return r;
                    })(r.listParameterID));
                }
                break;
              case C.START_SOS:
              case C.STOP_SOS:
              case C.REQUEST_TEMPERATURE_STATUS:
                break;
              case C.PROXIMITY:
                r.proximityMessage = (function (e) {
                  if (e.length < 3) {
                    throw new Error(
                      "The payload is not valid to determine proximity message",
                    );
                  }
                  const r = new p.ProximityMessage();
                  switch (e[2]) {
                    case 0:
                      r.type = p.Type.GET_RECORD_STATUS;
                      break;
                    case 1:
                      r.type = p.Type.SET_WHITE_LIST_STATUS;
                      break;
                    case 2:
                      r.type = p.Type.GET_DAILY_INFORMATION;
                      break;
                    case 3:
                      r.type = p.Type.CLEAR_DAILY_INFORMATION;
                      break;
                    default:
                      throw new Error("The proximity message type is Unknown");
                  }
                  if (
                    r.type == p.Type.GET_RECORD_STATUS ||
                    r.type == p.Type.SET_WHITE_LIST_STATUS
                  ) {
                    if (e.length < 19) {
                      throw new Error(
                        "The payload is not valid to determine rolling proximity identifier",
                      );
                    }
                    r.rollingProximityIdentifier = pe(e.slice(3, 19));
                  }
                  if (r.type == p.Type.SET_WHITE_LIST_STATUS) {
                    if (e.length < 20) {
                      throw new Error(
                        "The payload is not valid to determine record status",
                      );
                    }
                    switch (e[19]) {
                      case 0:
                        r.recordStatus = p.SetRecordStatus.RESET_WHITE_LISTING;
                        break;
                      case 1:
                        r.recordStatus = p.SetRecordStatus.SET_WHITE_LISTING;
                        break;
                      default:
                        throw new Error("The record status is unknown");
                    }
                  }
                  if (
                    r.type == p.Type.GET_DAILY_INFORMATION ||
                    r.type == p.Type.CLEAR_DAILY_INFORMATION
                  ) {
                    if (e.length < 4) {
                      throw new Error(
                        "The payload is not valid to determine day identifier",
                      );
                    }
                    r.dayIdentifier = e[3];
                  }
                  return r;
                })(a);
                break;
              case C.ANGLE_DETECTION:
                r.angleDetectionControl = (function (e) {
                  if (e.length < 2) {
                    throw new Error(
                      "The payload is not valid to determine the control of the angle detection",
                    );
                  }
                  switch (e[2]) {
                    case 0:
                      return V.STOP_ANGLE_DETECTION;
                    case 1:
                      return V.START_ANGLE_DETECTION;
                    default:
                      throw new Error("The control angle detection is unknown");
                  }
                })(a);
                break;
              case C.SET_PARAM:
                r.setParameters = (function (e) {
                  if (e.length < 7 || e.length > 27) {
                    throw new Error(
                      "The payload is not valid to determine Parameter IDs",
                    );
                  }
                  const r = [];
                  const a = [];
                  const o = {};
                  const t = (e.length - 2) / 5;
                  for (let i = 0; i < t; i++) {
                    r.push(e[2 + 5 * i]),
                      a.push(parseInt(pe(e.slice(3 + 5 * i, 7 + 5 * i)), 16));
                  }
                  return de(o, r, a, !1), o;
                })(a);
                break;
              case C.DEBUG_COMMAND:
                switch (
                  ((r.debugCommandType = (function (e) {
                    if (e.length < 3) {
                      throw new Error(
                        "The payload is not valid to determine Debug command",
                      );
                    }
                    switch (e[2]) {
                      case 1:
                        return F.RESET;
                      case 2:
                        return F.RESET_BLE_PAIRING;
                      case 3:
                        return F.MAKE_TRACKER_RING;
                      case 4:
                        return F.READ_CURRENT_ERROR_AND_SEND_IT;
                      case 5:
                        return F.TRIGGER_HEARTBEAT_MESSAGE;
                      case 6:
                        return F.READ_TX_POWER_INDEX;
                      case 7:
                        return F.WRITE_TX_POWER_INDEX;
                      case 8:
                        return F.TRIGGER_BLE_BOOTLOADER;
                      case 9:
                        return F.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST;
                      case 10:
                        return F.CONFIGURE_STARTUP_MODES;
                      case 11:
                        return F.START_AND_STOP_BLE_ADVERTISEMENT;
                      case 241:
                        return F.TRIGGER_AN_ERROR;
                      default:
                        throw new Error("The debug command is unknown");
                    }
                  })(a)),
                  r.debugCommandType)
                ) {
                  case F.RESET:
                    r.resetAction = (function (e) {
                      if (e.length == 4) {
                        switch (e[3]) {
                          case 0:
                            return B.RESET_DEVICE;
                          case 1:
                            return B.DELETE_CONFIG_RESET;
                          case 2:
                            return B.DELETE_CONFIG_BLE_BOND_RESET;
                          default:
                            throw new Error("The ResetAction is unknown");
                        }
                      }
                    })(a);
                    break;
                  case F.WRITE_TX_POWER_INDEX:
                    r.txPowerIndex = (function (e) {
                      if (e.length < 4) {
                        throw new Error(
                          "The payload is not valid to determine Tx Index Power",
                        );
                      }
                      return e[3];
                    })(a);
                    break;
                  case F.MAKE_TRACKER_RING:
                    (r.melodyId = (function (e) {
                      if (e.length > 3) {
                        switch (e[3]) {
                          case 0:
                            return L.SWITCH_ON;
                          case 1:
                            return L.SWITCH_OFF;
                          case 2:
                            return L.FLAT_BATTERY;
                          case 3:
                            return L.ALERT;
                          case 4:
                            return L.SOS_MODE;
                          case 5:
                            return L.SOS_MODE_CLEAR;
                          case 6:
                            return L.RESET;
                          case 7:
                            return L.BLE_ADVERTISING;
                          case 8:
                            return L.BLE_BONDED;
                          case 9:
                            return L.BLE_DEBONDED;
                          case 10:
                            return L.BLE_LINK_LOSS;
                          case 11:
                            return L.PROX_WARNING;
                          case 12:
                            return L.PROX_WARNING_REMINDER;
                          case 13:
                            return L.PROX_ALARM;
                          case 14:
                            return L.PROX_ALARM_REMINDER;
                          default:
                            throw new Error("The melody ID is unknown");
                        }
                      }
                    })(a)),
                      (r.buzzerDuration = (function (e) {
                        if (e.length > 4) return e[4];
                      })(a));
                    break;
                  case F.START_AND_STOP_BLE_ADVERTISEMENT:
                    r.bleAdvertisementDuration = (function (e) {
                      if (e.length < 4) {
                        throw new Error(
                          "The payload is not valid to determine duration of BLE advertisement",
                        );
                      }
                      return (e[3] << 8) + e[4];
                    })(a);
                    break;
                  case F.CONFIGURE_STARTUP_MODES:
                    r.startupModes = (function (e) {
                      return new T.StartupModes(
                        (1 & e[3]) == 1,
                        ((e[3] >> 1) & 1) == 1,
                      );
                    })(a);
                }
                break;
              default:
                throw new Error("The Downlink Message Type is unknown");
            }
            return r;
          },
          encodeDownlink(e) {
            const r = {};
            let a = [];
            if (e == null) throw new Error("No data to encode");
            if (e.downMessageType == null) {
              throw new Error("No downlink message type");
            }
            switch (e.downMessageType) {
              case C.POS_ON_DEMAND:
                a = (function (e) {
                  const r = [];
                  return (r[0] = 1), (r[1] = 15 & e.ackToken), r;
                })(e);
                break;
              case C.SET_MODE:
                a = (function (e) {
                  const r = [];
                  if (
                    ((r[0] = 2), (r[1] = 15 & e.ackToken), e.modeValue == null)
                  ) {
                    throw new Error("No mode value");
                  }
                  switch (e.modeValue) {
                    case k.STAND_BY:
                      r[2] = 0;
                      break;
                    case k.MOTION_TRACKING:
                      r[2] = 1;
                      break;
                    case k.PERMANENT_TRACKING:
                      r[2] = 2;
                      break;
                    case k.MOTION_START_END_TRACKING:
                      r[2] = 3;
                      break;
                    case k.ACTIVITY_TRACKING:
                      r[2] = 4;
                      break;
                    case k.OFF:
                      r[2] = 5;
                  }
                  return r;
                })(e);
                break;
              case C.REQUEST_CONFIG:
                a = (function (e) {
                  const r = [];
                  (r[0] = 3), (r[1] = 15 & e.ackToken);
                  let a = 0;
                  e.listParameterID != null && (a = e.listParameterID.length);
                  for (let o = 0; o < a; o++) r[2 + o] = e.listParameterID[o];
                  return r;
                })(e);
                break;
              case C.START_SOS:
                a = (function (e) {
                  const r = [];
                  return (r[0] = 4), (r[1] = 15 & e.ackToken), r;
                })(e);
                break;
              case C.STOP_SOS:
                a = (function (e) {
                  const r = [];
                  return (r[0] = 5), (r[1] = 15 & e.ackToken), r;
                })(e);
                break;
              case C.REQUEST_TEMPERATURE_STATUS:
                a = (function (e) {
                  const r = [];
                  return (r[0] = 6), (r[1] = 15 & e.ackToken), r;
                })(e);
                break;
              case C.PROXIMITY:
                a = (function (e) {
                  let r = [];
                  if (
                    ((r[0] = 7),
                    (r[1] = 15 & e.ackToken),
                    e.proximityMessage == null)
                  ) {
                    throw new Error("No Proximity Message");
                  }
                  switch (e.proximityMessage.type) {
                    case p.Type.GET_RECORD_STATUS:
                      if (
                        ((r[2] = 0),
                        e.proximityMessage.rollingProximityIdentifier == null)
                      ) {
                        throw new Error("Missing rolling proximity identifier");
                      }
                      r = r.concat(
                        W(e.proximityMessage.rollingProximityIdentifier),
                      );
                      break;
                    case p.Type.SET_WHITE_LIST_STATUS:
                      if (
                        ((r[2] = 1),
                        e.proximityMessage.rollingProximityIdentifier == null)
                      ) {
                        throw new Error("Missing rolling proximity identifier");
                      }
                      if (
                        ((r = r.concat(
                          W(e.proximityMessage.rollingProximityIdentifier),
                        )),
                        e.proximityMessage.recordStatus == null)
                      ) {
                        throw new Error("Missing record status");
                      }
                      switch (e.proximityMessage.recordStatus) {
                        case p.SetRecordStatus.RESET_WHITE_LISTING:
                          r[19] = 0;
                          break;
                        case p.SetRecordStatus.SET_WHITE_LISTING:
                          r[19] = 1;
                      }
                      break;
                    case p.Type.GET_DAILY_INFORMATION:
                      if (
                        ((r[2] = 2), e.proximityMessage.dayIdentifier == null)
                      ) {
                        throw new Error("Missing day identifier");
                      }
                      r[3] = 255 & e.proximityMessage.dayIdentifier;
                      break;
                    case p.Type.CLEAR_DAILY_INFORMATION:
                      if (e.proximityMessage.dayIdentifier == null) {
                        throw new Error("Missing day identifier");
                      }
                      (r[3] = 255 & e.proximityMessage.dayIdentifier),
                        (r[2] = 3);
                      break;
                    default:
                      r[2] = 3;
                  }
                  return r;
                })(e);
                break;
              case C.ANGLE_DETECTION:
                a = (function (e) {
                  const r = [];
                  if (
                    ((r[0] = 8),
                    (r[1] = 15 & e.ackToken),
                    e.angleDetectionControl == null)
                  ) {
                    throw new Error("No angle detection control");
                  }
                  switch (e.angleDetectionControl) {
                    case V.STOP_ANGLE_DETECTION:
                      r[2] = 0;
                      break;
                    case V.START_ANGLE_DETECTION:
                      r[2] = 1;
                      break;
                    default:
                      throw new Error("The angle detection control is unknown");
                  }
                  return r;
                })(e);
                break;
              case C.SET_PARAM:
                a = (function (e) {
                  const r = e.setParameters;
                  if (Object.keys(r).length > 5) {
                    throw new Error(
                      "Too many parameters for one downlink message",
                    );
                  }
                  const a = [];
                  (a[0] = 11), (a[1] = 15 & e.ackToken);
                  let o = 0;
                  for (const e of Object.entries(r)) {
                    const r = g[e[0]];
                    if (r == null && e[0] != "confirmedUplink") {
                      throw new Error(`${e[0]} unknown parameter name`);
                    }
                    if (e[0] == "confirmedUplink") {
                      for (const r of Object.entries(e[1])) {
                        (r[0] != "confirmedUlRetry" &&
                          r[0] != "confirmedUlBitmap") ||
                          ((a[2 + 5 * o] = g[r[0]].id),
                          (a[3 + 5 * o] = (r[1] >> 24) & 255),
                          (a[4 + 5 * o] = (r[1] >> 16) & 255),
                          (a[5 + 5 * o] = (r[1] >> 8) & 255),
                          (a[6 + 5 * o] = 255 & r[1]),
                          o++);
                      }
                    } else if (e[0] == "dynamicProfile") {
                      (a[2 + 5 * o] = 255 & r.id),
                        (a[3 + 5 * o] = 0),
                        (a[4 + 5 * o] = 0),
                        (a[5 + 5 * o] = 0),
                        (a[6 + 5 * o] = ce(w, e[1])),
                        o++;
                    } else {
                      let t = e[1];
                      const i = r.id;
                      const d = r.parameterType.type;
                      switch (((a[2 + 5 * o] = 255 & i), d)) {
                        case "ParameterTypeNumber":
                          const i = r.parameterType.range;
                          const d = r.parameterType.multiply;
                          const n = r.parameterType.additionalValues;
                          if (
                            !ne(
                              t,
                              i.minimum,
                              i.maximum,
                              i.exclusiveMinimum,
                              i.exclusiveMaximum,
                              n,
                            )
                          ) {
                            throw new Error(
                              `${e[0]} parameter value is out of range`,
                            );
                          }
                          d != null && (t /= d),
                            t < 0 && (t += 4294967296),
                            (a[3 + 5 * o] = (t >> 24) & 255),
                            (a[4 + 5 * o] = (t >> 16) & 255),
                            (a[5 + 5 * o] = (t >> 8) & 255),
                            (a[6 + 5 * o] = 255 & t),
                            o++;
                          break;
                        case "ParameterTypeString":
                          if (r.parameterType.possibleValues.indexOf(t) == -1) {
                            throw new Error(
                              `${e[0]} parameter value is unknown`,
                            );
                          }
                          (a[3 + 5 * o] = 0),
                            (a[4 + 5 * o] = 0),
                            (a[5 + 5 * o] = 0),
                            (a[6 + 5 * o] =
                              r.parameterType.firmwareValues[
                                r.parameterType.possibleValues.indexOf(t)
                              ]),
                            o++;
                          break;
                        case "ParameterTypeBitMap":
                          let m = 0;
                          const u = r.parameterType.properties;
                          const c = r.parameterType.bitMap;
                          for (const r of Object.entries(e[1])) {
                            const e = r[0];
                            let a = r[1];
                            const o = c.find((r) => r.valueFor === e);
                            const t = u.find((r) => r.name === e);
                            switch (t.type) {
                              case "PropertyBoolean":
                                o.inverted != null && o.inverted && (a = !a),
                                  (m |= Number(a) << o.bitShift);
                                break;
                              case "PropertyString":
                                m |=
                                  t.firmwareValues[
                                    t.possibleValues.indexOf(a)
                                  ] << o.bitShift;
                                break;
                              case "PropertyObject":
                                for (const e of Object.entries(a)) {
                                  const r = o.values.find(
                                    (r) => r.valueFor === e[0],
                                  );
                                  r.inverted != null &&
                                    r.inverted &&
                                    (e[1] = !e[1]),
                                    (m |= Number(e[1]) << r.bitShift);
                                }
                                break;
                              default:
                                throw new Error("Property type is unknown");
                            }
                          }
                          (a[3 + 5 * o] = (m >> 24) & 255),
                            (a[4 + 5 * o] = (m >> 16) & 255),
                            (a[5 + 5 * o] = (m >> 8) & 255),
                            (a[6 + 5 * o] = 255 & m),
                            o++;
                          break;
                        default:
                          throw new Error("Parameter type is unknown");
                      }
                    }
                  }
                  return a;
                })(e);
                break;
              case C.DEBUG_COMMAND:
                a = (function (e) {
                  const r = [];
                  if (
                    ((r[0] = 255),
                    (r[1] = 15 & e.ackToken),
                    e.debugCommandType == null)
                  ) {
                    throw new Error("No debug command type");
                  }
                  switch (e.debugCommandType) {
                    case F.RESET:
                      if (((r[2] = 1), e.resetAction != null)) {
                        switch (e.resetAction) {
                          case B.RESET_DEVICE:
                            r[3] = 0;
                            break;
                          case B.DELETE_CONFIG_RESET:
                            r[3] = 1;
                            break;
                          case B.DELETE_CONFIG_BLE_BOND_RESET:
                            r[3] = 2;
                            break;
                          default:
                            throw new Error("Invalid Reset Action Value");
                        }
                      }
                      return r;
                    case F.MAKE_TRACKER_RING:
                      if (((r[2] = 3), e.melodyId != null)) {
                        switch (e.melodyId) {
                          case L.SWITCH_ON:
                            r[3] = 0;
                            break;
                          case L.SWITCH_OFF:
                            r[3] = 1;
                            break;
                          case L.FLAT_BATTERY:
                            r[3] = 2;
                            break;
                          case L.ALERT:
                            r[3] = 3;
                            break;
                          case L.SOS_MODE:
                            r[3] = 4;
                            break;
                          case L.SOS_MODE_CLEAR:
                            r[3] = 5;
                            break;
                          case L.RESET:
                            r[3] = 6;
                            break;
                          case L.BLE_ADVERTISING:
                            r[3] = 7;
                            break;
                          case L.BLE_BONDED:
                            r[3] = 8;
                            break;
                          case L.BLE_DEBONDED:
                            r[3] = 9;
                            break;
                          case L.BLE_LINK_LOSS:
                            r[3] = 10;
                            break;
                          case L.PROX_WARNING:
                            r[3] = 11;
                            break;
                          case L.PROX_WARNING_REMINDER:
                            r[3] = 12;
                            break;
                          case L.PROX_ALARM:
                            r[3] = 13;
                            break;
                          case L.PROX_ALARM_REMINDER:
                            r[3] = 14;
                            break;
                          default:
                            throw new Error("Invalid Melody Id Value");
                        }
                        e.buzzerDuration != null && (r[4] = e.buzzerDuration);
                      }
                      return r;
                    case F.READ_CURRENT_ERROR_AND_SEND_IT:
                      return (r[2] = 4), r;
                    case F.TRIGGER_AN_ERROR:
                      return (r[2] = 241), r;
                    case F.RESET_BLE_PAIRING:
                      return (r[2] = 2), r;
                    case F.TRIGGER_HEARTBEAT_MESSAGE:
                      return (r[2] = 5), r;
                    case F.READ_TX_POWER_INDEX:
                      return (r[2] = 6), r;
                    case F.WRITE_TX_POWER_INDEX:
                      return (r[2] = 7), (r[3] = e.txPowerIndex), r;
                    case F.TRIGGER_BLE_BOOTLOADER:
                      return (r[2] = 8), r;
                    case F.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST:
                      return (r[2] = 9), r;
                    case F.CONFIGURE_STARTUP_MODES:
                      (r[2] = 10), (r[3] = 0);
                      const a = Object.assign(
                        new T.StartupModes(),
                        e.startupModes,
                      );
                      return (
                        a.manufacturing && (r[3] += 1),
                        a.shipping && (r[3] += 2),
                        r
                      );
                    case F.START_AND_STOP_BLE_ADVERTISEMENT:
                      return (
                        (r[2] = 11),
                        (r[3] = (e.bleAdvertisementDuration >> 8) & 255),
                        (r[4] = 255 & e.bleAdvertisementDuration),
                        r
                      );
                  }
                })(e);
                break;
              default:
                throw new Error("Invalid downlink message type");
            }
            return (r.bytes = a), (r.fPort = 2), r;
          },
        };
      },
      130: (e) => {
        e.exports = {
          AbeewayDownlinkPayload(
            e,
            r,
            a,
            o,
            t,
            i,
            d,
            n,
            m,
            u,
            c,
            s,
            l,
            p,
            I,
            y,
          ) {
            (this.downMessageType = e),
              (this.ackToken = r),
              (this.modeValue = a),
              (this.debugCommandType = o),
              (this.listParameterID = t),
              (this.listParameterIDNames = i),
              (this.setParameters = d),
              (this.resetAction = n),
              (this.txPowerIndex = m),
              (this.melodyId = u),
              (this.buzzerDuration = c),
              (this.proximityMessage = s),
              (this.angleDetectionControl = l),
              (this.bleAdvertisementDuration = p),
              (this.startupModes = I),
              (this.payload = y);
          },
        };
      },
      896: (e) => {
        e.exports = {
          AbeewayUplinkPayload(
            e,
            r,
            a,
            o,
            t,
            i,
            d,
            n,
            m,
            u,
            c,
            s,
            l,
            p,
            I,
            y,
            b,
            T,
            w,
            E,
            f,
            v,
            g,
            _,
            N,
            k,
            h,
            S,
            P,
            O,
            A,
            R,
            M,
            D,
            C,
            F,
            B,
            L,
            G,
            V,
            x,
            W,
            U,
            X,
            H,
            Y,
            K,
            z,
            j,
            q,
            Q,
            J,
            Z,
            $,
            ee,
            re,
            ae,
            oe,
            te,
            ie,
            de,
            ne,
          ) {
            (this.gpsLatitude = e),
              (this.gpsLongitude = r),
              (this.gpsAltitude = oe),
              (this.gpsCourseOverGround = te),
              (this.gpsSpeedOverGround = ie),
              (this.gpsFlag = de),
              (this.horizontalAccuracy = a),
              (this.gpsPrevious = ne),
              (this.messageType = o),
              (this.age = t),
              (this.trackingMode = i),
              (this.batteryVoltage = d),
              (this.batteryLevel = n),
              (this.batteryStatus = m),
              (this.ackToken = u),
              (this.firmwareVersion = c),
              (this.bleFirmwareVersion = s),
              (this.resetCause = l),
              (this.rawPositionType = p),
              (this.periodicPosition = I),
              (this.gpsOnRuntime = y),
              (this.gpsStandbyRuntime = b),
              (this.wifiScanCount = T),
              (this.timeoutCause = w),
              (this.bestSatellitesCOverN = E),
              (this.temperatureMeasure = f),
              (this.miscDataTag = v),
              (this.sosFlag = g),
              (this.appState = _),
              (this.dynamicMotionState = N),
              (this.onDemand = k),
              (this.batteryVoltageMeasures = h),
              (this.errorCode = S),
              (this.debugErrorCode = P),
              (this.genericErrorCode = O),
              (this.shutdownCause = A),
              (this.currentAckTokenValue = R),
              (this.payload = M),
              (this.debugCrashInfo = D),
              (this.activityCount = C),
              (this.deviceConfiguration = F),
              (this.wifiBssids = B),
              (this.bleBssids = L),
              (this.bleBeaconIds = G),
              (this.bleBeaconFailure = V),
              (this.eventType = x),
              (this.debugCommandTag = W),
              (this.txPowerIndex = U),
              (this.nbOfshock = X),
              (this.accelerometerShockData = H),
              (this.trackerOrientation = Y),
              (this.activityReportingWindow = K),
              (this.measuredTemperature = z),
              (this.lengthErrCounter = j),
              (this.dataScanCollection = q),
              (this.proximityNotification = Q),
              (this.proximityDailyReport = J),
              (this.proximityWhiteListing = Z),
              (this.proximityDailyResponse = $),
              (this.angleDetection = ee),
              (this.geofencingNotification = re),
              (this.specificFirmwareParameters = ae);
          },
        };
      },
      32: (e) => {
        e.exports = {
          AngleDetection(e, r, a, o, t) {
            (this.flags = e),
              (this.age = r),
              (this.referenceVector = a),
              (this.criticalVector = o),
              (this.angle = t);
          },
        };
      },
      173: (e) => {
        e.exports = {
          AngleDetectionFlags(e, r, a) {
            (this.transition = e),
              (this.triggerType = r),
              (this.notificationIdentifier = a);
          },
          Transition: {
            LEARNING_TO_NORMAL: "LEARNING_TO_NORMAL",
            NORMAL_TO_LEARNING: "NORMAL_TO_LEARNING",
            NORMAL_TO_CRITICAL: "NORMAL_TO_CRITICAL",
            CRITICAL_TO_NORMAL: "CRITICAL_TO_NORMAL",
            CRITICAL_TO_LEARNING: "CRITICAL_TO_LEARNING",
          },
          TriggerType: {
            CRITICAL_ANGLE_REPORTING: "CRITICAL_ANGLE_REPORTING",
            ANGLE_DEVIATION_REPORTING: "ANGLE_DEVIATION_REPORTING",
            SHOCK_TRIGGER: "SHOCK_TRIGGER",
            RFU: "RFU",
          },
        };
      },
      50: (e) => {
        e.exports = {
          BeaconIdInfo(e, r) {
            (this.beaconId = e), (this.rssi = r);
          },
        };
      },
      700: (e) => {
        e.exports = {
          BssidInfo(e, r) {
            (this.bssid = e), (this.rssi = r);
          },
        };
      },
      627: (e) => {
        e.exports = {
          GeofencingNotification(e, r, a) {
            (this.geofencingFormat = e),
              (this.geofencingType = r),
              (this.id = a);
          },
          GeofencingType: {
            SAFE_AREA: "SAFE_AREA",
            ENTRY: "ENTRY",
            EXIT: "EXIT",
            HAZARD: "HAZARD",
          },
        };
      },
      778: (e) => {
        e.exports = {
          MeasuredTemperature(e, r, a, o, t) {
            (this.state = e),
              (this.max = r),
              (this.min = a),
              (this.highCounter = o),
              (this.lowCounter = t);
          },
          TemperatureState: {
            NORMAL: "NORMAL",
            HIGH: "HIGH",
            LOW: "LOW",
            FEATURE_NOT_ACTIVATED: "FEATURE_NOT_ACTIVATED",
          },
        };
      },
      973: (e) => {
        e.exports = {
          ProximityDailyReport(e, r, a, o, t, i, d, n, m) {
            (this.dailyAlertDay0 = e),
              (this.dailyWarningDay0 = r),
              (this.dailyExposureDay0 = a),
              (this.dailyAlertDay1 = o),
              (this.dailyWarningDay1 = t),
              (this.dailyExposureDay1 = i),
              (this.dailyAlertDay2 = d),
              (this.dailyWarningDay2 = n),
              (this.dailyExposureDay2 = m);
          },
        };
      },
      893: (e) => {
        e.exports = {
          ProximityDailyResponse(e, r, a, o) {
            (this.dayIdentifier = e),
              (this.dailyAlert = r),
              (this.dailyWarning = a),
              (this.dailyExposure = o);
          },
        };
      },
      890: (e) => {
        e.exports = {
          ProximityMessage(e, r, a, o) {
            (this.type = e),
              (this.rollingProximityIdentifier = r),
              (this.recordStatus = a),
              (this.dayIdentifier = o);
          },
          Type: {
            GET_RECORD_STATUS: "GET_RECORD_STATUS",
            SET_WHITE_LIST_STATUS: "SET_WHITE_LIST_STATUS",
            GET_DAILY_INFORMATION: "GET_DAILY_INFORMATION",
            CLEAR_DAILY_INFORMATION: "CLEAR_DAILY_INFORMATION",
          },
          SetRecordStatus: {
            RESET_WHITE_LISTING: "RESET_WHITE_LISTING",
            SET_WHITE_LISTING: "SET_WHITE_LISTING",
          },
        };
      },
      530: (e) => {
        e.exports = {
          ProximityNotification(e, r, a, o, t, i, d, n, m, u) {
            (this.notificationType = e),
              (this.encrypted = r),
              (this.recordAction = a),
              (this.rollingProximityIdentifier = o),
              (this.closestDistanceRecording = t),
              (this.distanceAverageRecorded = i),
              (this.cumulatedExposure = d),
              (this.metadata = n),
              (this.cumulatedContactDuration = m),
              (this.currentDailyExposure = u);
          },
          NotificationType: {
            WARNING_MESSAGE: "WARNING_MESSAGE",
            ALERT_MESSAGE: "ALERT_MESSAGE",
            RECORD_MESSAGE: "RECORD_MESSAGE",
          },
          RecordAction: {
            RECORD_START: "RECORD_START",
            RECORD_UPDATE: "RECORD_UPDATE",
            RECORD_STOP: "RECORD_STOP",
          },
        };
      },
      159: (e) => {
        e.exports = {
          ProximityWhiteListing(e, r, a, o, t) {
            (this.encrypted = e),
              (this.rollingProximityIdentifier = r),
              (this.list = a),
              (this.recordStatus = o),
              (this.solicited = t);
          },
          List: {
            PEER_LIST: "PEER_LIST",
            WARNING_LIST: "WARNING_LIST",
            ALERT_LIST: "ALERT_LIST",
          },
          RecordStatus: {
            NOT_WHITE_LISTED: "NOT_WHITE_LISTED",
            WHITE_LISTED: "WHITE_LISTED",
          },
        };
      },
      781: (e) => {
        e.exports = {
          ScanCollection(e, r, a, o, t, i, d, n) {
            (this.scanType = e),
              (this.again = r),
              (this.dataFormat = a),
              (this.fragmentIdentification = o),
              (this.collectionIdentifier = t),
              (this.hash = i),
              (this.beaconIdData = d),
              (this.macAddressData = n);
          },
          ScanType: {
            BLE_BEACONS: "BLE_BEACONS",
            WIFI_BSSID: "WIFI_BSSID",
            BLE_BEACONS_COLLECTION: "BLE_BEACONS_COLLECTION",
          },
          DataFormat: { BEACON_ID: "BEACON_ID", MAC_ADDRESS: "MAC_ADDRESS" },
        };
      },
      307: (e) => {
        e.exports = {
          StartupModes(e, r) {
            (this.manufacturing = e), (this.shipping = r);
          },
        };
      },
      928: (e) => {
        e.exports = { "No decoding": "Too long" };
      },
      271: (e) => {
        e.exports = { "No decoding": "Too long" };
      },
    };
    const r = {};
    return (function a(o) {
      if (r[o]) return r[o].exports;
      const t = (r[o] = { exports: {} });
      return e[o](t, t.exports, a), t.exports;
    })(649);
  })(),
);

function convertToByteArray(payload) {
  const bytes = [];
  const length = payload.length / 2;
  for (let i = 0; i < payload.length; i += 2) {
    bytes[i / 2] = parseInt(payload.substring(i, i + 2), 16) & 0xff;
  }

  return bytes;
}

function consume(event) {
  const payload = event.data.payloadHex; // 0500647ad001020200030202
  const inputBytes = convertToByteArray(payload);
  const input = {};
  input.bytes = inputBytes;
  const result = exports.decodeUplink(input);

  console.log(result);

  /*
  emit("sample", {
    data: { batteryPercent },
    topic: "lifecycle",
  });
  emit("sample", { data, topic: "default" });
  */
}

consume({
  data: {
    port: 1,
    payloadHex: "0500647ad001020200030202",
  },
});
