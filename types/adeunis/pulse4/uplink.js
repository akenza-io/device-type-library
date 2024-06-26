/*
 Copyright (c) 2010, Linden Research, Inc.
 Copyright (c) 2014, Joshua Bell

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 $/LicenseInfo$
 */

// Original can be found at:
//   https://bitbucket.org/lindenlab/llsd
// Modifications by Joshua Bell inexorabletash@gmail.com
//   https://github.com/inexorabletash/polyfill

// ES3/ES5 implementation of the Krhonos Typed Array Specification
//   Ref: http://www.khronos.org/registry/typedarray/specs/latest/
//   Date: 2011-02-01
//
// Variations:
//  * Allows typed_array.get/set() as alias for subscripts (typed_array[])
//  * Gradually migrating structure from Khronos spec to ES2015 spec
//
// Caveats:
//  * Beyond 10000 or so entries, polyfilled array accessors (ta[0],
//    etc) become memory-prohibitive, so array creation will fail. Set
//    self.TYPED_ARRAY_POLYFILL_NO_ARRAY_ACCESSORS=true to disable
//    creation of accessors. Your code will need to use the
//    non-standard get()/set() instead, and will need to add those to
//    native arrays for interop.
const global = {};

(function () {
  // var undefined = (void 0); // Paranoia

  // Beyond this value, index getters/setters (i.e. array[0], array[1]) are so slow to
  // create, and consume so much memory, that the browser appears frozen.
  const MAX_ARRAY_LENGTH = 1e5;

  // Approximations of internal ECMAScript conversion functions
  function Type(v) {
    switch (typeof v) {
      case "undefined":
        return "undefined";
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
      default:
        return v === null ? "null" : "object";
    }
  }

  // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
  function Class(v) {
    return Object.prototype.toString.call(v).replace(/^\[object *|\]$/g, "");
  }
  function IsCallable(o) {
    return typeof o === "function";
  }
  function ToObject(v) {
    if (v === null || v === undefined) throw TypeError();
    return Object(v);
  }
  function ToInt32(v) {
    return v >> 0;
  }
  function ToUint32(v) {
    return v >>> 0;
  }

  // Snapshot intrinsics
  const { LN2 } = Math;
  const { abs } = Math;
  const { floor } = Math;
  const { log } = Math;
  const { max } = Math;
  const { min } = Math;
  const { pow } = Math;
  const { round } = Math;

  // emulate ES5 getter/setter API using legacy APIs
  // http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
  // (second clause tests for Object.defineProperty() in IE<9 that only supports extending DOM prototypes, but
  // note that IE<9 does not support __defineGetter__ or __defineSetter__ so it just renders the method harmless)

  (function () {
    const orig = Object.defineProperty;
    const dom_only = !(function () {
      try {
        return Object.defineProperty({}, "x", {});
      } catch (_) {
        return false;
      }
    })();

    if (!orig || dom_only) {
      Object.defineProperty = function (o, prop, desc) {
        // In IE8 try built-in implementation for defining properties on DOM prototypes.
        if (orig) {
          try {
            return orig(o, prop, desc);
          } catch (_) {}
        }
        if (o !== Object(o)) {
          throw TypeError("Object.defineProperty called on non-object");
        }
        if (Object.prototype.__defineGetter__ && "get" in desc) {
          Object.prototype.__defineGetter__.call(o, prop, desc.get);
        }
        if (Object.prototype.__defineSetter__ && "set" in desc) {
          Object.prototype.__defineSetter__.call(o, prop, desc.set);
        }
        if ("value" in desc) {
          o[prop] = desc.value;
        }
        return o;
      };
    }
  })();

  // ES5: Make obj[index] an alias for obj._getter(index)/obj._setter(index, value)
  // for index in 0 ... obj.length
  function makeArrayAccessors(obj) {
    if ("TYPED_ARRAY_POLYFILL_NO_ARRAY_ACCESSORS" in global) {
      return;
    }

    if (obj.length > MAX_ARRAY_LENGTH) {
      throw RangeError("Array too large for polyfill");
    }

    function makeArrayAccessor(index) {
      Object.defineProperty(obj, index, {
        get() {
          return obj._getter(index);
        },
        set(v) {
          obj._setter(index, v);
        },
        enumerable: true,
        configurable: false,
      });
    }

    let i;
    for (i = 0; i < obj.length; i += 1) {
      makeArrayAccessor(i);
    }
  }

  // Internal conversion functions:
  //    pack<Type>()   - take a number (interpreted as Type), output a byte array
  //    unpack<Type>() - take a byte array, output a Type-like number

  function as_signed(value, bits) {
    const s = 32 - bits;
    return (value << s) >> s;
  }
  function as_unsigned(value, bits) {
    const s = 32 - bits;
    return (value << s) >>> s;
  }

  function packI8(n) {
    return [n & 0xff];
  }
  function unpackI8(bytes) {
    return as_signed(bytes[0], 8);
  }

  function packU8(n) {
    return [n & 0xff];
  }
  function unpackU8(bytes) {
    return as_unsigned(bytes[0], 8);
  }

  function packU8Clamped(n) {
    n = round(Number(n));
    return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff];
  }

  function packI16(n) {
    return [n & 0xff, (n >> 8) & 0xff];
  }
  function unpackI16(bytes) {
    return as_signed((bytes[1] << 8) | bytes[0], 16);
  }

  function packU16(n) {
    return [n & 0xff, (n >> 8) & 0xff];
  }
  function unpackU16(bytes) {
    return as_unsigned((bytes[1] << 8) | bytes[0], 16);
  }

  function packI32(n) {
    return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
  }
  function unpackI32(bytes) {
    return as_signed(
      (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0],
      32,
    );
  }

  function packU32(n) {
    return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
  }
  function unpackU32(bytes) {
    return as_unsigned(
      (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0],
      32,
    );
  }

  function packIEEE754(v, ebits, fbits) {
    const bias = (1 << (ebits - 1)) - 1;

    function roundToEven(n) {
      const w = floor(n);
      const f = n - w;
      if (f < 0.5) {
        return w;
      }
      if (f > 0.5) {
        return w + 1;
      }
      return w % 2 ? w + 1 : w;
    }

    // Compute sign, exponent, fraction
    let s;
    let e;
    let f;
    if (v !== v) {
      // NaN
      // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
      e = (1 << ebits) - 1;
      f = pow(2, fbits - 1);
      s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << ebits) - 1;
      f = 0;
      s = v < 0 ? 1 : 0;
    } else if (v === 0) {
      e = 0;
      f = 0;
      s = 1 / v === -Infinity ? 1 : 0;
    } else {
      s = v < 0;
      v = abs(v);

      if (v >= pow(2, 1 - bias)) {
        // Normalized
        e = min(floor(log(v) / LN2), 1023);
        let significand = v / pow(2, e);
        if (significand < 1) {
          e -= 1;
          significand *= 2;
        }
        if (significand >= 2) {
          e += 1;
          significand /= 2;
        }
        const d = pow(2, fbits);
        f = roundToEven(significand * d) - d;
        e += bias;
        if (f / d >= 1) {
          e += 1;
          f = 0;
        }
        if (e > 2 * bias) {
          // Overflow
          e = (1 << ebits) - 1;
          f = 0;
        }
      } else {
        // Denormalized
        e = 0;
        f = roundToEven(v / pow(2, 1 - bias - fbits));
      }
    }

    // Pack sign, exponent, fraction
    const bits = [];
    let i;
    for (i = fbits; i; i -= 1) {
      bits.push(f % 2 ? 1 : 0);
      f = floor(f / 2);
    }
    for (i = ebits; i; i -= 1) {
      bits.push(e % 2 ? 1 : 0);
      e = floor(e / 2);
    }
    bits.push(s ? 1 : 0);
    bits.reverse();
    let str = bits.join("");

    // Bits to bytes
    const bytes = [];
    while (str.length) {
      bytes.unshift(parseInt(str.substring(0, 8), 2));
      str = str.substring(8);
    }
    return bytes;
  }

  function unpackIEEE754(bytes, ebits, fbits) {
    // Bytes to bits
    const bits = [];
    let i;
    let j;
    let b;
    let str;
    let bias;
    let s;
    let e;
    let f;

    for (i = 0; i < bytes.length; ++i) {
      b = bytes[i];
      for (j = 8; j; j -= 1) {
        bits.push(b % 2 ? 1 : 0);
        b >>= 1;
      }
    }
    bits.reverse();
    str = bits.join("");

    // Unpack sign, exponent, fraction
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);

    // Produce number
    if (e === (1 << ebits) - 1) {
      return f !== 0 ? NaN : s * Infinity;
    }
    if (e > 0) {
      // Normalized
      return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
    }
    if (f !== 0) {
      // Denormalized
      return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
    }
    return s < 0 ? -0 : 0;
  }

  function unpackF64(b) {
    return unpackIEEE754(b, 11, 52);
  }
  function packF64(v) {
    return packIEEE754(v, 11, 52);
  }
  function unpackF32(b) {
    return unpackIEEE754(b, 8, 23);
  }
  function packF32(v) {
    return packIEEE754(v, 8, 23);
  }

  //
  // 3 The ArrayBuffer Type
  //

  (function () {
    function ArrayBuffer(length) {
      length = ToInt32(length);
      if (length < 0) {
        throw RangeError(
          "ArrayBuffer size is not a small enough positive integer.",
        );
      }
      Object.defineProperty(this, "byteLength", { value: length });
      Object.defineProperty(this, "_bytes", { value: Array(length) });

      for (let i = 0; i < length; i += 1) {
        this._bytes[i] = 0;
      }
    }

    global.ArrayBuffer = global.ArrayBuffer || ArrayBuffer;

    //
    // 5 The Typed Array View Types
    //

    function $TypedArray$() {
      // %TypedArray% ( length )
      if (!arguments.length || typeof arguments[0] !== "object") {
        return function (length) {
          length = ToInt32(length);
          if (length < 0) {
            throw RangeError("length is not a small enough positive integer.");
          }
          Object.defineProperty(this, "length", { value: length });
          Object.defineProperty(this, "byteLength", {
            value: length * this.BYTES_PER_ELEMENT,
          });
          Object.defineProperty(this, "buffer", {
            value: new ArrayBuffer(this.byteLength),
          });
          Object.defineProperty(this, "byteOffset", { value: 0 });
        }.apply(this, arguments);
      }

      // %TypedArray% ( typedArray )
      if (
        arguments.length >= 1 &&
        Type(arguments[0]) === "object" &&
        arguments[0] instanceof $TypedArray$
      ) {
        return function (typedArray) {
          if (this.constructor !== typedArray.constructor) throw TypeError();

          const byteLength = typedArray.length * this.BYTES_PER_ELEMENT;
          Object.defineProperty(this, "buffer", {
            value: new ArrayBuffer(byteLength),
          });
          Object.defineProperty(this, "byteLength", { value: byteLength });
          Object.defineProperty(this, "byteOffset", { value: 0 });
          Object.defineProperty(this, "length", { value: typedArray.length });

          for (let i = 0; i < this.length; i += 1) {
            this._setter(i, typedArray._getter(i));
          }
        }.apply(this, arguments);
      }

      // %TypedArray% ( array )
      if (
        arguments.length >= 1 &&
        Type(arguments[0]) === "object" &&
        !(arguments[0] instanceof $TypedArray$) &&
        !(
          arguments[0] instanceof ArrayBuffer ||
          Class(arguments[0]) === "ArrayBuffer"
        )
      ) {
        return function (array) {
          const byteLength = array.length * this.BYTES_PER_ELEMENT;
          Object.defineProperty(this, "buffer", {
            value: new ArrayBuffer(byteLength),
          });
          Object.defineProperty(this, "byteLength", { value: byteLength });
          Object.defineProperty(this, "byteOffset", { value: 0 });
          Object.defineProperty(this, "length", { value: array.length });

          for (let i = 0; i < this.length; i += 1) {
            const s = array[i];
            this._setter(i, Number(s));
          }
        }.apply(this, arguments);
      }

      // %TypedArray% ( buffer, byteOffset=0, length=undefined )
      if (
        arguments.length >= 1 &&
        Type(arguments[0]) === "object" &&
        (arguments[0] instanceof ArrayBuffer ||
          Class(arguments[0]) === "ArrayBuffer")
      ) {
        return function (buffer, byteOffset, length) {
          byteOffset = ToUint32(byteOffset);
          if (byteOffset > buffer.byteLength) {
            throw RangeError("byteOffset out of range");
          }

          // The given byteOffset must be a multiple of the element
          // size of the specific type, otherwise an exception is raised.
          if (byteOffset % this.BYTES_PER_ELEMENT) {
            throw RangeError(
              "buffer length minus the byteOffset is not a multiple of the element size.",
            );
          }

          if (length === undefined) {
            var byteLength = buffer.byteLength - byteOffset;
            if (byteLength % this.BYTES_PER_ELEMENT) {
              throw RangeError(
                "length of buffer minus byteOffset not a multiple of the element size",
              );
            }
            length = byteLength / this.BYTES_PER_ELEMENT;
          } else {
            length = ToUint32(length);
            byteLength = length * this.BYTES_PER_ELEMENT;
          }

          if (byteOffset + byteLength > buffer.byteLength) {
            throw RangeError(
              "byteOffset and length reference an area beyond the end of the buffer",
            );
          }

          Object.defineProperty(this, "buffer", { value: buffer });
          Object.defineProperty(this, "byteLength", { value: byteLength });
          Object.defineProperty(this, "byteOffset", { value: byteOffset });
          Object.defineProperty(this, "length", { value: length });
        }.apply(this, arguments);
      }

      // %TypedArray% ( all other argument combinations )
      throw TypeError();
    }

    // Properties of the %TypedArray Instrinsic Object

    // %TypedArray%.from ( source , mapfn=undefined, thisArg=undefined )
    Object.defineProperty($TypedArray$, "from", {
      value(iterable) {
        return new this(iterable);
      },
    });

    // %TypedArray%.of ( ...items )
    Object.defineProperty($TypedArray$, "of", {
      value(/* ...items */) {
        return new this(arguments);
      },
    });

    // %TypedArray%.prototype
    const $TypedArrayPrototype$ = {};
    $TypedArray$.prototype = $TypedArrayPrototype$;

    // WebIDL: getter type (unsigned long index);
    Object.defineProperty($TypedArray$.prototype, "_getter", {
      value(index) {
        if (arguments.length < 1) throw SyntaxError("Not enough arguments");

        index = ToUint32(index);
        if (index >= this.length) {
          return undefined;
        }

        const bytes = [];
        let i;
        let o;
        for (
          i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
          i < this.BYTES_PER_ELEMENT;
          i += 1, o += 1
        ) {
          bytes.push(this.buffer._bytes[o]);
        }
        return this._unpack(bytes);
      },
    });

    // NONSTANDARD: convenience alias for getter: type get(unsigned long index);
    Object.defineProperty($TypedArray$.prototype, "get", {
      value: $TypedArray$.prototype._getter,
    });

    // WebIDL: setter void (unsigned long index, type value);
    Object.defineProperty($TypedArray$.prototype, "_setter", {
      value(index, value) {
        if (arguments.length < 2) throw SyntaxError("Not enough arguments");

        index = ToUint32(index);
        if (index >= this.length) {
          return;
        }

        const bytes = this._pack(value);
        let i;
        let o;
        for (
          i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
          i < this.BYTES_PER_ELEMENT;
          i += 1, o += 1
        ) {
          this.buffer._bytes[o] = bytes[i];
        }
      },
    });

    // get %TypedArray%.prototype.buffer
    // get %TypedArray%.prototype.byteLength
    // get %TypedArray%.prototype.byteOffset
    // -- applied directly to the object in the constructor

    // %TypedArray%.prototype.constructor
    Object.defineProperty($TypedArray$.prototype, "constructor", {
      value: $TypedArray$,
    });

    // %TypedArray%.prototype.copyWithin (target, start, end = this.length )
    Object.defineProperty($TypedArray$.prototype, "copyWithin", {
      value(target, start) {
        const end = arguments[2];

        const o = ToObject(this);
        const lenVal = o.length;
        let len = ToUint32(lenVal);
        len = max(len, 0);
        const relativeTarget = ToInt32(target);
        let to;
        if (relativeTarget < 0) {
          to = max(len + relativeTarget, 0);
        } else {
          to = min(relativeTarget, len);
        }
        const relativeStart = ToInt32(start);
        let from;
        if (relativeStart < 0) {
          from = max(len + relativeStart, 0);
        } else {
          from = min(relativeStart, len);
        }
        let relativeEnd;
        if (end === undefined) {
          relativeEnd = len;
        } else {
          relativeEnd = ToInt32(end);
        }
        let final;
        if (relativeEnd < 0) {
          final = max(len + relativeEnd, 0);
        } else {
          final = min(relativeEnd, len);
        }
        let count = min(final - from, len - to);
        let direction;
        if (from < to && to < from + count) {
          direction = -1;
          from = from + count - 1;
          to = to + count - 1;
        } else {
          direction = 1;
        }
        while (count > 0) {
          o._setter(to, o._getter(from));
          from += direction;
          to += direction;
          count -= 1;
        }
        return o;
      },
    });

    // %TypedArray%.prototype.entries ( )
    // -- defined in es6.js to shim browsers w/ native TypedArrays

    // %TypedArray%.prototype.every ( callbackfn, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "every", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        const thisArg = arguments[1];
        for (let i = 0; i < len; i++) {
          if (!callbackfn.call(thisArg, t._getter(i), i, t)) {
            return false;
          }
        }
        return true;
      },
    });

    // %TypedArray%.prototype.fill (value, start = 0, end = this.length )
    Object.defineProperty($TypedArray$.prototype, "fill", {
      value(value) {
        const start = arguments[1];
        const end = arguments[2];

        const o = ToObject(this);
        const lenVal = o.length;
        let len = ToUint32(lenVal);
        len = max(len, 0);
        const relativeStart = ToInt32(start);
        let k;
        if (relativeStart < 0) {
          k = max(len + relativeStart, 0);
        } else {
          k = min(relativeStart, len);
        }
        let relativeEnd;
        if (end === undefined) {
          relativeEnd = len;
        } else {
          relativeEnd = ToInt32(end);
        }
        let final;
        if (relativeEnd < 0) {
          final = max(len + relativeEnd, 0);
        } else {
          final = min(relativeEnd, len);
        }
        while (k < final) {
          o._setter(k, value);
          k += 1;
        }
        return o;
      },
    });

    // %TypedArray%.prototype.filter ( callbackfn, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "filter", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        const res = [];
        const thisp = arguments[1];
        for (let i = 0; i < len; i++) {
          const val = t._getter(i); // in case fun mutates this
          if (callbackfn.call(thisp, val, i, t)) {
            res.push(val);
          }
        }
        return new this.constructor(res);
      },
    });

    // %TypedArray%.prototype.find (predicate, thisArg = undefined)
    Object.defineProperty($TypedArray$.prototype, "find", {
      value(predicate) {
        const o = ToObject(this);
        const lenValue = o.length;
        const len = ToUint32(lenValue);
        if (!IsCallable(predicate)) throw TypeError();
        const t = arguments.length > 1 ? arguments[1] : undefined;
        let k = 0;
        while (k < len) {
          const kValue = o._getter(k);
          const testResult = predicate.call(t, kValue, k, o);
          if (testResult) {
            return kValue;
          }
          ++k;
        }
        return undefined;
      },
    });

    // %TypedArray%.prototype.findIndex ( predicate, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "findIndex", {
      value(predicate) {
        const o = ToObject(this);
        const lenValue = o.length;
        const len = ToUint32(lenValue);
        if (!IsCallable(predicate)) throw TypeError();
        const t = arguments.length > 1 ? arguments[1] : undefined;
        let k = 0;
        while (k < len) {
          const kValue = o._getter(k);
          const testResult = predicate.call(t, kValue, k, o);
          if (testResult) {
            return k;
          }
          ++k;
        }
        return -1;
      },
    });

    // %TypedArray%.prototype.forEach ( callbackfn, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "forEach", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        const thisp = arguments[1];
        for (let i = 0; i < len; i++) {
          callbackfn.call(thisp, t._getter(i), i, t);
        }
      },
    });

    // %TypedArray%.prototype.indexOf (searchElement, fromIndex = 0 )
    Object.defineProperty($TypedArray$.prototype, "indexOf", {
      value(searchElement) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (len === 0) return -1;
        let n = 0;
        if (arguments.length > 0) {
          n = Number(arguments[1]);
          if (n !== n) {
            n = 0;
          } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
            n = (n > 0 || -1) * floor(abs(n));
          }
        }
        if (n >= len) return -1;
        let k = n >= 0 ? n : max(len - abs(n), 0);
        for (; k < len; k++) {
          if (t._getter(k) === searchElement) {
            return k;
          }
        }
        return -1;
      },
    });

    // %TypedArray%.prototype.join ( separator )
    Object.defineProperty($TypedArray$.prototype, "join", {
      value(separator) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        const tmp = Array(len);
        for (let i = 0; i < len; ++i) {
          tmp[i] = t._getter(i);
        }
        return tmp.join(separator === undefined ? "," : separator); // Hack for IE7
      },
    });

    // %TypedArray%.prototype.keys ( )
    // -- defined in es6.js to shim browsers w/ native TypedArrays

    // %TypedArray%.prototype.lastIndexOf ( searchElement, fromIndex = this.length-1 )
    Object.defineProperty($TypedArray$.prototype, "lastIndexOf", {
      value(searchElement) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (len === 0) return -1;
        let n = len;
        if (arguments.length > 1) {
          n = Number(arguments[1]);
          if (n !== n) {
            n = 0;
          } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
            n = (n > 0 || -1) * floor(abs(n));
          }
        }
        let k = n >= 0 ? min(n, len - 1) : len - abs(n);
        for (; k >= 0; k--) {
          if (t._getter(k) === searchElement) {
            return k;
          }
        }
        return -1;
      },
    });

    // get %TypedArray%.prototype.length
    // -- applied directly to the object in the constructor

    // %TypedArray%.prototype.map ( callbackfn, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "map", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        const res = [];
        res.length = len;
        const thisp = arguments[1];
        for (let i = 0; i < len; i++) {
          res[i] = callbackfn.call(thisp, t._getter(i), i, t);
        }
        return new this.constructor(res);
      },
    });

    // %TypedArray%.prototype.reduce ( callbackfn [, initialValue] )
    Object.defineProperty($TypedArray$.prototype, "reduce", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1) throw TypeError();
        let k = 0;
        let accumulator;
        if (arguments.length >= 2) {
          accumulator = arguments[1];
        } else {
          accumulator = t._getter(k++);
        }
        while (k < len) {
          accumulator = callbackfn.call(
            undefined,
            accumulator,
            t._getter(k),
            k,
            t,
          );
          k++;
        }
        return accumulator;
      },
    });

    // %TypedArray%.prototype.reduceRight ( callbackfn [, initialValue] )
    Object.defineProperty($TypedArray$.prototype, "reduceRight", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        // no value to return if no initial value, empty array
        if (len === 0 && arguments.length === 1) throw TypeError();
        let k = len - 1;
        let accumulator;
        if (arguments.length >= 2) {
          accumulator = arguments[1];
        } else {
          accumulator = t._getter(k--);
        }
        while (k >= 0) {
          accumulator = callbackfn.call(
            undefined,
            accumulator,
            t._getter(k),
            k,
            t,
          );
          k--;
        }
        return accumulator;
      },
    });

    // %TypedArray%.prototype.reverse ( )
    Object.defineProperty($TypedArray$.prototype, "reverse", {
      value() {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        const half = floor(len / 2);
        for (let i = 0, j = len - 1; i < half; ++i, --j) {
          const tmp = t._getter(i);
          t._setter(i, t._getter(j));
          t._setter(j, tmp);
        }
        return t;
      },
    });

    // %TypedArray%.prototype.set(array, offset = 0 )
    // %TypedArray%.prototype.set(typedArray, offset = 0 )
    // WebIDL: void set(TypedArray array, optional unsigned long offset);
    // WebIDL: void set(sequence<type> array, optional unsigned long offset);
    Object.defineProperty($TypedArray$.prototype, "set", {
      value(index, value) {
        if (arguments.length < 1) throw SyntaxError("Not enough arguments");
        let array;
        let sequence;
        let offset;
        let len;
        let i;
        let s;
        let d;
        let byteOffset;
        let byteLength;
        let tmp;

        if (
          typeof arguments[0] === "object" &&
          arguments[0].constructor === this.constructor
        ) {
          // void set(TypedArray array, optional unsigned long offset);
          array = arguments[0];
          offset = ToUint32(arguments[1]);

          if (offset + array.length > this.length) {
            throw RangeError("Offset plus length of array is out of range");
          }

          byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
          byteLength = array.length * this.BYTES_PER_ELEMENT;

          if (array.buffer === this.buffer) {
            tmp = [];
            for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
              tmp[i] = array.buffer._bytes[s];
            }
            for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
              this.buffer._bytes[d] = tmp[i];
            }
          } else {
            for (
              i = 0, s = array.byteOffset, d = byteOffset;
              i < byteLength;
              i += 1, s += 1, d += 1
            ) {
              this.buffer._bytes[d] = array.buffer._bytes[s];
            }
          }
        } else if (
          typeof arguments[0] === "object" &&
          typeof arguments[0].length !== "undefined"
        ) {
          // void set(sequence<type> array, optional unsigned long offset);
          sequence = arguments[0];
          len = ToUint32(sequence.length);
          offset = ToUint32(arguments[1]);

          if (offset + len > this.length) {
            throw RangeError("Offset plus length of array is out of range");
          }

          for (i = 0; i < len; i += 1) {
            s = sequence[i];
            this._setter(offset + i, Number(s));
          }
        } else {
          throw TypeError("Unexpected argument type(s)");
        }
      },
    });

    // %TypedArray%.prototype.slice ( start, end )
    Object.defineProperty($TypedArray$.prototype, "slice", {
      value(start, end) {
        const o = ToObject(this);
        const lenVal = o.length;
        const len = ToUint32(lenVal);
        const relativeStart = ToInt32(start);
        let k =
          relativeStart < 0
            ? max(len + relativeStart, 0)
            : min(relativeStart, len);
        const relativeEnd = end === undefined ? len : ToInt32(end);
        const final =
          relativeEnd < 0 ? max(len + relativeEnd, 0) : min(relativeEnd, len);
        const count = final - k;
        const c = o.constructor;
        const a = new c(count);
        let n = 0;
        while (k < final) {
          const kValue = o._getter(k);
          a._setter(n, kValue);
          ++k;
          ++n;
        }
        return a;
      },
    });

    // %TypedArray%.prototype.some ( callbackfn, thisArg = undefined )
    Object.defineProperty($TypedArray$.prototype, "some", {
      value(callbackfn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        if (!IsCallable(callbackfn)) throw TypeError();
        const thisp = arguments[1];
        for (let i = 0; i < len; i++) {
          if (callbackfn.call(thisp, t._getter(i), i, t)) {
            return true;
          }
        }
        return false;
      },
    });

    // %TypedArray%.prototype.sort ( comparefn )
    Object.defineProperty($TypedArray$.prototype, "sort", {
      value(comparefn) {
        if (this === undefined || this === null) throw TypeError();
        const t = Object(this);
        const len = ToUint32(t.length);
        const tmp = Array(len);
        for (var i = 0; i < len; ++i) {
          tmp[i] = t._getter(i);
        }
        function sortCompare(x, y) {
          if (x !== x && y !== y) return +0;
          if (x !== x) return 1;
          if (y !== y) return -1;
          if (comparefn !== undefined) {
            return comparefn(x, y);
          }
          if (x < y) return -1;
          if (x > y) return 1;
          return +0;
        }
        tmp.sort(sortCompare);
        for (i = 0; i < len; ++i) {
          t._setter(i, tmp[i]);
        }
        return t;
      },
    });

    // %TypedArray%.prototype.subarray(begin = 0, end = this.length )
    // WebIDL: TypedArray subarray(long begin, optional long end);
    Object.defineProperty($TypedArray$.prototype, "subarray", {
      value(start, end) {
        function clamp(v, min, max) {
          return v < min ? min : v > max ? max : v;
        }

        start = ToInt32(start);
        end = ToInt32(end);

        if (arguments.length < 1) {
          start = 0;
        }
        if (arguments.length < 2) {
          end = this.length;
        }

        if (start < 0) {
          start = this.length + start;
        }
        if (end < 0) {
          end = this.length + end;
        }

        start = clamp(start, 0, this.length);
        end = clamp(end, 0, this.length);

        let len = end - start;
        if (len < 0) {
          len = 0;
        }

        return new this.constructor(
          this.buffer,
          this.byteOffset + start * this.BYTES_PER_ELEMENT,
          len,
        );
      },
    });

    // %TypedArray%.prototype.toLocaleString ( )
    // %TypedArray%.prototype.toString ( )
    // %TypedArray%.prototype.values ( )
    // %TypedArray%.prototype [ @@iterator ] ( )
    // get %TypedArray%.prototype [ @@toStringTag ]
    // -- defined in es6.js to shim browsers w/ native TypedArrays

    function makeTypedArray(elementSize, pack, unpack) {
      // Each TypedArray type requires a distinct constructor instance with
      // identical logic, which this produces.
      var TypedArray = function () {
        Object.defineProperty(this, "constructor", { value: TypedArray });
        $TypedArray$.apply(this, arguments);
        makeArrayAccessors(this);
      };
      if ("__proto__" in TypedArray) {
        TypedArray.__proto__ = $TypedArray$;
      } else {
        TypedArray.from = $TypedArray$.from;
        TypedArray.of = $TypedArray$.of;
      }

      TypedArray.BYTES_PER_ELEMENT = elementSize;

      const TypedArrayPrototype = function () {};
      TypedArrayPrototype.prototype = $TypedArrayPrototype$;

      TypedArray.prototype = new TypedArrayPrototype();

      Object.defineProperty(TypedArray.prototype, "BYTES_PER_ELEMENT", {
        value: elementSize,
      });
      Object.defineProperty(TypedArray.prototype, "_pack", { value: pack });
      Object.defineProperty(TypedArray.prototype, "_unpack", { value: unpack });

      return TypedArray;
    }

    const Int8Array = makeTypedArray(1, packI8, unpackI8);
    const Uint8Array = makeTypedArray(1, packU8, unpackU8);
    const Uint8ClampedArray = makeTypedArray(1, packU8Clamped, unpackU8);
    const Int16Array = makeTypedArray(2, packI16, unpackI16);
    const Uint16Array = makeTypedArray(2, packU16, unpackU16);
    const Int32Array = makeTypedArray(4, packI32, unpackI32);
    const Uint32Array = makeTypedArray(4, packU32, unpackU32);
    const Float32Array = makeTypedArray(4, packF32, unpackF32);
    const Float64Array = makeTypedArray(8, packF64, unpackF64);

    global.Int8Array = global.Int8Array || Int8Array;
    global.Uint8Array = global.Uint8Array || Uint8Array;
    global.Uint8ClampedArray = global.Uint8ClampedArray || Uint8ClampedArray;
    global.Int16Array = global.Int16Array || Int16Array;
    global.Uint16Array = global.Uint16Array || Uint16Array;
    global.Int32Array = global.Int32Array || Int32Array;
    global.Uint32Array = global.Uint32Array || Uint32Array;
    global.Float32Array = global.Float32Array || Float32Array;
    global.Float64Array = global.Float64Array || Float64Array;
  })();

  //
  // 6 The DataView View Type
  //

  (function () {
    function r(array, index) {
      return IsCallable(array.get) ? array.get(index) : array[index];
    }

    const IS_BIG_ENDIAN = (function () {
      const u16array = new Uint16Array([0x1234]);
      const u8array = new Uint8Array(u16array.buffer);
      return r(u8array, 0) === 0x12;
    })();

    // DataView(buffer, byteOffset=0, byteLength=undefined)
    // WebIDL: Constructor(ArrayBuffer buffer,
    //                     optional unsigned long byteOffset,
    //                     optional unsigned long byteLength)
    function DataView(buffer, byteOffset, byteLength) {
      if (!(buffer instanceof ArrayBuffer || Class(buffer) === "ArrayBuffer")) {
        throw TypeError();
      }

      byteOffset = ToUint32(byteOffset);
      if (byteOffset > buffer.byteLength) {
        throw RangeError("byteOffset out of range");
      }

      if (byteLength === undefined) {
        byteLength = buffer.byteLength - byteOffset;
      } else {
        byteLength = ToUint32(byteLength);
      }

      if (byteOffset + byteLength > buffer.byteLength) {
        throw RangeError(
          "byteOffset and length reference an area beyond the end of the buffer",
        );
      }

      Object.defineProperty(this, "buffer", { value: buffer });
      Object.defineProperty(this, "byteLength", { value: byteLength });
      Object.defineProperty(this, "byteOffset", { value: byteOffset });
    }

    // get DataView.prototype.buffer
    // get DataView.prototype.byteLength
    // get DataView.prototype.byteOffset
    // -- applied directly to instances by the constructor

    function makeGetter(arrayType) {
      return function GetViewValue(byteOffset, littleEndian) {
        byteOffset = ToUint32(byteOffset);

        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
          throw RangeError("Array index out of range");
        }

        byteOffset += this.byteOffset;

        const uint8Array = new Uint8Array(
          this.buffer,
          byteOffset,
          arrayType.BYTES_PER_ELEMENT,
        );
        const bytes = [];
        for (let i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
          bytes.push(r(uint8Array, i));
        }

        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
          bytes.reverse();
        }

        return r(new arrayType(new Uint8Array(bytes).buffer), 0);
      };
    }

    Object.defineProperty(DataView.prototype, "getUint8", {
      value: makeGetter(Uint8Array),
    });
    Object.defineProperty(DataView.prototype, "getInt8", {
      value: makeGetter(Int8Array),
    });
    Object.defineProperty(DataView.prototype, "getUint16", {
      value: makeGetter(Uint16Array),
    });
    Object.defineProperty(DataView.prototype, "getInt16", {
      value: makeGetter(Int16Array),
    });
    Object.defineProperty(DataView.prototype, "getUint32", {
      value: makeGetter(Uint32Array),
    });
    Object.defineProperty(DataView.prototype, "getInt32", {
      value: makeGetter(Int32Array),
    });
    Object.defineProperty(DataView.prototype, "getFloat32", {
      value: makeGetter(Float32Array),
    });
    Object.defineProperty(DataView.prototype, "getFloat64", {
      value: makeGetter(Float64Array),
    });

    function makeSetter(arrayType) {
      return function SetViewValue(byteOffset, value, littleEndian) {
        byteOffset = ToUint32(byteOffset);
        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
          throw RangeError("Array index out of range");
        }

        // Get bytes
        const typeArray = new arrayType([value]);
        const byteArray = new Uint8Array(typeArray.buffer);
        const bytes = [];
        let i;
        let byteView;

        for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
          bytes.push(r(byteArray, i));
        }

        // Flip if necessary
        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
          bytes.reverse();
        }

        // Write them
        byteView = new Uint8Array(
          this.buffer,
          byteOffset,
          arrayType.BYTES_PER_ELEMENT,
        );
        byteView.set(bytes);
      };
    }

    Object.defineProperty(DataView.prototype, "setUint8", {
      value: makeSetter(Uint8Array),
    });
    Object.defineProperty(DataView.prototype, "setInt8", {
      value: makeSetter(Int8Array),
    });
    Object.defineProperty(DataView.prototype, "setUint16", {
      value: makeSetter(Uint16Array),
    });
    Object.defineProperty(DataView.prototype, "setInt16", {
      value: makeSetter(Int16Array),
    });
    Object.defineProperty(DataView.prototype, "setUint32", {
      value: makeSetter(Uint32Array),
    });
    Object.defineProperty(DataView.prototype, "setInt32", {
      value: makeSetter(Int32Array),
    });
    Object.defineProperty(DataView.prototype, "setFloat32", {
      value: makeSetter(Float32Array),
    });
    Object.defineProperty(DataView.prototype, "setFloat64", {
      value: makeSetter(Float64Array),
    });

    global.DataView = global.DataView || DataView;
  })();
})(this);

if (typeof Object.assign !== "function") {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      const to = Object(target);
      for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];
        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}

/* Code from package\dist\buffer-custom-shim.js */
/**
 * Buffer override for browsers compatibility
 */
function Buffer(string, encoding) {
  return fromHexString(string);
}
/**
 * Buffer::from override for browsers compatibility
 */
Buffer.from = function (string, encoding) {
  return fromHexString(string);
};
/**
 * Buffer::alloc override for browsers compatibility
 */
Buffer.alloc = function (length) {
  return new Uint8Array(length);
};
/**
 * Uint8Array::readUInt16BE override for browsers compatibility
 */
Uint8Array.prototype.readUInt16BE = function (offset) {
  const dataView = new DataView(this.buffer);
  return dataView.getUint16(offset);
};
/**
 * Uint8Array::readInt16BE override for browsers compatibility
 */
Uint8Array.prototype.readInt16BE = function (offset) {
  const dataView = new DataView(this.buffer);
  return dataView.getInt16(offset);
};
/**
 * Uint8Array::readUInt8 override for browsers compatibility
 */
Uint8Array.prototype.readUInt8 = function (offset) {
  const dataView = new DataView(this.buffer);
  return dataView.getUint8(offset);
};
/**
 * Uint8Array::readUInt32BE override for browsers compatibility
 */
Uint8Array.prototype.readUInt32BE = function (offset) {
  const dataView = new DataView(this.buffer);
  return dataView.getUint32(offset);
};
/**
 * Uint8Array::writeUInt16BE override for browsers compatibility
 */
Uint8Array.prototype.writeUInt16BE = function (value, offset) {
  const dataView = new DataView(this.buffer);
  return dataView.setUint16(offset, value);
};
/**
 * Uint8Array::writeUInt8 override for browsers compatibility
 */
Uint8Array.prototype.writeUInt8 = function (value, offset) {
  const dataView = new DataView(this.buffer);
  return dataView.setUint8(offset, value);
};
/**
 * Uint8Array::writeUInt32BE override for browsers compatibility
 */
Uint8Array.prototype.writeUInt32BE = function (value, offset) {
  const dataView = new DataView(this.buffer);
  return dataView.setUint32(offset, value);
};
/**
 * From hex string
 * @param {string} hexString
 */
function fromHexString(hexString) {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) {
    return new Uint8Array();
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

// >>> lib codec START

/**
 *              _                  _
 *     /\      | |                (_)
 *    /  \   __| | ___ _   _ _ __  _ ___
 *   / /\ \ / _` |/ _ \ | | | '_ \| / __|
 *  / ____ \ (_| |  __/ |_| | | | | \__ \
 * /_/    \_\__,_|\___|\__,_|_| |_|_|___/
 *
 *
 * JavaScript/Node.js library of Adeunis codecs v1.6.1
 * Supported products: ANALOG, BREATH, COMFORT, COMFORT 2, COMFORT CO2, DELTA P, DRY CONTACTS, DRY CONTACTS 2, MOTION,
 *   PULSE, PULSE 3, PULSE 4, PULSE 4 NB-IoT, REPEATER, TEMP, TEMP 3, TEMP 4, TIC CBE LINKY, TIC PME-PMI
 *
 * This source code is provided "as-is" and with no warranties. Adeunis is not responsible for its use.
 *
 */

("use strict");
const __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2) {
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
var codec;
(function (codec) {
  /**
   * Decoder class.
   *
   * Main class for decoding purposes.
   * Contains declaration of all required parsers and decode() method (API entry point).
   *
   * See below for explanations on parsers.
   */
  const Decoder = /** @class */ (function () {
    /**
     * Constructor
     * @param options option object
     *   option.codecStorage: implementation of CodecStorage to use for external storage, leave blank if unknown
     */
    function Decoder(options) {
      /**
       * Parsers declaration.
       *
       * Array of parser implementations that can be used by the library.
       *
       * Parsers are specific handlers for parsing frame of a device type and a frame code.
       */
      this.parsers = [
        // 1. Generic parsers not used for REPEATER
        // 2. GenericStatusByteParser() must be allocated only by custom parser.
        // => Default status byte parser must be GenericStatusByteExtParser()
        // new GenericStatusByteParser(),
        new codec.GenericStatusByteExtParser(),
        new codec.Generic0x1fParser(),
        new codec.Generic0x20Parser(),
        new codec.Generic0x2fParser(),
        new codec.Generic0x30Parser(),
        new codec.Generic0x33Parser(),
        new codec.Generic0x36Parser(),
        new codec.Generic0x37Parser(),
        new codec.Generic0x51Parser(),
        new codec.Generic0x52Parser(),
        // DRYCONTACTS product
        new codec.DrycontactsStatusByteParser(),
        new codec.Drycontacts0x10Parser(),
        new codec.Drycontacts0x40Parser(),
        // DRYCONTACTS 2 product
        new codec.Drycontacts2StatusByteParser(),
        new codec.Drycontacts20x10Parser(),
        new codec.Drycontacts20x30Parser(),
        new codec.Drycontacts20x40Parser(),
        new codec.Drycontacts20x41Parser(),
        new codec.Drycontacts20x59Parser(),
        // PULSE product
        new codec.PulseStatusByteParser(),
        new codec.Pulse0x10Parser(),
        new codec.Pulse0x11Parser(),
        new codec.Pulse0x12Parser(),
        new codec.Pulse0x30Parser(),
        new codec.Pulse0x46Parser(),
        new codec.Pulse0x47Parser(),
        new codec.Pulse0x48Parser(),
        // Pulse 3 product
        new codec.PulseV30x10Parser(),
        new codec.PulseV30x11Parser(),
        new codec.PulseV30x12Parser(),
        new codec.PulseV30x30Parser(),
        new codec.PulseV30x46Parser(),
        new codec.PulseV30x47Parser(),
        new codec.PulseV30x5aParser(),
        new codec.PulseV30x5bParser(),
        // Pulse 4 product
        new codec.PulseV4StatusByteParser(),
        new codec.PulseV40x10Parser(),
        new codec.PulseV40x11Parser(),
        new codec.PulseV40x12Parser(),
        new codec.PulseV40x30Parser(),
        new codec.PulseV40x46Parser(),
        new codec.PulseV40x47Parser(),
        new codec.PulseV40x5aParser(),
        new codec.PulseV40x5bParser(),
        // Pulse 4 NB-IoT product
        new codec.PulseV4NbIotStatusByteParser(),
        new codec.PulseV4NbIot0x10Parser(),
        new codec.PulseV4NbIot0x20Parser(),
        new codec.PulseV4NbIot0x30Parser(),
        new codec.PulseV4NbIot0x33Parser(),
        new codec.PulseV4NbIot0x46Parser(),
        new codec.PulseV4NbIot0x47Parser(),
        new codec.PulseV4NbIot0x5aParser(),
        new codec.PulseV4NbIot0x5bParser(),
        // TEMP product
        new codec.TempStatusByteParser(),
        new codec.Temp0x10Parser(),
        new codec.Temp0x11Parser(),
        new codec.Temp0x12Parser(),
        new codec.Temp0x30Parser(),
        new codec.Temp0x43Parser(),
        // Temp 3 product
        new codec.TempV3StatusByteParser(),
        new codec.TempV30x10Parser(),
        new codec.TempV30x30Parser(),
        new codec.TempV30x57Parser(),
        new codec.TempV30x58Parser(),
        // temp 4 product
        new codec.TempV4StatusByteParser(),
        new codec.TempV40x10Parser(),
        new codec.TempV40x30Parser(),
        new codec.TempV40x57Parser(),
        new codec.TempV40x58Parser(),
        // COMFORT product
        new codec.Comfort0x10Parser(),
        new codec.Comfort0x4cParser(),
        new codec.Comfort0x4dParser(),
        // COMFORT 2 product
        new codec.Comfort2StatusByteParser(),
        new codec.Comfort20x10Parser(),
        new codec.Comfort20x4cParser(),
        new codec.Comfort20x4dParser(),
        // COMFORT Co2 product
        new codec.ComfortCo2StatusByteParser(),
        new codec.ComfortCo20x10Parser(),
        new codec.ComfortCo20x6aParser(),
        new codec.ComfortCo20x6bParser(),
        new codec.ComfortCo20x30Parser(),
        // MOTION product
        new codec.Motion0x10Parser(),
        new codec.Motion0x4eParser(),
        new codec.Motion0x4fParser(),
        new codec.Motion0x50Parser(),
        new codec.Motion0x5cParser(),
        new codec.Motion0x5dParser(),
        // REPEATER product
        new codec.RepeaterStatusByteParser(),
        new codec.Repeater0x01Parser(),
        new codec.Repeater0x02Parser(),
        new codec.Repeater0x03Parser(),
        new codec.Repeater0x04Parser(),
        // DELTAP product
        new codec.Deltap0x10Parser(),
        new codec.Deltap0x11Parser(),
        new codec.Deltap0x2fParser(),
        new codec.Deltap0x53Parser(),
        new codec.Deltap0x54Parser(),
        new codec.Deltap0x55Parser(),
        new codec.Deltap0x56Parser(),
        // Analog product
        new codec.AnalogStatusByteParser(),
        new codec.Analog0x10Parser(),
        new codec.Analog0x11Parser(),
        new codec.Analog0x12Parser(),
        new codec.Analog0x13Parser(),
        new codec.Analog0x14Parser(),
        new codec.Analog0x30Parser(),
        new codec.Analog0x42Parser(),
        // TIC product
        new codec.TicStatusByteParser(),
        new codec.Tic0x10Parser(),
        new codec.Tic0x49Parser(),
        new codec.Tic0x4aParser(),
        // Breath product
        new codec.BreathStatusByteParser(),
        new codec.Breath0x6dParser(),
        new codec.Breath0x6eParser(),
        new codec.Breath0x10Parser(),
        new codec.Breath0x30Parser(),
      ];
      if (options && options.codecStorage) {
        // External storage: Node-RED...
        this.codecStorage = options.codecStorage;
      } else if (typeof localStorage !== "undefined") {
        // Local storage: browser
        this.codecStorage = localStorage;
      } else {
        // Default (JS object)
        this.codecStorage = new codec.InternalCodecStorage();
      }
      // TODO: check parsers uniqueness
    }
    /**
     * Get supported device types and frame codes.
     *
     * The returned pairs are available for decoding.
     */
    Decoder.prototype.getSupported = function () {
      const list = [];
      this.parsers.map((p) =>
        p.deviceType.split("|").map((q) =>
          list.push({
            deviceType: q,
            frameCode: p.frameCode,
          }),
        ),
      );
      return list;
    };
    /**
     * Find device types
     * @param payloadString payload as hexadecimal string
     */
    Decoder.prototype.findDeviceTypes = function (payloadString) {
      // Check arguments
      if (!/^(?:[0-9a-f]{2}){2,}$/gi.test(payloadString)) {
        return [];
      }
      // Get buffer and frame code
      const payload = Buffer.from(payloadString, "hex");
      const frameCode = payload[0];
      const deviceTypesFull = this.parsers
        .filter((p) => p.frameCode === frameCode)
        .map((p) => p.deviceType);
      return Array.from(new Set(deviceTypesFull));
    };
    /**
     * Decode given payload.
     * @param payloadString payload as hexadecimal string
     * @param devId device ID: LoRa device EUI or Sigfox ID, leave blank if unknown
     * @param network network: lora868 or sigfox
     * @returns decoded data as JSON object
     */
    Decoder.prototype.decode = function (payloadString, devId, network) {
      if (devId === void 0) {
        devId = "tmpDevId";
      }
      if (network === void 0) {
        network = "unknown";
      }
      // Check arguments
      if (!/^(?:[0-9a-f]{2}){2,}$/gi.test(payloadString)) {
        return { type: "Invalid" };
      }
      // Get buffer and frame code
      const payload = Buffer.from(payloadString, "hex");
      let frameCode = payload[0];
      // Handle device type
      const deviceType = this.fetchDeviceType(devId);
      // Specific hook for NB-IoT products that have an additional header (13 bytes) before classic frame content
      if (deviceType === "pulse4nbiot") {
        frameCode = payload[13 + 0];
      }
      // Handle configuration
      let configuration;
      if (frameCode === 0x10) {
        configuration = payload;
        this.storeConfiguration(configuration, devId);
      } else {
        configuration = this.fetchConfiguration(devId);
      }
      // Handle specific parsing
      const activeParsers = this.getActiveParsers(deviceType, frameCode);
      const partialContents = activeParsers.map((p) => {
        let partialContent;
        try {
          partialContent = p.parseFrame(
            payload,
            configuration,
            network,
            deviceType,
          );
        } catch (error) {
          partialContent = { error: error.toString() };
        }
        return partialContent;
      });
      // Handle unsupported
      if (activeParsers.every((p) => p.frameCode < 0)) {
        partialContents.push({ type: "Unsupported" });
      }
      // Merge partial contents
      let content = Object.assign.apply(
        Object,
        __spreadArray([{}], partialContents, false),
      );
      // Put 'type' at first position
      const typestr = content.type;
      delete content.type;
      content = { type: typestr, ...content };
      return content;
    };
    /**
     * Set device type for given device ID.
     *
     * Gives additional information to the library to provide better decoding.
     * The library can also guess device type from passed frames in decode() method. Use this method when the frame
     * to decode does not refer to a single device type (example: 0x10 frames).
     *
     * @param deviceType device type, must be a value from getSupported() method
     * @param devId device ID: LoRa device EUI or Sigfox ID
     */
    Decoder.prototype.setDeviceType = function (deviceType, devId) {
      if (devId === void 0) {
        devId = "tmpDevId";
      }
      this.codecStorage.setItem(`${devId}.deviceType`, deviceType);
    };
    /**
     * Clear stored data for a device ID:
     *   - Device type
     *   - Configuration
     * @param devId device ID: LoRa device EUI or Sigfox ID, leave blank if unknown
     */
    Decoder.prototype.clearStoredData = function (devId) {
      const _this = this;
      if (!devId) {
        devId = "tmpDevId";
      }
      ["deviceType", "configuration"]
        .map((suffix) => `${devId}.${suffix}`)
        .forEach((key) => _this.codecStorage.removeItem(key));
    };
    /**
     * Fetch configuration frame
     * @param devId device ID
     */
    Decoder.prototype.fetchConfiguration = function (devId) {
      if (!devId) {
        return Buffer.from("");
      }
      const value = this.codecStorage.getItem(`${devId}.configuration`);
      return Buffer.from(value || "", "hex");
    };
    /**
     * Store configuration frame
     * @param payload payload
     * @param devId device ID
     */
    Decoder.prototype.storeConfiguration = function (payload, devId) {
      if (!devId) {
        return payload;
      }
      this.codecStorage.setItem(
        `${devId}.configuration`,
        payload.toString("hex"),
      );
      return payload;
    };
    /**
     * Fetch device type
     * @param devId device ID
     */
    Decoder.prototype.fetchDeviceType = function (devId) {
      if (!devId) {
        return "";
      }
      return this.codecStorage.getItem(`${devId}.deviceType`) || "";
    };
    /**
     * Store device type
     * @param frameCode frame code
     * @param devId device ID
     */
    Decoder.prototype.storeDeviceType = function (frameCode, devId) {
      let deviceType = "";
      if (!devId) {
        return deviceType;
      }
      const matchingParsers = this.parsers.filter(
        (p) => p.deviceType !== "any" && p.frameCode === frameCode,
      );
      if (matchingParsers.length === 1) {
        deviceType = matchingParsers[0].deviceType;
        this.codecStorage.setItem(`${devId}.deviceType`, deviceType);
      }
      return deviceType;
    };
    /**
     * Analyze deviceType string of the specified parser and check if it's compatible
     * @param parser parser to check
     * @param deviceType deviceType to check
     */
    Decoder.prototype.isCompatibleDeviceType = function (parser, deviceType) {
      // A parser may supported a list of devices (string split with '|'). Do not include 'any' parsers (managed later)
      const list = parser.deviceType.split("|").filter((q) => q === deviceType);
      return list.length > 0;
    };
    /**
     * Get active parsers
     * @param deviceType device type
     * @param frameCode frame code
     */
    Decoder.prototype.getActiveParsers = function (deviceType, frameCode) {
      const _this = this;
      let activeParsers = [];
      // Behavior: find if a specific parser exists for this deviceType
      //           otherwise try to find a ganeric parser
      //           if at least one parser has been found, add a status byte parser (specific or generic)
      // Device type is known, get parsers for given device type AND frame code
      let dataParser = this.parsers.filter(
        (p) =>
          _this.isCompatibleDeviceType(p, deviceType) &&
          (p.frameCode < 0 || p.frameCode === frameCode),
      );
      // If not custom decoder found, use a generic one
      // Repeater has only specific parsers. Do not add generic ones
      if (dataParser.length === 0 && deviceType !== "repeater") {
        const genericParsers = this.parsers.filter(
          (p) =>
            p.deviceType === "any" &&
            (p.frameCode < 0 || p.frameCode === frameCode),
        );
        dataParser = activeParsers.concat(genericParsers);
      }
      // Find the status byte parser: only if the frame is managed
      if (dataParser.length > 0) {
        const statusByteParsers = this.parsers.filter(
          (p) =>
            _this.isCompatibleDeviceType(p, deviceType) && p.frameCode === 0,
        );
        activeParsers = activeParsers.concat(statusByteParsers);
        if (statusByteParsers.length === 0) {
          const genericStatusByteParsers = this.parsers.filter(
            (p) => p.deviceType === "any" && p.frameCode === 0,
          );
          activeParsers = activeParsers.concat(genericStatusByteParsers);
        }
      }
      // Status parser must be first in list for a better display
      activeParsers = activeParsers.concat(dataParser);
      // Return active parser
      return activeParsers;
    };
    return Decoder;
  })();
  codec.Decoder = Decoder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Encoder class.
   *
   * Main class for encoding purposes.
   * Contains declaration of all required builders and encode() method (API entry point).
   *
   * See below for explanations on builders.
   */
  const Encoder = /** @class */ (function () {
    function Encoder() {
      /**
       * Builders declaration.
       *
       * Array of builder implementations that can be used by the library.
       *
       * Builders are specific handlers for encoding frame of a device type and a frame code.
       */
      this.builders = [
        new codec.Repeater0x01Builder(),
        new codec.Repeater0x02Builder(),
        new codec.Repeater0x03Builder(),
        new codec.Repeater0x04Builder(),
        new codec.Repeater0x05Builder(),
      ];
    }
    /**
     * Get supported device types and frame codes.
     *
     * The returned pairs are available for encoding.
     */
    Encoder.prototype.getSupported = function () {
      return this.builders.map((p) => ({
        deviceType: p.deviceType,
        frameCode: p.frameCode,
      }));
    };
    /**
     * Get input data types.
     * @param deviceType device type
     * @param frameCode frame code
     * @returns a map of available input data and associated types
     */
    Encoder.prototype.getInputDataTypes = function (deviceType, frameCode) {
      const builder = this.builders.find(
        (b) => b.deviceType === deviceType && b.frameCode === frameCode,
      );
      if (!builder) {
        return {};
      }
      const inputdataTypes = {};
      const inputData = new builder.inputDataClass();
      for (const key in inputData) {
        if (inputData.hasOwnProperty(key)) {
          inputdataTypes[key] = typeof inputData[key];
        }
      }
      return inputdataTypes;
    };
    /**
     * Encode given arguments.
     *
     * Generates a string payload from given arguments. Data object members and associated types can be known using
     * getInputDataTypes() method.
     *
     * @param deviceType device type
     * @param frameCode frame code
     * @param network network: lora868 or sigfox
     * @param data data object: map of available input data and values
     * @returns encoded data as string
     */
    Encoder.prototype.encode = function (deviceType, frameCode, network, data) {
      if (network === void 0) {
        network = "unknown";
      }
      const builder = this.builders.find(
        (b) => b.deviceType === deviceType && b.frameCode === frameCode,
      );
      if (!builder) {
        return "";
      }
      const payload = builder.buildFrame(
        data || new builder.inputDataClass(),
        network,
      );
      return payload.toString("hex");
    };
    return Encoder;
  })();
  codec.Encoder = Encoder;
})(codec || (codec = {}));
// CommonJS
if (typeof module !== "undefined") {
  module.exports = codec;
}
// Test (Mocha)
if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
  global.codec = codec;
}
var codec;
(function (codec) {
  /**
   * Internal codec storage
   */
  const InternalCodecStorage = /** @class */ (function () {
    function InternalCodecStorage() {
      this.store = {};
    }
    InternalCodecStorage.prototype.getItem = function (key) {
      return this.store[key];
    };
    InternalCodecStorage.prototype.removeItem = function (key) {
      delete this.store[key];
    };
    InternalCodecStorage.prototype.setItem = function (key, value) {
      this.store[key] = value;
    };
    return InternalCodecStorage;
  })();
  codec.InternalCodecStorage = InternalCodecStorage;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x10 (configuration) frame parser
   */
  const Analog0x10Parser = /** @class */ (function () {
    function Analog0x10Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x10;
    }
    Analog0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Analog configuration" };
      const ch1 = { name: "channel A" };
      const ch2 = { name: "channel B" };
      if (payload[8] === 2) {
        // TEST mode => period = value * 20sec
        appContent.transmissionPeriodKeepAlive = {
          unit: "s",
          value: payload[2] * 20,
        };
        appContent.transmissionPeriodData = {
          unit: "s",
          value: payload[3] * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 10min
        appContent.transmissionPeriodKeepAlive = {
          unit: "m",
          value: payload[2] * 10,
        };
        appContent.transmissionPeriodData = {
          unit: "m",
          value: payload[3] * 10,
        };
      }
      let debounce = this.getDebounceText(payload[5] >> 4);
      ch1.id = (payload[4] & 0xf0) >> 4;
      ch1.type = this.getSensorTypeText(payload[4] & 0x0f);
      if (payload[4] & 0x0f) {
        ch1.threshold = this.getThresholdTriggeringText(payload[5] & 0x03);
        ch1.externalTrigger = {
          type: this.getThresholdTriggeringText((payload[5] >> 2) & 0x03),
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      debounce = this.getDebounceText(payload[7] >> 4);
      ch2.id = (payload[6] & 0xf0) >> 4;
      ch2.type = this.getSensorTypeText(payload[6] & 0x0f);
      if (payload[6] & 0x0f) {
        ch2.threshold = this.getThresholdTriggeringText(payload[7] & 0x03);
        ch2.externalTrigger = {
          type: this.getThresholdTriggeringText((payload[7] >> 2) & 0x03),
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      appContent.channels = [ch1, ch2];
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[8],
      );
      return appContent;
    };
    /**
     * Get Sensor type text
     * @param value value
     */
    Analog0x10Parser.prototype.getSensorTypeText = function (value) {
      switch (value) {
        case 0:
          return "deactivated";
        case 1:
          return "0-10V";
        case 2:
          return "4-20mA";
        default:
          return "";
      }
    };
    /**
     * Get Threshold Triggering text
     * @param value value
     */
    Analog0x10Parser.prototype.getThresholdTriggeringText = function (value) {
      switch (value) {
        case 0:
          return "none";
        case 1:
          return "low";
        case 2:
          return "high";
        case 3:
          return "both";
        default:
          return "";
      }
    };
    /**
     * Get Waiting Period Duration text
     * @param value value
     */
    Analog0x10Parser.prototype.getDebounceText = function (value) {
      switch (value) {
        case 0:
          return [0, "s"];
        case 1:
          return [10, "ms"];
        case 2:
          return [20, "ms"];
        case 3:
          return [50, "ms"];
        case 4:
          return [100, "ms"];
        case 5:
          return [200, "ms"];
        case 6:
          return [500, "ms"];
        case 7:
          return [1, "s"];
        case 8:
          return [2, "s"];
        case 9:
          return [5, "s"];
        case 10:
          return [10, "s"];
        case 11:
          return [20, "s"];
        case 12:
          return [40, "s"];
        case 13:
          return [60, "s"];
        case 14:
          return [5, "m"];
        default:
          return [0, "s"];
      }
    };
    return Analog0x10Parser;
  })();
  codec.Analog0x10Parser = Analog0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x11 (configuration) frame parser
   */
  const Analog0x11Parser = /** @class */ (function () {
    function Analog0x11Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x11;
    }
    Analog0x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x11 Analog configuration" };
      // channel A high threshold configuration
      appContent.threshold = {
        name: "channel A",
        unit: "\u00B5" + "V or 10 nA",
        high: {
          value: payload.readUInt32BE(1) & 0x00ffffff,
          hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
        },
      };
      return appContent;
    };
    return Analog0x11Parser;
  })();
  codec.Analog0x11Parser = Analog0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x12 (configuration) frame parser
   */
  const Analog0x12Parser = /** @class */ (function () {
    function Analog0x12Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x12;
    }
    Analog0x12Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x12 Analog configuration" };
      // channel A high threshold configuration
      appContent.threshold = {
        name: "channel A",
        unit: "\u00B5" + "V or 10 nA",
        low: {
          value: payload.readUInt32BE(1) & 0x00ffffff,
          hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
        },
      };
      return appContent;
    };
    return Analog0x12Parser;
  })();
  codec.Analog0x12Parser = Analog0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x13 (configuration) frame parser
   */
  const Analog0x13Parser = /** @class */ (function () {
    function Analog0x13Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x13;
    }
    Analog0x13Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x13 Analog configuration" };
      // channel B high threshold configuration
      appContent.threshold = {
        name: "channel B",
        unit: "\u00B5" + "V or 10 nA",
        high: {
          value: payload.readUInt32BE(1) & 0x00ffffff,
          hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
        },
      };
      return appContent;
    };
    return Analog0x13Parser;
  })();
  codec.Analog0x13Parser = Analog0x13Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x14 (configuration) frame parser
   */
  const Analog0x14Parser = /** @class */ (function () {
    function Analog0x14Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x14;
    }
    Analog0x14Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x14 Analog configuration" };
      // channel B high threshold configuration
      appContent.threshold = {
        name: "channel B",
        unit: "\u00B5" + "V or 10 nA",
        low: {
          value: payload.readUInt32BE(1) & 0x00ffffff,
          hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
        },
      };
      return appContent;
    };
    return Analog0x14Parser;
  })();
  codec.Analog0x14Parser = Analog0x14Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x30 (keep alive) frame parser
   */
  const Analog0x30Parser = /** @class */ (function () {
    function Analog0x30Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x30;
      this.parser = new codec.Analog0x42Parser();
    }
    Analog0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = this.parser.parseFrame(
        payload,
        configuration,
        network,
      );
      appContent.type = "0x30 Analog keep alive";
      return appContent;
    };
    return Analog0x30Parser;
  })();
  codec.Analog0x30Parser = Analog0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog 0x42 (data) frame parser
   */
  const Analog0x42Parser = /** @class */ (function () {
    function Analog0x42Parser() {
      this.deviceType = "analog";
      this.frameCode = 0x42;
    }
    Analog0x42Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x42 Analog data" };
      const ch1 = { name: "channel A" };
      const ch2 = { name: "channel B" };
      // channel A
      let type = payload[2] & 0x0f;
      let rawValue = payload.readUInt32BE(2) & 0x00ffffff;
      if (type === 1) {
        ch1.unit = "V";
        // convert µV into V (with 3 fraction digits)
        ch1.value = parseFloat((rawValue / (1000 * 1000)).toFixed(3));
      } else if (type === 2) {
        ch1.unit = "mA";
        // convert 10nA into mA (with 3 fraction digits)
        ch1.value = parseFloat((rawValue / (100 * 1000)).toFixed(3));
      } else {
        ch1.state = "deactivated";
      }
      // channel A
      type = payload[6] & 0x0f;
      rawValue = payload.readUInt32BE(6) & 0x00ffffff;
      if (type === 1) {
        ch2.unit = "V";
        // convert µV into V (with 3 fraction digits)
        ch2.value = parseFloat((rawValue / (1000 * 1000)).toFixed(3));
      } else if (type === 2) {
        ch2.unit = "mA";
        // convert 10nA into mA (with 3 fraction digits)
        ch2.value = parseFloat((rawValue / (100 * 1000)).toFixed(3));
      } else {
        ch2.state = "deactivated";
      }
      appContent.channels = [ch1, ch2];
      return appContent;
    };
    return Analog0x42Parser;
  })();
  codec.Analog0x42Parser = Analog0x42Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Analog status byte parser
   */
  const AnalogStatusByteParser = /** @class */ (function () {
    function AnalogStatusByteParser() {
      this.deviceType = "analog";
      this.frameCode = 0;
    }
    AnalogStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.alarmChannelA = Boolean(payload[1] & 0x08);
      statusContent.alarmChannelB = Boolean(payload[1] & 0x10);
      return { status: statusContent };
    };
    return AnalogStatusByteParser;
  })();
  codec.AnalogStatusByteParser = AnalogStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Breath 0x10 (configuration) frame parser
   */
  const Breath0x10Parser = /** @class */ (function () {
    function Breath0x10Parser() {
      this.deviceType = "breath";
      this.frameCode = 0x10;
    }
    Breath0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Keep Alive frame TX 0: Disable or 1: Enable H24 frame
      // register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
      // register 320: value between 1 and 65535
      // register 321: value between 0 and 65535, 0: no scanning, X2s
      // register 323: value between 1 and 255 : Number of additional (redundant) samples per frame
      const appContent = { type: "0x10 Breath configuration" };
      (appContent.dailyFrameActivated = Boolean(payload.readUInt8(2) !== 0)),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(3)),
        (appContent.historyPeriod = {
          unit: "s",
          value: payload.readUInt16BE(5),
        }),
        (appContent.alarmRepeatActivated = Boolean(payload.readUInt8(7) !== 0)),
        (appContent.alarmRepeatPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8),
        }),
        (appContent.redundantSamples = payload.readUInt8(10));
      return appContent;
    };
    return Breath0x10Parser;
  })();
  codec.Breath0x10Parser = Breath0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Breath 0x30 Keep alive / daily frame parser
   */
  const Breath0x30Parser = /** @class */ (function () {
    function Breath0x30Parser() {
      this.deviceType = "breath";
      this.frameCode = 0x30;
    }
    Breath0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Daily frame" };
      if (payload.byteLength >= 11) {
        appContent.tvoc = {
          min: { unit: "µg/m3", value: payload.readUInt16BE(2) },
          max: { unit: "µg/m3", value: payload.readUInt16BE(4) },
          average: { unit: "µg/m3", value: payload.readUInt16BE(6) },
          duration: { unit: "min", value: payload.readUInt16BE(8) },
        };
        appContent.pm10 = {
          min: { unit: "µg/m3", value: payload.readUInt16BE(10) },
          max: { unit: "µg/m3", value: payload.readUInt16BE(12) },
          average: { unit: "µg/m3", value: payload.readUInt16BE(14) },
          duration: { unit: "min", value: payload.readUInt16BE(16) },
        };
        appContent.pm25 = {
          min: { unit: "µg/m3", value: payload.readUInt16BE(18) },
          max: { unit: "µg/m3", value: payload.readUInt16BE(20) },
          average: { unit: "µg/m3", value: payload.readUInt16BE(22) },
          duration: { unit: "min", value: payload.readUInt16BE(24) },
        };
        appContent.pm1 = {
          min: { unit: "µg/m3", value: payload.readUInt16BE(26) },
          max: { unit: "µg/m3", value: payload.readUInt16BE(28) },
          average: { unit: "µg/m3", value: payload.readUInt16BE(30) },
        };
      } else {
        appContent.tvoc = {
          max: { unit: "µg/m3", value: payload.readUInt16BE(2) },
        };
        appContent.pm10 = {
          max: { unit: "µg/m3", value: payload.readUInt16BE(4) },
        };
        appContent.pm25 = {
          max: { unit: "µg/m3", value: payload.readUInt16BE(6) },
        };
        appContent.pm1 = {
          max: { unit: "µg/m3", value: payload.readUInt16BE(8) },
        };
      }
      return appContent;
    };
    return Breath0x30Parser;
  })();
  codec.Breath0x30Parser = Breath0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Breath 0X6D (data) frame parser
   */
  const Breath0x6dParser = /** @class */ (function () {
    function Breath0x6dParser() {
      this.deviceType = "breath";
      this.frameCode = 0x6d;
    }
    Breath0x6dParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x6d Breath periodic data" };
      let rawValue;
      const pm10 = [];
      const pm25 = [];
      const pm1 = [];
      const tvoc = [];
      const payloadLength = payload.byteLength;
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payloadLength; offset += 8) {
        rawValue = payload.readUInt16BE(offset);
        tvoc.push(rawValue);
        rawValue = payload.readUInt16BE(offset + 2);
        pm10.push(rawValue);
        rawValue = payload.readUInt16BE(offset + 4);
        pm25.push(rawValue);
        rawValue = payload.readUInt16BE(offset + 6);
        pm1.push(rawValue);
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.tvoc = { unit: "µg/m3", values: tvoc };
      appContent.pm10 = { unit: "µg/m3", values: pm10 };
      appContent.pm25 = { unit: "µg/m3", values: pm25 };
      appContent.pm1 = { unit: "µg/m3", values: pm1 };
      return appContent;
    };
    return Breath0x6dParser;
  })();
  codec.Breath0x6dParser = Breath0x6dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Breath 0x6e (alarm) frame parser
   */
  const Breath0x6eParser = /** @class */ (function () {
    function Breath0x6eParser() {
      this.deviceType = "breath";
      this.frameCode = 0x6e;
    }
    Breath0x6eParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x6e Breath alarm" };
      appContent.tvoc = {
        alarmStatus: payload[2] & 0x01 ? "active" : "inactive",
        unit: "µg/m3",
        value: payload.readUInt16BE(3),
      };
      appContent.pm10 = {
        alarmStatus: payload[2] & 0x02 ? "active" : "inactive",
        unit: "µg/m3",
        value: payload.readUInt16BE(5),
      };
      appContent.pm25 = {
        alarmStatus: payload[2] & 0x04 ? "active" : "inactive",
        unit: "µg/m3",
        value: payload.readUInt16BE(7),
      };
      appContent.pm1 = {
        alarmStatus: payload[2] & 0x08 ? "active" : "inactive",
        unit: "µg/m3",
        value: payload.readUInt16BE(9),
      };
      return appContent;
    };
    return Breath0x6eParser;
  })();
  codec.Breath0x6eParser = Breath0x6eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Breath status byte parser
   */
  const BreathStatusByteParser = /** @class */ (function () {
    function BreathStatusByteParser() {
      this.deviceType = "breath";
      this.frameCode = 0;
    }
    BreathStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.sensorError = Boolean(payload[1] & 0x16);
      return { status: statusContent };
    };
    return BreathStatusByteParser;
  })();
  codec.BreathStatusByteParser = BreathStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 0x10 (configuration) frame parser
   */
  const Comfort0x10Parser = /** @class */ (function () {
    function Comfort0x10Parser() {
      this.deviceType = "comfort";
      this.frameCode = 0x10;
    }
    Comfort0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Emission period of the life frame X 10s
      // register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
      // register 320: value between 1 and 65535
      // register 321: value between 0 and 65535, 0: no scanning, X2s
      // reading_frequency = S321 * S320
      // sending_frequency = S321 * S320 * S301
      const appContent = { type: "0x10 Comfort configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return Comfort0x10Parser;
  })();
  codec.Comfort0x10Parser = Comfort0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 0x4c (historic data) frame parser
   */
  const Comfort0x4cParser = /** @class */ (function () {
    function Comfort0x4cParser() {
      this.deviceType = "comfort";
      this.frameCode = 0x4c;
    }
    Comfort0x4cParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4c Comfort data" };
      let rawValue;
      const temp = [];
      const humidity = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payload.byteLength; offset += 3) {
        rawValue = payload.readInt16BE(offset);
        temp.push(rawValue / 10);
        rawValue = payload.readUInt8(offset + 2);
        humidity.push(rawValue);
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.temperature = { unit: "\u00B0" + "C", values: temp };
      appContent.humidity = { unit: "\u0025", values: humidity };
      return appContent;
    };
    return Comfort0x4cParser;
  })();
  codec.Comfort0x4cParser = Comfort0x4cParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 0x4d (alarm) frame parser
   */
  const Comfort0x4dParser = /** @class */ (function () {
    function Comfort0x4dParser() {
      this.deviceType = "comfort";
      this.frameCode = 0x4d;
    }
    Comfort0x4dParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4d Comfort alarm" };
      appContent.alarmTemperature = {
        alarmStatus: payload.readUInt8(2) >> 4 ? "active" : "inactive",
        temperature: {
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(3) / 10,
        },
      };
      appContent.alarmHumidity = {
        alarmStatus: payload.readUInt8(2) & 1 ? "active" : "inactive",
        humidity: { unit: "\u0025", value: payload.readUInt8(5) },
      };
      return appContent;
    };
    return Comfort0x4dParser;
  })();
  codec.Comfort0x4dParser = Comfort0x4dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort CO2 0x10 (configuration) frame parser
   */
  const ComfortCo20x10Parser = /** @class */ (function () {
    function ComfortCo20x10Parser() {
      this.deviceType = "comfortCo2";
      this.frameCode = 0x10;
    }
    ComfortCo20x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Keep Alive frame TX 0: Disable or 1: Enable H24 frame
      // register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
      // register 320: value between 1 and 65535
      // register 321: value between 0 and 65535, 0: no scanning, X2s
      // register 323: value between 1 and 255 : Number of additional (redundant) samples per frame
      // reading_frequency = S321 * S320
      // sending_frequency = S321 * S320 * S301
      const appContent = { type: "0x10 Comfort CO2 configuration" };
      (appContent.dailyFrameActivated = Boolean(payload.readUInt16BE(2) !== 0)),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.redundantSamples = payload.readUInt8(10)),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      // Content depends on network
      if (payload.byteLength >= 12) {
        appContent.blackOutDuration = {
          unit: "h",
          value: payload.readUInt8(11),
        };
        appContent.blackOutStartTime = {
          unit: "h",
          value: payload.readUInt8(12),
        };
      }
      return appContent;
    };
    return ComfortCo20x10Parser;
  })();
  codec.ComfortCo20x10Parser = ComfortCo20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort CO2 0x30 Keep alive / daily frame parser
   */
  const ComfortCo20x30Parser = /** @class */ (function () {
    function ComfortCo20x30Parser() {
      this.deviceType = "comfortCo2";
      this.frameCode = 0x30;
    }
    ComfortCo20x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Comfort CO2 Daily frame" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(19) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.icone = payload.readUInt8(2);
      appContent.qaiRedDuration = {
        unit: "min",
        value: payload.readUInt8(3) * 10,
      };
      appContent.temperatureMax = {
        unit: "\u00B0" + "C",
        value: payload.readInt16BE(4) / 10,
      };
      appContent.co2Max = { unit: "ppm", value: payload.readUInt16BE(6) };
      appContent.humidityMax = { unit: "%", value: payload.readUInt8(8) };
      appContent.temperatureMin = {
        unit: "\u00B0" + "C",
        value: payload.readInt16BE(9) / 10,
      };
      // Content depends on network
      switch (payload.byteLength) {
        case 11:
          break;
        case 19:
        case 23:
          appContent.co2Min = { unit: "ppm", value: payload.readUInt16BE(11) };
          appContent.humidityMin = { unit: "%", value: payload.readUInt8(13) };
          appContent.temperatureAverage = {
            unit: "\u00B0" + "C",
            value: payload.readInt16BE(14) / 10,
          };
          appContent.co2Average = {
            unit: "ppm",
            value: payload.readUInt16BE(16),
          };
          appContent.humidityAverage = {
            unit: "%",
            value: payload.readUInt8(18),
          };
          break;
        default:
          appContent.partialDecoding =
            codec.PartialDecodingReason.MISSING_NETWORK;
          break;
      }
      return appContent;
    };
    return ComfortCo20x30Parser;
  })();
  codec.ComfortCo20x30Parser = ComfortCo20x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort CO2 0x6a (historic data) frame parser
   */
  const ComfortCo20x6aParser = /** @class */ (function () {
    function ComfortCo20x6aParser() {
      this.deviceType = "comfortCo2";
      this.frameCode = 0x6a;
    }
    ComfortCo20x6aParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x6a Comfort CO2 data" };
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payloadLength) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      let rawValue;
      const temp = [];
      const humidity = [];
      const CO2 = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payloadLength; offset += 5) {
        rawValue = payload.readInt16BE(offset);
        temp.push(rawValue / 10);
        rawValue = payload.readUInt8(offset + 2);
        humidity.push(rawValue);
        rawValue = payload.readUInt16BE(offset + 3);
        CO2.push(rawValue);
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.temperature = { unit: "\u00B0" + "C", values: temp };
      appContent.humidity = { unit: "%", values: humidity };
      appContent.co2 = { unit: "ppm", values: CO2 };
      return appContent;
    };
    return ComfortCo20x6aParser;
  })();
  codec.ComfortCo20x6aParser = ComfortCo20x6aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort CO2 0x6b (alarm) frame parser
   */
  const ComfortCo20x6bParser = /** @class */ (function () {
    function ComfortCo20x6bParser() {
      this.deviceType = "comfortCo2";
      this.frameCode = 0x6b;
    }
    ComfortCo20x6bParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x6b Comfort CO2 alarm" };
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payloadLength) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.alarmTemperature = {
        alarmStatus: payload[2] & 0x10 ? "active" : "inactive",
        temperature: {
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(3) / 10,
        },
      };
      appContent.alarmHumidity = {
        alarmStatus: payload[2] & 0x01 ? "active" : "inactive",
        humidity: { unit: "%", value: payload.readUInt8(5) },
      };
      appContent.alarmCo2 = {
        alarmStatus: payload[2] & 0x20 ? "active" : "inactive",
        co2: { unit: "ppm", value: payload.readInt16BE(6) },
      };
      return appContent;
    };
    return ComfortCo20x6bParser;
  })();
  codec.ComfortCo20x6bParser = ComfortCo20x6bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort CO2 status byte parser
   */
  const ComfortCo2StatusByteParser = /** @class */ (function () {
    function ComfortCo2StatusByteParser() {
      this.deviceType = "comfortCo2";
      this.frameCode = 0;
    }
    ComfortCo2StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.timestamp = Boolean(payload[1] & 0x04);
      return { status: statusContent };
    };
    return ComfortCo2StatusByteParser;
  })();
  codec.ComfortCo2StatusByteParser = ComfortCo2StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 2 0x10 (configuration) frame parser
   */
  const Comfort20x10Parser = /** @class */ (function () {
    function Comfort20x10Parser() {
      this.deviceType = "comfort2";
      this.frameCode = 0x10;
    }
    Comfort20x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Emission period of the life frame X 10s
      // register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
      // register 320: value between 1 and 65535
      // register 321: value between 0 and 65535, 0: no scanning, X2s
      // register 323: value between 1 and 255 : Number of additional (redundant) samples per frame
      // reading_frequency = S321 * S320
      // sending_frequency = S321 * S320 * S301
      const appContent = { type: "0x10 Comfort 2 configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.redundantSamples = payload.readUInt8(10)),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return Comfort20x10Parser;
  })();
  codec.Comfort20x10Parser = Comfort20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 2 0x4c (historic data) frame parser
   */
  const Comfort20x4cParser = /** @class */ (function () {
    function Comfort20x4cParser() {
      this.deviceType = "comfort2";
      this.frameCode = 0x4c;
    }
    Comfort20x4cParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4c Comfort 2 data" };
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payloadLength) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      let rawValue;
      const temp = [];
      const humidity = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payloadLength; offset += 3) {
        rawValue = payload.readInt16BE(offset);
        temp.push(rawValue / 10);
        rawValue = payload.readUInt8(offset + 2);
        humidity.push(rawValue);
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.temperature = { unit: "\u00B0" + "C", values: temp };
      appContent.humidity = { unit: "\u0025", values: humidity };
      return appContent;
    };
    return Comfort20x4cParser;
  })();
  codec.Comfort20x4cParser = Comfort20x4cParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 2 0x4d (alarm) frame parser
   */
  const Comfort20x4dParser = /** @class */ (function () {
    function Comfort20x4dParser() {
      this.deviceType = "comfort2";
      this.frameCode = 0x4d;
    }
    Comfort20x4dParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4d Comfort 2 alarm" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(6) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.alarmTemperature = {
        alarmStatus: payload.readUInt8(2) >> 4 ? "active" : "inactive",
        temperature: {
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(3) / 10,
        },
      };
      appContent.alarmHumidity = {
        alarmStatus: payload.readUInt8(2) & 1 ? "active" : "inactive",
        humidity: { unit: "\u0025", value: payload.readUInt8(5) },
      };
      return appContent;
    };
    return Comfort20x4dParser;
  })();
  codec.Comfort20x4dParser = Comfort20x4dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Comfort 2 status byte parser
   */
  const Comfort2StatusByteParser = /** @class */ (function () {
    function Comfort2StatusByteParser() {
      this.deviceType = "comfort2";
      this.frameCode = 0;
    }
    Comfort2StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.timestamp = Boolean(payload[1] & 0x04);
      return { status: statusContent };
    };
    return Comfort2StatusByteParser;
  })();
  codec.Comfort2StatusByteParser = Comfort2StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x10 (configuration) frame parser
   */
  const Deltap0x10Parser = /** @class */ (function () {
    function Deltap0x10Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x10;
    }
    Deltap0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Emission period of the life frame
      // register 301: Issue period, value between 0 and 65535, 0: disabling periodic transmission
      // register 320: value betwenn 1 and 65535
      // register 321: value betwenn 0 and 65535, 0: no scanning, X2s
      // reading_frequency = S321 * S320
      // sending_frequency = S321 * S320 * S301
      const appContent = { type: "0x10 Delta P configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return Deltap0x10Parser;
  })();
  codec.Deltap0x10Parser = Deltap0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x11 (0-10V configuration) frame parser
   */
  const Deltap0x11Parser = /** @class */ (function () {
    function Deltap0x11Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x11;
    }
    Deltap0x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 322: value between 1 and 65535
      // register 323: value between 0 and 65535, 0: no scanning, X2s
      // register 324: Issue period, value between 0 and 65535, 0: disabling periodic transmission
      // reading_frequency = S322 * S323
      // sending_frequency = S322 * S323 * S324
      const appContent = { type: "0x11 Delta P 0-10V configuration" };
      appContent.numberOfHistorizationBeforeSending = payload.readUInt16BE(6);
      appContent.numberOfSamplingBeforeHistorization = payload.readUInt16BE(2);
      appContent.samplingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(4) * 2,
      };
      appContent.calculatedPeriodRecording = {
        unit: "s",
        value: payload.readUInt16BE(2) * payload.readUInt16BE(4) * 2,
      };
      appContent.calculatedSendingPeriod = {
        unit: "s",
        value:
          payload.readUInt16BE(2) *
          payload.readUInt16BE(4) *
          payload.readUInt16BE(6) *
          2,
      };
      return appContent;
    };
    return Deltap0x11Parser;
  })();
  codec.Deltap0x11Parser = Deltap0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x2f (downlink ACK) frame parser
   */
  const Deltap0x2fParser = /** @class */ (function () {
    function Deltap0x2fParser() {
      this.deviceType = "deltap";
      this.frameCode = 0x2f;
    }
    Deltap0x2fParser.prototype.parseFrame = function (payload, configuration) {
      const appContent = { type: "0x2f Delta P Downlink ack" };
      appContent.requestStatus = this.getRequestStatusText(payload[2]);
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    Deltap0x2fParser.prototype.getRequestStatusText = function (value) {
      switch (value) {
        case 1:
          return "success";
        case 2:
          return "errorGeneric";
        case 3:
          return "errorWrongState";
        case 4:
          return "errorInvalidRequest";
        default:
          return "errorOtherReason";
      }
    };
    return Deltap0x2fParser;
  })();
  codec.Deltap0x2fParser = Deltap0x2fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x53 (Delta P periodic) frame parser
   */
  const Deltap0x53Parser = /** @class */ (function () {
    function Deltap0x53Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x53;
    }
    Deltap0x53Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x53 Delta P periodic data" };
      const pressures = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payload.byteLength; offset += 2) {
        pressures.push(payload.readInt16BE(offset));
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.deltaPressure = { unit: "pa", values: pressures };
      return appContent;
    };
    return Deltap0x53Parser;
  })();
  codec.Deltap0x53Parser = Deltap0x53Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x54 (pressure alarm) frame parser
   */
  const Deltap0x54Parser = /** @class */ (function () {
    function Deltap0x54Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x54;
    }
    Deltap0x54Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x54 Delta P alarm" };
      // Bit 0: alarm pressure state (0: inactive, 1: active)
      appContent.alarmStatus = payload.readUInt8(2) ? "active" : "inactive";
      // Pressure value
      appContent.deltaPressure = { unit: "pa", value: payload.readInt16BE(3) };
      return appContent;
    };
    return Deltap0x54Parser;
  })();
  codec.Deltap0x54Parser = Deltap0x54Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x55 (periodic 0-10 V) frame parser
   */
  const Deltap0x55Parser = /** @class */ (function () {
    function Deltap0x55Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x55;
    }
    Deltap0x55Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x55 Delta P - periodic 0-10 V" };
      const voltages = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 2; offset < payload.byteLength; offset += 2) {
        voltages.push(payload.readInt16BE(offset));
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.voltage = { unit: "mV", values: voltages };
      return appContent;
    };
    return Deltap0x55Parser;
  })();
  codec.Deltap0x55Parser = Deltap0x55Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Delta P 0x56 (alarm 0-10 V) frame parser
   */
  const Deltap0x56Parser = /** @class */ (function () {
    function Deltap0x56Parser() {
      this.deviceType = "deltap";
      this.frameCode = 0x56;
    }
    Deltap0x56Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x56 Delta P - alarm 0-10 V" };
      // Bit 0: alarm state (0: inactive, 1:active)
      appContent.alarmStatus = payload.readUInt8(2) ? "active" : "inactive";
      // Voltage value (in mV)
      appContent.voltage = { unit: "mV", value: payload.readInt16BE(3) };
      return appContent;
    };
    return Deltap0x56Parser;
  })();
  codec.Deltap0x56Parser = Deltap0x56Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 0x10 (configuration) frame parser
   */
  const Drycontacts0x10Parser = /** @class */ (function () {
    function Drycontacts0x10Parser() {
      this.deviceType = "drycontacts";
      this.frameCode = 0x10;
    }
    Drycontacts0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Dry Contacts configuration" };
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[8],
      );
      if (payload[8] === 1) {
        appContent.keepAlivePeriod = {
          unit: "m",
          value: payload.readUInt8(2) * 10,
        };
        appContent.transmitPeriod = {
          unit: "m",
          value: payload.readUInt8(3) * 10,
        };
      } else {
        appContent.keepAlivePeriod = {
          unit: "s",
          value: payload.readUInt8(2) * 20,
        };
        appContent.transmitPeriod = {
          unit: "s",
          value: payload.readUInt8(3) * 20,
        };
      }
      // Channel x configuration
      // payload[y]<3:0> => type
      // payload[y]<7:4> => waiting period duration
      // Channel A configuration
      let debounce = this.getDebounceText(payload[4] >> 4);
      let type = this.getTypeText(payload[4] & 0x0f);
      if (type[0] === "disabled") {
        appContent.channelA = { type: type[0] };
      } else {
        appContent.channelA = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel B configuration
      debounce = this.getDebounceText(payload[5] >> 4);
      type = this.getTypeText(payload[5] & 0x0f);
      if (type[0] === "disabled") {
        appContent.channelB = { type: type[0] };
      } else {
        appContent.channelB = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel C configuration
      debounce = this.getDebounceText(payload[6] >> 4);
      type = this.getTypeText(payload[6] & 0x0f);
      if (type[0] === "disabled") {
        appContent.channelC = { type: type[0] };
      } else {
        appContent.channelC = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel D configuration
      debounce = this.getDebounceText(payload[7] >> 4);
      type = this.getTypeText(payload[7] & 0x0f);
      if (type[0] === "disabled") {
        appContent.channelD = { type: type[0] };
      } else {
        appContent.channelD = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    Drycontacts0x10Parser.prototype.getTypeText = function (value) {
      switch (value) {
        case 0:
          return ["disabled", ""];
        case 1:
          return ["inputPeriodic", "high"];
        case 2:
          return ["inputPeriodic", "low"];
        case 3:
          return ["inputPeriodic", "both"];
        case 4:
          return ["inputEvent", "high"];
        case 5:
          return ["inputEvent", "low"];
        case 6:
          return ["inputEvent", "both"];
        case 7:
          return ["output", "high"];
        case 8:
          return ["output", "low"];
        default:
          return ["disabled", ""];
      }
    };
    /**
     * Get Waiting Period Duration text
     * @param value value
     */
    Drycontacts0x10Parser.prototype.getDebounceText = function (value) {
      switch (value) {
        case 0:
          return [0, "s"];
        case 1:
          return [10, "ms"];
        case 2:
          return [20, "ms"];
        case 3:
          return [50, "ms"];
        case 4:
          return [100, "ms"];
        case 5:
          return [200, "ms"];
        case 6:
          return [500, "ms"];
        case 7:
          return [1, "s"];
        case 8:
          return [2, "s"];
        case 9:
          return [5, "s"];
        case 10:
          return [10, "s"];
        case 11:
          return [20, "s"];
        case 12:
          return [40, "s"];
        case 13:
          return [60, "s"];
        case 14:
          return [5, "m"];
        case 15:
          return [10, "m"];
        default:
          return [0, "s"];
      }
    };
    return Drycontacts0x10Parser;
  })();
  codec.Drycontacts0x10Parser = Drycontacts0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 0x40 (data) frame parser
   */
  const Drycontacts0x40Parser = /** @class */ (function () {
    function Drycontacts0x40Parser() {
      this.deviceType = "drycontacts";
      this.frameCode = 0x40;
    }
    Drycontacts0x40Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x40 Dry Contacts data" };
      appContent.decodingInfo = "true: ON/CLOSED, false: OFF/OPEN";
      appContent.channelA = {
        value: payload.readUInt16BE(2),
        currentState: Boolean(payload[10] & 0x01),
        previousFrameState: Boolean(payload[10] & 0x02),
      };
      appContent.channelB = {
        value: payload.readUInt16BE(4),
        currentState: Boolean(payload[10] & 0x04),
        previousFrameState: Boolean(payload[10] & 0x08),
      };
      appContent.channelC = {
        value: payload.readUInt16BE(6),
        currentState: Boolean(payload[10] & 0x10),
        previousFrameState: Boolean(payload[10] & 0x20),
      };
      appContent.channelD = {
        value: payload.readUInt16BE(8),
        currentState: Boolean(payload[10] & 0x40),
        previousFrameState: Boolean(payload[10] & 0x80),
      };
      return appContent;
    };
    return Drycontacts0x40Parser;
  })();
  codec.Drycontacts0x40Parser = Drycontacts0x40Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * DRYCONTACTS status byte parser
   */
  const DrycontactsStatusByteParser = /** @class */ (function () {
    function DrycontactsStatusByteParser() {
      this.deviceType = "drycontacts";
      this.frameCode = 0;
    }
    DrycontactsStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      return { status: statusContent };
    };
    return DrycontactsStatusByteParser;
  })();
  codec.DrycontactsStatusByteParser = DrycontactsStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 2 0x10 (configuration) frame parser
   */
  const Drycontacts20x10Parser = /** @class */ (function () {
    function Drycontacts20x10Parser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0x10;
    }
    Drycontacts20x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Dry Contacts 2 configuration" };
      appContent.keepAlivePeriod = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      };
      appContent.transmitPeriod = {
        unit: "s",
        value: payload.readUInt16BE(4) * 10,
      };
      // Channel x configuration
      // payload[y]<3:0> => type
      // payload[y]<7:4> => waiting period duration
      // Channel A configuration
      let debounce = this.getDebounceText(payload[6] >> 4);
      let type = this.getTypeText(payload[6] & 0x0f);
      if (type[0] === "disabled" || type[0] === "output") {
        appContent.channelA = { type: type[0] };
      } else {
        appContent.channelA = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel B configuration
      debounce = this.getDebounceText(payload[7] >> 4);
      type = this.getTypeText(payload[7] & 0x0f);
      if (type[0] === "disabled" || type[0] === "output") {
        appContent.channelB = { type: type[0] };
      } else {
        appContent.channelB = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel C configuration
      debounce = this.getDebounceText(payload[8] >> 4);
      type = this.getTypeText(payload[8] & 0x0f);
      if (type[0] === "disabled" || type[0] === "output") {
        appContent.channelC = { type: type[0] };
      } else {
        appContent.channelC = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      // Channel D configuration
      debounce = this.getDebounceText(payload[9] >> 4);
      type = this.getTypeText(payload[9] & 0x0f);
      if (type[0] === "disabled" || type[0] === "output") {
        appContent.channelD = { type: type[0] };
      } else {
        appContent.channelD = {
          type: type[0],
          edge: type[1],
          debounceDuration: { unit: debounce[1], value: debounce[0] },
        };
      }
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    Drycontacts20x10Parser.prototype.getTypeText = function (value) {
      switch (value) {
        case 0:
          return ["disabled", ""];
        case 1:
          return ["input", "high"];
        case 2:
          return ["input", "low"];
        case 3:
          return ["input", "both"];
        case 4:
          return ["output", ""];
        default:
          return ["disabled", ""];
      }
    };
    /**
     * Get Waiting Period Duration text
     * @param value value
     */
    Drycontacts20x10Parser.prototype.getDebounceText = function (value) {
      switch (value) {
        case 0:
          return [0, "s"];
        case 1:
          return [10, "ms"];
        case 2:
          return [20, "ms"];
        case 3:
          return [50, "ms"];
        case 4:
          return [100, "ms"];
        case 5:
          return [200, "ms"];
        case 6:
          return [500, "ms"];
        case 7:
          return [1, "s"];
        case 8:
          return [2, "s"];
        case 9:
          return [5, "s"];
        case 10:
          return [10, "s"];
        case 11:
          return [20, "s"];
        case 12:
          return [40, "s"];
        case 13:
          return [60, "s"];
        case 14:
          return [5, "m"];
        case 15:
          return [10, "m"];
        default:
          return [0, "s"];
      }
    };
    return Drycontacts20x10Parser;
  })();
  codec.Drycontacts20x10Parser = Drycontacts20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 0x30 (keep alive) frame parser
   */
  const Drycontacts20x30Parser = /** @class */ (function () {
    function Drycontacts20x30Parser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0x30;
    }
    Drycontacts20x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Dry Contacts 2 keep alive" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.channelA = {
        value: payload.readUInt16BE(2),
        state: Boolean(payload[10] & 0x01),
      };
      appContent.channelB = {
        value: payload.readUInt16BE(4),
        state: Boolean(payload[10] & 0x02),
      };
      appContent.channelC = {
        value: payload.readUInt16BE(6),
        state: Boolean(payload[10] & 0x04),
      };
      appContent.channelD = {
        value: payload.readUInt16BE(8),
        state: Boolean(payload[10] & 0x08),
      };
      return appContent;
    };
    return Drycontacts20x30Parser;
  })();
  codec.Drycontacts20x30Parser = Drycontacts20x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 0x40 (data) frame parser
   */
  const Drycontacts20x40Parser = /** @class */ (function () {
    function Drycontacts20x40Parser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0x40;
    }
    Drycontacts20x40Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x40 Dry Contacts 2 data" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "true: ON/CLOSED, false: OFF/OPEN";
      appContent.channelA = {
        value: payload.readUInt16BE(2),
        currentState: Boolean(payload[10] & 0x01),
        previousFrameState: Boolean(payload[10] & 0x02),
      };
      appContent.channelB = {
        value: payload.readUInt16BE(4),
        currentState: Boolean(payload[10] & 0x04),
        previousFrameState: Boolean(payload[10] & 0x08),
      };
      appContent.channelC = {
        value: payload.readUInt16BE(6),
        currentState: Boolean(payload[10] & 0x10),
        previousFrameState: Boolean(payload[10] & 0x20),
      };
      appContent.channelD = {
        value: payload.readUInt16BE(8),
        currentState: Boolean(payload[10] & 0x40),
        previousFrameState: Boolean(payload[10] & 0x80),
      };
      return appContent;
    };
    return Drycontacts20x40Parser;
  })();
  codec.Drycontacts20x40Parser = Drycontacts20x40Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 0x41 (duration alarm ) frame parser
   */
  const Drycontacts20x41Parser = /** @class */ (function () {
    function Drycontacts20x41Parser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0x41;
    }
    Drycontacts20x41Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x41 Dry Contacts 2 duration alarm" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(5) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.channel = payload.readUInt8(2);
      appContent.durationThreshold = {
        unit: "min",
        value: payload.readUInt16BE(3),
      };
      return appContent;
    };
    return Drycontacts20x41Parser;
  })();
  codec.Drycontacts20x41Parser = Drycontacts20x41Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Dry Contacts 2 0x59 time counting data frame parser
   */
  const Drycontacts20x59Parser = /** @class */ (function () {
    function Drycontacts20x59Parser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0x59;
    }
    Drycontacts20x59Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x59 Dry Contacts 2 time counting data" };
      // Concerns only Lora products
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      let offset = 3;
      if (payload[2] & 0x01) {
        appContent.channelATimeCounter = {
          unit: "s",
          value: payload.readUInt32BE(offset),
        };
        offset += 4;
      }
      if (payload[2] & 0x02) {
        appContent.channelBTimeCounter = {
          unit: "s",
          value: payload.readUInt32BE(offset),
        };
        offset += 4;
      }
      if (payload[2] & 0x04) {
        appContent.channelCTimeCounter = {
          unit: "s",
          value: payload.readUInt32BE(offset),
        };
        offset += 4;
      }
      if (payload[2] & 0x08) {
        appContent.channelDTimeCounter = {
          unit: "s",
          value: payload.readUInt32BE(offset),
        };
      }
      return appContent;
    };
    return Drycontacts20x59Parser;
  })();
  codec.Drycontacts20x59Parser = Drycontacts20x59Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 status byte parser
   */
  const Drycontacts2StatusByteParser = /** @class */ (function () {
    function Drycontacts2StatusByteParser() {
      this.deviceType = "drycontacts2";
      this.frameCode = 0;
    }
    Drycontacts2StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.timestamp = Boolean(payload[1] & 0x04);
      return { status: statusContent };
    };
    return Drycontacts2StatusByteParser;
  })();
  codec.Drycontacts2StatusByteParser = Drycontacts2StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Smart Building 0x1f (TOR configuration) frame parser
   */
  const Generic0x1fParser = /** @class */ (function () {
    function Generic0x1fParser() {
      this.deviceType = "motion|comfort|comfort2|comfortCo2|deltap|breath";
      this.frameCode = 0x1f;
    }
    Generic0x1fParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 380: Configuration digital input 1
      // register 381: Alarm threshold digital input 1
      // register 382: Configuration digital input 2
      // register 383: Alarm threshold digital input 2
      const appContent = { type: "0x1f digital input configuration" };
      const input1 = {};
      const input2 = {};
      input1.type = this.getTypeText(payload[2] & 0x0f);
      input1.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText((payload[2] & 0xf0) >> 4),
      };
      input1.threshold = payload.readUInt16BE(3);
      input2.type = this.getTypeText(payload[5] & 0x0f);
      input2.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText((payload[5] & 0xf0) >> 4),
      };
      input2.threshold = payload.readUInt16BE(6);
      appContent.digitalInput1 = input1;
      appContent.digitalInput2 = input2;
      return appContent;
    };
    /**
     * Get debounce duration text
     * @param value value
     */
    Generic0x1fParser.prototype.getDebouncingPeriodText = function (value) {
      switch (value) {
        case 0:
          return 0;
        case 1:
          return 10;
        case 2:
          return 20;
        case 3:
          return 500;
        case 4:
          return 100;
        case 5:
          return 200;
        case 6:
          return 500;
        case 7:
          return 1000;
        case 8:
          return 2000;
        case 9:
          return 5000;
        case 10:
          return 10000;
        case 11:
          return 20000;
        case 12:
          return 40000;
        case 13:
          return 60000;
        case 14:
          return 300000;
        case 15:
          return 600000;
        default:
          return 0;
      }
    };
    /**
     * Get type text
     * @param value value
     */
    Generic0x1fParser.prototype.getTypeText = function (value) {
      switch (value) {
        case 0x0:
          return "deactivated";
        case 0x1:
          return "highEdge";
        case 0x2:
          return "lowEdge";
        case 0x3:
          return "bothEdges";
        default:
          return "";
      }
    };
    return Generic0x1fParser;
  })();
  codec.Generic0x1fParser = Generic0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x20 (configuration) frame parser
   */
  const Generic0x20Parser = /** @class */ (function () {
    function Generic0x20Parser() {
      this.deviceType = "any";
      this.frameCode = 0x20;
    }
    Generic0x20Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
      deviceType,
    ) {
      const appContent = { type: "0x20 Configuration" };
      // Content depends on network
      switch (payload.byteLength) {
        case 4:
          appContent.loraAdr = Boolean(payload[2] & 0x01);
          appContent.loraProvisioningMode = payload[3] === 0 ? "ABP" : "OTAA";
          // TEMP3 , TEMP4 and PULSE3 use FW 2.0.0 . In that case byte 2 contains the entire S220 register
          if (
            deviceType !== "analog" &&
            deviceType !== "drycontacts" &&
            deviceType !== "pulse" &&
            deviceType !== "temp"
          ) {
            appContent.loraDutycyle =
              payload[2] & 0x04 ? "activated" : "deactivated";
            appContent.loraClassMode =
              payload[2] & 0x20 ? "CLASS C" : "CLASS A";
          }
          break;
        case 3:
        case 5:
          appContent.sigfoxRetry = payload[2] & 0x03;
          if (payload.byteLength === 5) {
            appContent.sigfoxDownlinkPeriod = {
              unit: "m",
              value: payload.readInt16BE(3),
            };
          }
          break;
        default:
          appContent.partialDecoding =
            codec.PartialDecodingReason.MISSING_NETWORK;
          break;
      }
      return appContent;
    };
    return Generic0x20Parser;
  })();
  codec.Generic0x20Parser = Generic0x20Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x2f (downlink ACK) frame parser
   */
  const Generic0x2fParser = /** @class */ (function () {
    function Generic0x2fParser() {
      this.deviceType = "drycontacts|drycontacts2|temp4";
      this.frameCode = 0x2f;
    }
    Generic0x2fParser.prototype.parseFrame = function (payload, configuration) {
      const appContent = { type: "0x2f Downlink ack" };
      appContent.downlinkFramecode = `0x${payload[2].toString(16)}`;
      appContent.requestStatus = this.getRequestStatusText(payload[3]);
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    Generic0x2fParser.prototype.getRequestStatusText = function (value) {
      switch (value) {
        case 1:
          return "success";
        case 2:
          return "errorGeneric";
        case 3:
          return "errorWrongState";
        case 4:
          return "errorInvalidRequest";
        default:
          return "errorOtherReason";
      }
    };
    return Generic0x2fParser;
  })();
  codec.Generic0x2fParser = Generic0x2fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x30 (keep alive) frame parser
   */
  const Generic0x30Parser = /** @class */ (function () {
    function Generic0x30Parser() {
      this.deviceType = "any";
      this.frameCode = 0x30;
    }
    Generic0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Keep alive" };
      return appContent;
    };
    return Generic0x30Parser;
  })();
  codec.Generic0x30Parser = Generic0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x33 (Response to Set Register downlink) frame parser
   */
  const Generic0x33Parser = /** @class */ (function () {
    function Generic0x33Parser() {
      this.deviceType =
        "drycontacts|drycontacts2|pulse3|pulse4|" +
        "temp3|temp4|comfort|comfort2|comfortCo2|motion|deltap|breath";
      this.frameCode = 0x33;
    }
    Generic0x33Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x33 Set register status" };
      appContent.requestStatus = this.getRequestStatusText(payload[2]);
      appContent.registerId = payload.readUInt16BE(3);
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    Generic0x33Parser.prototype.getRequestStatusText = function (value) {
      switch (value) {
        case 1:
          return "success";
        case 2:
          return "successNoUpdate";
        case 3:
          return "errorCoherency";
        case 4:
          return "errorInvalidRegister";
        case 5:
          return "errorInvalidValue";
        case 6:
          return "errorTruncatedValue";
        case 7:
          return "errorAccesNotAllowed";
        default:
          return "errorOtherReason";
      }
    };
    return Generic0x33Parser;
  })();
  codec.Generic0x33Parser = Generic0x33Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x36 alert message frame parser
   */
  const Generic0x36Parser = /** @class */ (function () {
    function Generic0x36Parser() {
      this.deviceType = "temp4";
      this.frameCode = 0x36;
    }
    Generic0x36Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x36 Alert message" };
      switch (payload[2]) {
        case 0x00:
          appContent.alertCode = "normalState";
          break;
        case 0x01:
          appContent.alertCode = "uplinkDownlinkForbidden";
          break;
        default:
          break;
      }
      return appContent;
    };
    return Generic0x36Parser;
  })();
  codec.Generic0x36Parser = Generic0x36Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x37 Software version' frame parser
   */
  const Generic0x37Parser = /** @class */ (function () {
    function Generic0x37Parser() {
      this.deviceType = "temp4|comfort2|comfortCo2|breath";
      this.frameCode = 0x37;
    }
    Generic0x37Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x37 Software version" };
      appContent.appVersion = `${payload.readUInt8(2)}.${payload.readUInt8(
        3,
      )}.${payload.readUInt8(4)}`;
      appContent.rtuVersion = `${payload.readUInt8(5)}.${payload.readUInt8(
        6,
      )}.${payload.readUInt8(7)}`;
      return appContent;
    };
    return Generic0x37Parser;
  })();
  codec.Generic0x37Parser = Generic0x37Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Smart digital input 1 alarm frame parser
   */
  const Generic0x51Parser = /** @class */ (function () {
    function Generic0x51Parser() {
      this.deviceType = "motion|comfort|comfort2|comfortCo2|deltap|breath";
      this.frameCode = 0x51;
    }
    Generic0x51Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x51 digital input 1 alarm" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value,
        // then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(9) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.state = {
        previousFrame: Boolean((payload.readUInt8(2) >> 1) & 1),
        current: Boolean((payload.readUInt8(2) >> 0) & 1),
      };
      appContent.counter = {
        global: payload.readUInt32BE(3),
        instantaneous: payload.readUInt16BE(7),
      };
      return appContent;
    };
    return Generic0x51Parser;
  })();
  codec.Generic0x51Parser = Generic0x51Parser;
})(codec || (codec = {}));
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (const p in s) {
            if (Object.prototype.hasOwnProperty.call(s, p)) {
              t[p] = s[p];
            }
          }
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var codec;
(function (codec) {
  /**
   * 0x52 digital input 2 alarm frame parser
   */
  const Generic0x52Parser = /** @class */ (function () {
    function Generic0x52Parser() {
      this.deviceType = "motion|comfort|comfort2|comfortCo2|deltap|breath";
      this.frameCode = 0x52;
      this.parser = new codec.Generic0x51Parser();
    }
    Generic0x52Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        ...this.parser.parseFrame(payload, configuration, network),
        type: "0x52 digital input 2 alarm",
      };
      return appContent;
    };
    return Generic0x52Parser;
  })();
  codec.Generic0x52Parser = Generic0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Extended status byte parser
   */
  const GenericStatusByteExtParser = /** @class */ (function () {
    function GenericStatusByteExtParser() {
      this.deviceType = "any";
      this.frameCode = 0;
    }
    GenericStatusByteExtParser.prototype.parseFrame = function (
      payload,
      configuration,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      return { status: statusContent };
    };
    return GenericStatusByteExtParser;
  })();
  codec.GenericStatusByteExtParser = GenericStatusByteExtParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic status byte parser
   */
  const GenericStatusByteParser = /** @class */ (function () {
    function GenericStatusByteParser() {
      this.deviceType = "any";
      this.frameCode = 0;
    }
    GenericStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
    ) {
      const statusContent = {};
      statusContent.frameCounter = (payload[1] & 0xe0) >> 5;
      // hardwareError not used anymore. Currently used for timestamp activation
      statusContent.hardwareError = false;
      statusContent.lowBattery = Boolean(payload[1] & 0x02);
      statusContent.configurationDone = Boolean(payload[1] & 0x01);
      return statusContent;
    };
    return GenericStatusByteParser;
  })();
  codec.GenericStatusByteParser = GenericStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x10 (configuration) frame parser
   */
  const Motion0x10Parser = /** @class */ (function () {
    function Motion0x10Parser() {
      this.deviceType = "motion";
      this.frameCode = 0x10;
    }
    Motion0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      // register 300: Emission period of the life frame X 10s
      // register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
      // register 320: value between 1 and 65535
      // register 321: value between 0 and 65535, 0: no scanning, X2s
      // register 322: presence inhibition period X 10s
      // reading_frequency = S321 * S320
      // sending_frequency = S321 * S320 * S301
      const appContent = { type: "0x10 Motion configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.presenceDetectorInhibition = {
          unit: "s",
          value: payload.readUInt16BE(10) * 10,
        }),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return Motion0x10Parser;
  })();
  codec.Motion0x10Parser = Motion0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x4e (historic data) frame parser
   */
  const Motion0x4eParser = /** @class */ (function () {
    function Motion0x4eParser() {
      this.deviceType = "motion";
      this.frameCode = 0x4e;
    }
    Motion0x4eParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4e Motion data" };
      const counters = [];
      const luminosities = [];
      appContent.globalCounterValue = payload.readUInt16BE(2);
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 4; offset < payload.byteLength; offset += 3) {
        counters.push(payload.readInt16BE(offset));
        luminosities.push(payload.readUInt8(offset + 2));
      }
      appContent.decodingInfo = "counterValues/values: [t=0, t-1, t-2, ...]";
      appContent.counterValues = counters;
      appContent.luminosity = { unit: "\u0025", values: luminosities };
      return appContent;
    };
    return Motion0x4eParser;
  })();
  codec.Motion0x4eParser = Motion0x4eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x4f (presence alarm) frame parser
   */
  const Motion0x4fParser = /** @class */ (function () {
    function Motion0x4fParser() {
      this.deviceType = "motion";
      this.frameCode = 0x4f;
    }
    Motion0x4fParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4f Motion presence alarm" };
      appContent.alarmPresence = {
        globalCounterValue: payload.readUInt16BE(2),
        counterValue: payload.readUInt16BE(4),
      };
      return appContent;
    };
    return Motion0x4fParser;
  })();
  codec.Motion0x4fParser = Motion0x4fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x50 (luminosity alarm) frame parser
   */
  const Motion0x50Parser = /** @class */ (function () {
    function Motion0x50Parser() {
      this.deviceType = "motion";
      this.frameCode = 0x50;
    }
    Motion0x50Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x50 Motion luminosity alarm" };
      appContent.alarmLuminosity = {
        alarmStatus: payload[2] ? "active" : "inactive",
        luminosity: { unit: "\u0025", value: payload[3] },
      };
      return appContent;
    };
    return Motion0x50Parser;
  })();
  codec.Motion0x50Parser = Motion0x50Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x5c (historic data) frame parser
   */
  const Motion0x5cParser = /** @class */ (function () {
    function Motion0x5cParser() {
      this.deviceType = "motion";
      this.frameCode = 0x5c;
    }
    Motion0x5cParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x5c Motion data" };
      const presences = [];
      const luminosities = [];
      appContent.presenceDetectedWhenSending = Boolean(payload[2]);
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 3; offset < payload.byteLength; offset += 2) {
        presences.push(payload[offset]);
        luminosities.push(payload[offset + 1]);
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      appContent.presence = { unit: "\u0025", values: presences };
      appContent.luminosity = { unit: "\u0025", values: luminosities };
      return appContent;
    };
    return Motion0x5cParser;
  })();
  codec.Motion0x5cParser = Motion0x5cParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Motion 0x4f (presence alarm) frame parser
   */
  const Motion0x5dParser = /** @class */ (function () {
    function Motion0x5dParser() {
      this.deviceType = "motion";
      this.frameCode = 0x5d;
    }
    Motion0x5dParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        type: "0x5d Motion presence alarm",
      };
      appContent.alarmPresence = {
        alarmStatus: payload[2] ? "active" : "inactive",
        luminosity: { unit: "\u0025", value: payload[3] },
      };
      return appContent;
    };
    return Motion0x5dParser;
  })();
  codec.Motion0x5dParser = Motion0x5dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x10 (configuration) frame parser
   */
  const Pulse0x10Parser = /** @class */ (function () {
    function Pulse0x10Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x10;
      this.pulse0x11Parser = new codec.Pulse0x11Parser();
      this.pulse0x12Parser = new codec.Pulse0x12Parser();
    }
    Pulse0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Pulse configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[2],
      );
      // Resolve known network
      const knownNetwork = this.inferNetwork(payload.byteLength);
      // Transmission period
      let offset = 0;
      if (payload[8] === 2) {
        // TEST mode => period = value * 20sec
        if (knownNetwork === "sigfox") {
          appContent.transmissionPeriod = { unit: "s", value: payload[3] * 20 };
          offset = -1; // value is on 1 byte for Sigfox, shift further payload reading
        } else {
          appContent.transmissionPeriod = {
            unit: "s",
            value: payload.readUInt16BE(3) * 20,
          };
        }
      } else {
        // PRODUCTION mode
        if (knownNetwork === "sigfox") {
          // Sigfox: period = value * 10min
          appContent.transmissionPeriod = { unit: "m", value: payload[3] * 10 };
          offset = -1; // value is on 1 byte for Sigfox, shift further payload reading
        } else {
          // LoRa 868: period = value * 1min
          appContent.transmissionPeriod = {
            unit: "m",
            value: payload.readUInt16BE(3),
          };
        }
      }
      // Flow calculation period
      if (payload[2] === 2) {
        // TEST mode => period = value * 20sec
        appContent.flowCalculationPeriod = {
          unit: "s",
          value: payload.readUInt16BE(offset + 8) * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 1min
        appContent.flowCalculationPeriod = {
          unit: "m",
          value: payload.readUInt16BE(offset + 8),
        };
      }
      // Historic mode
      appContent.historicMode = this.getHistoricModeText(payload[offset + 6]);
      // Channels A configuration
      chA.state = this.getStateText(Boolean(payload[offset + 5] & 0x01));
      chA.type = this.getTypeText(Boolean(payload[offset + 5] & 0x02));
      chA.tamperActivated = Boolean(payload[offset + 5] & 0x08);
      chA.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriod(payload[offset + 7] & 0x0f),
      };
      if (knownNetwork === "lora868") {
        chA.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(10),
          threshold: payload.readUInt16BE(14),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(18),
        };
      }
      // Channels B configuration
      chB.state = this.getStateText(Boolean(payload[offset + 5] & 0x10));
      chB.type = this.getTypeText(Boolean(payload[offset + 5] & 0x20));
      chB.tamperActivated = Boolean(payload[offset + 5] & 0x80);
      chB.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriod((payload[offset + 7] & 0xf0) >> 4),
      };
      if (knownNetwork === "lora868") {
        chB.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(12),
          threshold: payload.readUInt16BE(16),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(20),
        };
      }
      appContent.channels = [chA, chB];
      return appContent;
    };
    /**
     * Infer network
     * @param length frame length
     */
    Pulse0x10Parser.prototype.inferNetwork = function (length) {
      //            +--------------+
      //            | Frame length |
      // +----------+--------------+
      // | LoRa 868 |           22 |
      // | Sigfox   |            9 |
      // +----------+--------------+
      switch (length) {
        case 22:
          return "lora868";
        case 9:
          return "sigfox";
        default:
          return "unknown";
      }
    };
    /**
     * Get state text
     * @param value value
     */
    Pulse0x10Parser.prototype.getStateText = function (value) {
      return value ? "enabled" : "disabled";
    };
    /**
     * Get type text
     * @param value value
     */
    Pulse0x10Parser.prototype.getTypeText = function (value) {
      return value ? "gasPullUpOn" : "otherPullUpOff";
    };
    /**
     * Get historic mode text
     * @param value value
     */
    Pulse0x10Parser.prototype.getHistoricModeText = function (value) {
      switch (value) {
        case 0:
          return "noHistoric";
        case 1:
          return "historicLogEvery10min";
        case 2:
          return "historicLogEvery1h";
        default:
          return "";
      }
    };
    /**
     * Get debouncing period text
     * @param value value
     */
    Pulse0x10Parser.prototype.getDebouncingPeriod = function (value) {
      switch (value) {
        case 0:
          return 0;
        case 1:
          return 1;
        case 2:
          return 10;
        case 3:
          return 20;
        case 4:
          return 50;
        case 5:
          return 100;
        case 6:
          return 200;
        case 7:
          return 500;
        case 8:
          return 1000;
        case 9:
          return 2000;
        case 10:
          return 5000;
        case 11:
          return 10000;
        default:
          return 0;
      }
    };
    return Pulse0x10Parser;
  })();
  codec.Pulse0x10Parser = Pulse0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x11 (configuration) frame parser
   */
  const Pulse0x11Parser = /** @class */ (function () {
    function Pulse0x11Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x11;
    }
    Pulse0x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x11 Pulse configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(2),
        threshold: payload.readUInt16BE(6),
      };
      chB.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(4),
        threshold: payload.readUInt16BE(8),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return Pulse0x11Parser;
  })();
  codec.Pulse0x11Parser = Pulse0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x12 (configuration) frame parser
   */
  const Pulse0x12Parser = /** @class */ (function () {
    function Pulse0x12Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x12;
    }
    Pulse0x12Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x12 Pulse configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(2),
      };
      chB.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(4),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return Pulse0x12Parser;
  })();
  codec.Pulse0x12Parser = Pulse0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x30 (keep alive) frame parser
   */
  const Pulse0x30Parser = /** @class */ (function () {
    function Pulse0x30Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x30;
    }
    Pulse0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Pulse keep alive" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.flow = {
        alarm: Boolean(payload[2] & 0x01),
        last24hMin: payload.readUInt16BE(7),
        last24hMax: payload.readUInt16BE(3),
      };
      chA.tamperAlarm = Boolean(payload[2] & 0x04);
      chA.leakageAlarm = Boolean(payload[2] & 0x10);
      chB.flow = {
        alarm: Boolean(payload[2] & 0x02),
        last24hMin: payload.readUInt16BE(9),
        last24hMax: payload.readUInt16BE(5),
      };
      chB.tamperAlarm = Boolean(payload[2] & 0x08);
      chB.leakageAlarm = Boolean(payload[2] & 0x20);
      appContent.channels = [chA, chB];
      return appContent;
    };
    return Pulse0x30Parser;
  })();
  codec.Pulse0x30Parser = Pulse0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x46 (data) frame parser
   */
  const Pulse0x46Parser = /** @class */ (function () {
    function Pulse0x46Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x46;
    }
    Pulse0x46Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x46 Pulse data" };
      appContent.decodingInfo = "counterValues: [Channel A, Channel B]";
      // Current indexes [Channel A, Channel B]
      appContent.counterValues = [
        payload.readUInt32BE(2),
        payload.readUInt32BE(6),
      ];
      return appContent;
    };
    return Pulse0x46Parser;
  })();
  codec.Pulse0x46Parser = Pulse0x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x47 (alarm) frame parser
   */
  const Pulse0x47Parser = /** @class */ (function () {
    function Pulse0x47Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x47;
    }
    Pulse0x47Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x47 Pulse alarm" };
      appContent.decodingInfo = "flowValues: [Channel A, Channel B]";
      // Flows when overflow has occured [Channel A, Channel B]
      appContent.flowValues = [
        payload.readUInt16BE(2),
        payload.readUInt16BE(4),
      ];
      return appContent;
    };
    return Pulse0x47Parser;
  })();
  codec.Pulse0x47Parser = Pulse0x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x48 (historic data) frame parser
   */
  const Pulse0x48Parser = /** @class */ (function () {
    function Pulse0x48Parser() {
      this.deviceType = "pulse";
      this.frameCode = 0x48;
    }
    Pulse0x48Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x48 Pulse historic data" };
      const deltasA = [];
      const deltasB = [];
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      // Frame index
      const frameIndex = payload[2];
      appContent.frameIndex = frameIndex;
      if (frameIndex === 0) {
        // Index values
        chA.index = payload.readUInt32BE(3);
        chB.index = payload.readUInt32BE(7);
      }
      // Delta values
      const start = frameIndex === 0 ? 11 : 3;
      const base = this.getBase(frameIndex, payload.byteLength);
      for (let offset = start; offset < payload.byteLength; offset += 4) {
        deltasA.push(payload.readUInt16BE(offset));
        deltasB.push(payload.readUInt16BE(offset + 2));
      }
      if (deltasA.length > 0) {
        appContent.baseTime = base;
        appContent.decodingInfo = `deltaValues: [t=${base} to t=${
          base + 1
        }, t=${base + 1} to t=${base + 2}, ...]`;
        chA.deltaValues = deltasA;
        chB.deltaValues = deltasB;
      }
      appContent.channels = [chA, chB];
      return appContent;
    };
    /**
     * Based on frameIndex and payload length this routine determines the basetime (different in lora and SFX)
     * @param payload payload
     * @param configuration configuration
     */
    Pulse0x48Parser.prototype.getBase = function (frameIndex, byteLength) {
      if (byteLength === 31 || byteLength === 51) {
        return [1, 11][frameIndex];
      }
      if (
        (frameIndex === 2 && byteLength === 7) ||
        (frameIndex === 12 && byteLength === 7)
      ) {
        return 23;
      }
      if (frameIndex === 3 && byteLength === 7) {
        return 5;
      }
      if (byteLength === 11) {
        return [1, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23][frameIndex];
      }

      // Unknown
      return 0;
    };
    return Pulse0x48Parser;
  })();
  codec.Pulse0x48Parser = Pulse0x48Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse status byte parser
   */
  const PulseStatusByteParser = /** @class */ (function () {
    function PulseStatusByteParser() {
      this.deviceType = "pulse";
      this.frameCode = 0;
    }
    PulseStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      return { status: statusContent };
    };
    return PulseStatusByteParser;
  })();
  codec.PulseStatusByteParser = PulseStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 0x10 (configuration) frame parser
   */
  const PulseV30x10Parser = /** @class */ (function () {
    function PulseV30x10Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x10;
    }
    PulseV30x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Pulse 3 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[2],
      );
      // Resolve known network
      const knownNetwork = this.inferNetwork(payload.byteLength);
      // Transmission period
      appContent.numberOfHistorizationBeforeSending = payload.readUInt16BE(3);
      appContent.samplingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(6) * 2,
      };
      appContent.calculatedSendingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(3) * payload.readUInt16BE(6) * 2,
      };
      // Flow calculation period
      if (payload[2] === 2) {
        // TEST mode => period = value * 20sec
        appContent.flowCalculationPeriod = {
          unit: "s",
          value: payload.readUInt16BE(9) * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 1min
        appContent.flowCalculationPeriod = {
          unit: "m",
          value: payload.readUInt16BE(9),
        };
      }
      if (knownNetwork === "lora868") {
        appContent.redundantSamples = payload.readUInt8(27);
      }
      // Channels A configuration
      chA.state = this.getStateText(Boolean(payload[5] & 0x01));
      chA.type = this.getTypeText(Boolean(payload[5] & 0x02));
      chA.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText(payload[8] & 0x0f),
      };
      if (knownNetwork === "lora868") {
        chA.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(11),
          threshold: payload.readUInt16BE(15),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(19),
        };
        chA.tamper = {
          activated: Boolean(payload[5] & 0x08),
          samplePeriodForDetection: {
            unit: "s",
            value: payload.readUInt8(23) * 10,
          },
          threshold: payload.readUInt8(24),
        };
      } else if (knownNetwork === "sigfox") {
        chA.tamper = { activated: Boolean(payload[5] & 0x08) };
      }
      // Channel B configuration
      chB.state = this.getStateText(Boolean(payload[5] & 0x10));
      chB.type = this.getTypeText(Boolean(payload[5] & 0x20));
      chB.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText((payload[8] & 0xf0) >> 4),
      };
      if (knownNetwork === "lora868") {
        chB.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(13),
          threshold: payload.readUInt16BE(17),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(21),
        };
        chB.tamper = {
          activated: Boolean(payload[5] & 0x80),
          samplePeriodForDetection: {
            unit: "s",
            value: payload.readUInt8(25) * 10,
          },
          threshold: payload.readUInt8(26),
        };
      } else if (knownNetwork === "sigfox") {
        chB.tamper = { activated: Boolean(payload[5] & 0x80) };
      }
      appContent.channels = [chA, chB];
      return appContent;
    };
    /**
     * Infer network
     * @param length frame length
     */
    PulseV30x10Parser.prototype.inferNetwork = function (length) {
      //            +--------------+
      //            | Frame length |
      // +----------+--------------+
      // | LoRa 868 |           22 |
      // | Sigfox   |            9 |
      // +----------+--------------+
      switch (length) {
        case 28:
          return "lora868";
        case 11:
          return "sigfox";
        default:
          return "unknown";
      }
    };
    /**
     * Get state text
     * @param value value
     */
    PulseV30x10Parser.prototype.getStateText = function (value) {
      return value ? "enabled" : "disabled";
    };
    /**
     * Get type text
     * @param value value
     */
    PulseV30x10Parser.prototype.getTypeText = function (value) {
      return value ? "gasPullUpOn" : "otherPullUpOff";
    };
    /**
     * Get debouncing period text
     * @param value value
     */
    PulseV30x10Parser.prototype.getDebouncingPeriodText = function (value) {
      switch (value) {
        case 0:
          return 0;
        case 1:
          return 1;
        case 2:
          return 10;
        case 3:
          return 20;
        case 4:
          return 50;
        case 5:
          return 100;
        case 6:
          return 200;
        case 7:
          return 500;
        case 8:
          return 1000;
        case 9:
          return 2000;
        case 10:
          return 5000;
        case 11:
          return 10000;
        default:
          return 0;
      }
    };
    return PulseV30x10Parser;
  })();
  codec.PulseV30x10Parser = PulseV30x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x11 (configuration) frame parser
   */
  const PulseV30x11Parser = /** @class */ (function () {
    function PulseV30x11Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x11;
    }
    PulseV30x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x11 Pulse 3 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(2),
        threshold: payload.readUInt16BE(6),
      };
      chB.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(4),
        threshold: payload.readUInt16BE(8),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV30x11Parser;
  })();
  codec.PulseV30x11Parser = PulseV30x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 0x12 (configuration) frame parser
   */
  const PulseV30x12Parser = /** @class */ (function () {
    function PulseV30x12Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x12;
    }
    PulseV30x12Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x12 Pulse 3 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(2),
      };
      chA.tamper = {
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(6) * 10,
        },
        threshold: payload.readUInt8(7),
      };
      chB.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(4),
      };
      chB.tamper = {
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(8) * 10,
        },
        threshold: payload.readUInt8(9),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV30x12Parser;
  })();
  codec.PulseV30x12Parser = PulseV30x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 0x30 (keep alive) frame parser
   */
  const PulseV30x30Parser = /** @class */ (function () {
    function PulseV30x30Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x30;
    }
    PulseV30x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Pulse 3 keep alive" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.flow = {
        alarm: Boolean(payload[2] & 0x01),
        last24hMin: payload.readUInt16BE(7),
        last24hMax: payload.readUInt16BE(3),
      };
      chA.tamperAlarm = Boolean(payload[2] & 0x04);
      chA.leakageAlarm = Boolean(payload[2] & 0x10);
      chB.flow = {
        alarm: Boolean(payload[2] & 0x02),
        last24hMin: payload.readUInt16BE(9),
        last24hMax: payload.readUInt16BE(5),
      };
      chB.tamperAlarm = Boolean(payload[2] & 0x08);
      chB.leakageAlarm = Boolean(payload[2] & 0x20);
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV30x30Parser;
  })();
  codec.PulseV30x30Parser = PulseV30x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 0x46 (data) frame parser
   */
  const PulseV30x46Parser = /** @class */ (function () {
    function PulseV30x46Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x46;
    }
    PulseV30x46Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x46 Pulse 3 data" };
      appContent.decodingInfo = "counterValues: [Channel A, Channel B]";
      // Current indexes [Channel A, Channel B]
      appContent.counterValues = [
        payload.readUInt32BE(2),
        payload.readUInt32BE(6),
      ];
      return appContent;
    };
    return PulseV30x46Parser;
  })();
  codec.PulseV30x46Parser = PulseV30x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 0x47 (alarm) frame parser
   */
  const PulseV30x47Parser = /** @class */ (function () {
    function PulseV30x47Parser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x47;
    }
    PulseV30x47Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x47 Pulse 3 alarm" };
      appContent.decodingInfo = "flowValues: [Channel A, Channel B]";
      // Flows when overflow occured [Channel A, Channel B]
      appContent.flowValues = [
        payload.readUInt16BE(2),
        payload.readUInt16BE(4),
      ];
      return appContent;
    };
    return PulseV30x47Parser;
  })();
  codec.PulseV30x47Parser = PulseV30x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 periodic data  frame parser
   */
  const PulseV30x5aParser = /** @class */ (function () {
    function PulseV30x5aParser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x5a;
    }
    PulseV30x5aParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(2);
      const appContent = { type: "0x5a Pulse 3 data - channel A" };
      const values = [absCounterValue];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 6; offset < payload.byteLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV30x5aParser.prototype.getReadingFrequency = function (configuration) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV30x5aParser;
  })();
  codec.PulseV30x5aParser = PulseV30x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 3 periodic data frame parser
   */
  const PulseV30x5bParser = /** @class */ (function () {
    function PulseV30x5bParser() {
      this.deviceType = "pulse3";
      this.frameCode = 0x5b;
    }
    PulseV30x5bParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(2);
      const appContent = { type: "0x5b Pulse 3 data - channel B" };
      const values = [absCounterValue];
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 6; offset < payload.byteLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV30x5bParser.prototype.getReadingFrequency = function (configuration) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV30x5bParser;
  })();
  codec.PulseV30x5bParser = PulseV30x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x10 (configuration) frame parser
   */
  const PulseV40x10Parser = /** @class */ (function () {
    function PulseV40x10Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x10;
    }
    PulseV40x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Pulse 4 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[2],
      );
      // Resolve known network
      const knownNetwork = this.inferNetwork(payload.byteLength);
      // Transmission period
      appContent.numberOfHistorizationBeforeSending = payload.readUInt16BE(3);
      appContent.samplingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(6) * 2,
      };
      appContent.calculatedSendingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(3) * payload.readUInt16BE(6) * 2,
      };
      // Flow calculation period
      if (payload[2] === 2) {
        // TEST mode => period = value * 20sec
        appContent.flowCalculationPeriod = {
          unit: "s",
          value: payload.readUInt16BE(9) * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 1min
        appContent.flowCalculationPeriod = {
          unit: "m",
          value: payload.readUInt16BE(9),
        };
      }
      if (knownNetwork === "lora868") {
        appContent.redundantSamples = payload.readUInt8(27);
      }
      // Channels A configuration
      chA.state = this.getStateText(Boolean(payload[5] & 0x01));
      chA.type = this.getTypeText(Boolean(payload[5] & 0x02));
      chA.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText(payload[8] & 0x0f),
      };
      if (knownNetwork === "lora868") {
        chA.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(11),
          threshold: payload.readUInt16BE(15),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(19),
        };
        chA.tamper = {
          activated: Boolean(payload[5] & 0x08),
          samplePeriodForDetection: {
            unit: "s",
            value: payload.readUInt8(23) * 10,
          },
          threshold: payload.readUInt8(24),
        };
      } else if (knownNetwork === "sigfox") {
        chA.tamper = { activated: Boolean(payload[5] & 0x08) };
      }
      // Channel B configuration
      chB.state = this.getStateText(Boolean(payload[5] & 0x10));
      chB.type = this.getTypeText(Boolean(payload[5] & 0x20));
      chB.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText((payload[8] & 0xf0) >> 4),
      };
      if (knownNetwork === "lora868") {
        chB.leakageDetection = {
          overflowAlarmTriggerThreshold: payload.readUInt16BE(13),
          threshold: payload.readUInt16BE(17),
          dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(21),
        };
        chB.tamper = {
          activated: Boolean(payload[5] & 0x80),
          samplePeriodForDetection: {
            unit: "s",
            value: payload.readUInt8(25) * 10,
          },
          threshold: payload.readUInt8(26),
        };
      } else if (knownNetwork === "sigfox") {
        chB.tamper = { activated: Boolean(payload[5] & 0x80) };
      }
      appContent.channels = [chA, chB];
      return appContent;
    };
    /**
     * Infer network
     * @param length frame length
     */
    PulseV40x10Parser.prototype.inferNetwork = function (length) {
      //            +--------------+
      //            | Frame length |
      // +----------+--------------+
      // | LoRa 868 |           22 |
      // | Sigfox   |            9 |
      // +----------+--------------+
      switch (length) {
        case 28:
          return "lora868";
        case 11:
          return "sigfox";
        default:
          return "unknown";
      }
    };
    /**
     * Get state text
     * @param value value
     */
    PulseV40x10Parser.prototype.getStateText = function (value) {
      return value ? "enabled" : "disabled";
    };
    /**
     * Get type text
     * @param value value
     */
    PulseV40x10Parser.prototype.getTypeText = function (value) {
      return value ? "gasPullUpOn" : "otherPullUpOff";
    };
    /**
     * Get debouncing period text
     * @param value value
     */
    PulseV40x10Parser.prototype.getDebouncingPeriodText = function (value) {
      switch (value) {
        case 0:
          return 0;
        case 1:
          return 1;
        case 2:
          return 10;
        case 3:
          return 20;
        case 4:
          return 50;
        case 5:
          return 100;
        case 6:
          return 200;
        case 7:
          return 500;
        case 8:
          return 1000;
        case 9:
          return 2000;
        case 10:
          return 5000;
        case 11:
          return 10000;
        default:
          return 0;
      }
    };
    return PulseV40x10Parser;
  })();
  codec.PulseV40x10Parser = PulseV40x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 0x11 (configuration) frame parser
   */
  const PulseV40x11Parser = /** @class */ (function () {
    function PulseV40x11Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x11;
    }
    PulseV40x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x11 Pulse 4 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(2),
        threshold: payload.readUInt16BE(6),
      };
      chB.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(4),
        threshold: payload.readUInt16BE(8),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV40x11Parser;
  })();
  codec.PulseV40x11Parser = PulseV40x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x12 (configuration) frame parser
   */
  const PulseV40x12Parser = /** @class */ (function () {
    function PulseV40x12Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x12;
    }
    PulseV40x12Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x12 Pulse 4 configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(2),
      };
      chA.tamper = {
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(6) * 10,
        },
        threshold: payload.readUInt8(7),
      };
      chB.leakageDetection = {
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(4),
      };
      chB.tamper = {
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(8) * 10,
        },
        threshold: payload.readUInt8(9),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV40x12Parser;
  })();
  codec.PulseV40x12Parser = PulseV40x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x30 (keep alive) frame parser
   */
  const PulseV40x30Parser = /** @class */ (function () {
    function PulseV40x30Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x30;
    }
    PulseV40x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Pulse 4 keep alive" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.flow = {
        alarm: Boolean(payload[2] & 0x01),
        last24hMin: payload.readUInt16BE(7),
        last24hMax: payload.readUInt16BE(3),
      };
      chA.tamperAlarm = Boolean(payload[2] & 0x04);
      chA.leakageAlarm = Boolean(payload[2] & 0x10);
      chB.flow = {
        alarm: Boolean(payload[2] & 0x02),
        last24hMin: payload.readUInt16BE(9),
        last24hMax: payload.readUInt16BE(5),
      };
      chB.tamperAlarm = Boolean(payload[2] & 0x08);
      chB.leakageAlarm = Boolean(payload[2] & 0x20);
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV40x30Parser;
  })();
  codec.PulseV40x30Parser = PulseV40x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x46 (data) frame parser
   */
  const PulseV40x46Parser = /** @class */ (function () {
    function PulseV40x46Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x46;
    }
    PulseV40x46Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x46 Pulse 4 data" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(10) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "counterValues: [Channel A, Channel B]";
      // Current indexes [Channel A, Channel B]
      appContent.counterValues = [
        payload.readUInt32BE(2),
        payload.readUInt32BE(6),
      ];
      return appContent;
    };
    return PulseV40x46Parser;
  })();
  codec.PulseV40x46Parser = PulseV40x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x47 (alarm) frame parser
   */
  const PulseV40x47Parser = /** @class */ (function () {
    function PulseV40x47Parser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x47;
    }
    PulseV40x47Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x47 Pulse 4 alarm" };
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date((payload.readUInt32BE(6) + 1356998400) * 1000);
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "flowValues: [Channel A, Channel B]";
      // Flows when overflow occured [Channel A, Channel B]
      appContent.flowValues = [
        payload.readUInt16BE(2),
        payload.readUInt16BE(4),
      ];
      return appContent;
    };
    return PulseV40x47Parser;
  })();
  codec.PulseV40x47Parser = PulseV40x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 periodic data  frame parser
   */
  const PulseV40x5aParser = /** @class */ (function () {
    function PulseV40x5aParser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x5a;
    }
    PulseV40x5aParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(2);
      const appContent = { type: "0x5a Pulse 4 data - channel A" };
      const values = [absCounterValue];
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.byteLength - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 6; offset < payloadLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV40x5aParser.prototype.getReadingFrequency = function (configuration) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV40x5aParser;
  })();
  codec.PulseV40x5aParser = PulseV40x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 periodic data frame parser
   */
  const PulseV40x5bParser = /** @class */ (function () {
    function PulseV40x5bParser() {
      this.deviceType = "pulse4";
      this.frameCode = 0x5b;
    }
    PulseV40x5bParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(2);
      const appContent = { type: "0x5b Pulse 4 data - channel B" };
      const values = [absCounterValue];
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.byteLength - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = 6; offset < payloadLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV40x5bParser.prototype.getReadingFrequency = function (configuration) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV40x5bParser;
  })();
  codec.PulseV40x5bParser = PulseV40x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse V4 status byte parser
   */
  const PulseV4StatusByteParser = /** @class */ (function () {
    function PulseV4StatusByteParser() {
      this.deviceType = "pulse4";
      this.frameCode = 0;
    }
    PulseV4StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.timestamp = Boolean(payload[1] & 0x04);
      return { status: statusContent };
    };
    return PulseV4StatusByteParser;
  })();
  codec.PulseV4StatusByteParser = PulseV4StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x10 (configuration) frame parser
   */
  const PulseV4NbIot0x10Parser = /** @class */ (function () {
    function PulseV4NbIot0x10Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x10;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Pulse 4 NB-IoT configuration" };
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[this.hOffset + 2],
      );
      // Transmission period
      appContent.numberOfHistorizationBeforeSending = payload.readUInt16BE(
        this.hOffset + 3,
      );
      appContent.samplingPeriod = {
        unit: "s",
        value: payload.readUInt16BE(this.hOffset + 6) * 2,
      };
      appContent.calculatedSendingPeriod = {
        unit: "s",
        value:
          payload.readUInt16BE(this.hOffset + 3) *
          payload.readUInt16BE(this.hOffset + 6) *
          2,
      };
      // Flow calculation period
      if (payload[this.hOffset + 2] === 2) {
        // TEST mode => period = value * 20sec
        appContent.flowCalculationPeriod = {
          unit: "s",
          value: payload.readUInt16BE(this.hOffset + 9) * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 1min
        appContent.flowCalculationPeriod = {
          unit: "m",
          value: payload.readUInt16BE(this.hOffset + 9),
        };
      }
      appContent.redundantSamples = payload.readUInt8(this.hOffset + 27);
      // Channels A configuration
      chA.state = this.getStateText(Boolean(payload[this.hOffset + 5] & 0x01));
      chA.type = this.getTypeText(Boolean(payload[this.hOffset + 5] & 0x02));
      chA.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText(payload[this.hOffset + 8] & 0x0f),
      };
      chA.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(this.hOffset + 11),
        threshold: payload.readUInt16BE(this.hOffset + 15),
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(
          this.hOffset + 19,
        ),
      };
      chA.tamper = {
        activated: Boolean(payload[this.hOffset + 5] & 0x08),
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(this.hOffset + 23) * 10,
        },
        threshold: payload.readUInt8(this.hOffset + 24),
      };
      // Channel B configuration
      chB.state = this.getStateText(Boolean(payload[this.hOffset + 5] & 0x10));
      chB.type = this.getTypeText(Boolean(payload[this.hOffset + 5] & 0x20));
      chB.debouncingPeriod = {
        unit: "ms",
        value: this.getDebouncingPeriodText(
          (payload[this.hOffset + 8] & 0xf0) >> 4,
        ),
      };
      chB.leakageDetection = {
        overflowAlarmTriggerThreshold: payload.readUInt16BE(this.hOffset + 13),
        threshold: payload.readUInt16BE(this.hOffset + 17),
        dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(
          this.hOffset + 21,
        ),
      };
      chB.tamper = {
        activated: Boolean(payload[this.hOffset + 5] & 0x80),
        samplePeriodForDetection: {
          unit: "s",
          value: payload.readUInt8(this.hOffset + 25) * 10,
        },
        threshold: payload.readUInt8(this.hOffset + 26),
      };
      appContent.channels = [chA, chB];
      return appContent;
    };
    /**
     * Get state text
     * @param value value
     */
    PulseV4NbIot0x10Parser.prototype.getStateText = function (value) {
      return value ? "enabled" : "disabled";
    };
    /**
     * Get type text
     * @param value value
     */
    PulseV4NbIot0x10Parser.prototype.getTypeText = function (value) {
      return value ? "gasPullUpOn" : "otherPullUpOff";
    };
    /**
     * Get debouncing period text
     * @param value value
     */
    PulseV4NbIot0x10Parser.prototype.getDebouncingPeriodText = function (
      value,
    ) {
      switch (value) {
        case 0:
          return 0;
        case 1:
          return 1;
        case 2:
          return 10;
        case 3:
          return 20;
        case 4:
          return 50;
        case 5:
          return 100;
        case 6:
          return 200;
        case 7:
          return 500;
        case 8:
          return 1000;
        case 9:
          return 2000;
        case 10:
          return 5000;
        case 11:
          return 10000;
        default:
          return 0;
      }
    };
    return PulseV4NbIot0x10Parser;
  })();
  codec.PulseV4NbIot0x10Parser = PulseV4NbIot0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x20 (configuration) frame parser
   */
  const PulseV4NbIot0x20Parser = /** @class */ (function () {
    function PulseV4NbIot0x20Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x20;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x20Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x20 Pulse 4 NB-IoT Configuration" };
      appContent.remoteServerIpAddress = this.payloadToString(
        payload,
        this.hOffset + 2,
        this.hOffset + 2 + 30,
      );
      appContent.remoteServerPort = payload.readUInt16BE(this.hOffset + 33);
      appContent.localPort = payload.readUInt16BE(this.hOffset + 35);
      appContent.apn = this.payloadToString(
        payload,
        this.hOffset + 37,
        this.hOffset + 37 + 30,
      );
      return appContent;
    };
    PulseV4NbIot0x20Parser.prototype.payloadToString = function (
      payload,
      start,
      end,
    ) {
      const charCode = [];
      for (let i = start; i < end; i++) {
        if (payload[i] !== 0x00) {
          charCode.push(payload[i]);
        }
      }
      return String.fromCharCode.apply(String, charCode);
    };
    return PulseV4NbIot0x20Parser;
  })();
  codec.PulseV4NbIot0x20Parser = PulseV4NbIot0x20Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x30 (keep alive) frame parser
   */
  const PulseV4NbIot0x30Parser = /** @class */ (function () {
    function PulseV4NbIot0x30Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x30;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Pulse 4 NB-IoT keep alive" };
      if (payload[this.hOffset + 1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(this.hOffset + 11) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      const chA = { name: "channel A" };
      const chB = { name: "channel B" };
      chA.flow = {
        alarm: Boolean(payload[this.hOffset + 2] & 0x01),
        last24hMin: payload.readUInt16BE(this.hOffset + 7),
        last24hMax: payload.readUInt16BE(this.hOffset + 3),
      };
      chA.tamperAlarm = Boolean(payload[this.hOffset + 2] & 0x04);
      chA.leakageAlarm = Boolean(payload[this.hOffset + 2] & 0x10);
      chB.flow = {
        alarm: Boolean(payload[this.hOffset + 2] & 0x02),
        last24hMin: payload.readUInt16BE(this.hOffset + 9),
        last24hMax: payload.readUInt16BE(this.hOffset + 5),
      };
      chB.tamperAlarm = Boolean(payload[this.hOffset + 2] & 0x08);
      chB.leakageAlarm = Boolean(payload[this.hOffset + 2] & 0x20);
      appContent.channels = [chA, chB];
      return appContent;
    };
    return PulseV4NbIot0x30Parser;
  })();
  codec.PulseV4NbIot0x30Parser = PulseV4NbIot0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Generic 0x33 (Response to Set Register downlink) frame parser
   */
  const PulseV4NbIot0x33Parser = /** @class */ (function () {
    function PulseV4NbIot0x33Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x33;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x33Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x33 Set register status" };
      appContent.requestStatus = this.getRequestStatusText(
        payload[this.hOffset + 2],
      );
      appContent.registerId = payload.readUInt16BE(this.hOffset + 3);
      return appContent;
    };
    /**
     * Get Type text
     * @param value value
     */
    PulseV4NbIot0x33Parser.prototype.getRequestStatusText = function (value) {
      switch (value) {
        case 1:
          return "success";
        case 2:
          return "successNoUpdate";
        case 3:
          return "errorCoherency";
        case 4:
          return "errorInvalidRegister";
        case 5:
          return "errorInvalidValue";
        case 6:
          return "errorTruncatedValue";
        case 7:
          return "errorAccesNotAllowed";
        default:
          return "errorOtherReason";
      }
    };
    return PulseV4NbIot0x33Parser;
  })();
  codec.PulseV4NbIot0x33Parser = PulseV4NbIot0x33Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x46 (data) frame parser
   */
  const PulseV4NbIot0x46Parser = /** @class */ (function () {
    function PulseV4NbIot0x46Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x46;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x46Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x46 Pulse 4 NB-IoT data" };
      if (payload[this.hOffset + 1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(this.hOffset + 10) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "counterValues: [Channel A, Channel B]";
      // Current indexes [Channel A, Channel B]
      appContent.counterValues = [
        payload.readUInt32BE(this.hOffset + 2),
        payload.readUInt32BE(this.hOffset + 6),
      ];
      return appContent;
    };
    return PulseV4NbIot0x46Parser;
  })();
  codec.PulseV4NbIot0x46Parser = PulseV4NbIot0x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 0x47 (alarm) frame parser
   */
  const PulseV4NbIot0x47Parser = /** @class */ (function () {
    function PulseV4NbIot0x47Parser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x47;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x47Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x47 Pulse 4 NB-IoT alarm" };
      if (payload[this.hOffset + 1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(this.hOffset + 6) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "flowValues: [Channel A, Channel B]";
      // Flows when overflow occured [Channel A, Channel B]
      appContent.flowValues = [
        payload.readUInt16BE(this.hOffset + 2),
        payload.readUInt16BE(this.hOffset + 4),
      ];
      return appContent;
    };
    return PulseV4NbIot0x47Parser;
  })();
  codec.PulseV4NbIot0x47Parser = PulseV4NbIot0x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 periodic data  frame parser
   */
  const PulseV4NbIot0x5aParser = /** @class */ (function () {
    function PulseV4NbIot0x5aParser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x5a;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x5aParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(this.hOffset + 2);
      const appContent = { type: "0x5a Pulse 4 NB-IoT data - channel A" };
      const values = [absCounterValue];
      const payloadLength =
        payload[this.hOffset + 1] & 0x04
          ? payload.byteLength - 4
          : payload.byteLength;
      if (payload[this.hOffset + 1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.byteLength - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = this.hOffset + 6; offset < payloadLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV4NbIot0x5aParser.prototype.getReadingFrequency = function (
      configuration,
    ) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV4NbIot0x5aParser;
  })();
  codec.PulseV4NbIot0x5aParser = PulseV4NbIot0x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse 4 periodic data frame parser
   */
  const PulseV4NbIot0x5bParser = /** @class */ (function () {
    function PulseV4NbIot0x5bParser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0x5b;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIot0x5bParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let absCounterValue = payload.readUInt32BE(this.hOffset + 2);
      const appContent = { type: "0x5b Pulse 4 NB-IoT data - channel B" };
      const values = [absCounterValue];
      const payloadLength =
        payload[this.hOffset + 1] & 0x04
          ? payload.byteLength - 4
          : payload.byteLength;
      if (payload[this.hOffset + 1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.byteLength - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      // Loop through historic data [t=0, t-1, t-2,...]
      for (let offset = this.hOffset + 6; offset < payloadLength; offset += 2) {
        absCounterValue -= payload.readUInt16BE(offset);
        values.push(absCounterValue);
      }
      appContent.decodingInfo = "counterValues: [t=0, t-1, t-2, ...]";
      appContent.counterValues = values;
      return appContent;
    };
    /**
     * Get reading frequency
     * @param configuration configuration
     */
    PulseV4NbIot0x5bParser.prototype.getReadingFrequency = function (
      configuration,
    ) {
      return configuration.byteLength > 0
        ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2
        : null;
    };
    return PulseV4NbIot0x5bParser;
  })();
  codec.PulseV4NbIot0x5bParser = PulseV4NbIot0x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Pulse V4 status byte parser
   */
  const PulseV4NbIotStatusByteParser = /** @class */ (function () {
    function PulseV4NbIotStatusByteParser() {
      this.deviceType = "pulse4nbiot";
      this.frameCode = 0;
      // Offset to add in order to jump NB-Iot additional header
      this.hOffset = 13;
    }
    PulseV4NbIotStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const headerContent = {};
      const statusContent = {};
      // Include in status byte parser also NB-IoT header (13 bytes length):
      // 0-7	IMEI	International Mobile Equipment Identity (IMEI) of the product (15 digits in BCD format).
      // 8	Radio Signal quality	Value from 0 to 5.
      // 9-12	Frame counter	Frame counter since product reset.
      headerContent.imei = payload.slice(0, 8).toString("hex");
      headerContent.signalQuality = payload[8];
      headerContent.globalFrameCounter = payload.readUInt32BE(9);
      // Status byte, applicative flags
      statusContent.frameCounter = (payload[this.hOffset + 1] & 0xe0) >> 5;
      statusContent.lowBattery = Boolean(payload[this.hOffset + 1] & 0x02);
      statusContent.configurationDone = Boolean(
        payload[this.hOffset + 1] & 0x01,
      );
      statusContent.timestamp = Boolean(payload[this.hOffset + 1] & 0x04);
      return { nbIot: headerContent, status: statusContent };
    };
    return PulseV4NbIotStatusByteParser;
  })();
  codec.PulseV4NbIotStatusByteParser = PulseV4NbIotStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const Repeater0x01InputData = /** @class */ (function () {
    function Repeater0x01InputData() {
      // Accepted values are:
      // 0 retour en mode PARK
      // 1 retour en mode installation auto
      // 2 retour en mode opération, WL vide, rafraichissement de la WL à chaque trame OoB
      this.return_mode = 0;
    }
    return Repeater0x01InputData;
  })();
  codec.Repeater0x01InputData = Repeater0x01InputData;
  /**
   * Repeater 0x01 frame builder
   */
  const Repeater0x01Builder = /** @class */ (function () {
    function Repeater0x01Builder() {
      this.deviceType = "repeater";
      this.frameCode = 0x01;
      this.inputDataClass = Repeater0x01InputData;
    }
    Repeater0x01Builder.prototype.buildFrame = function (inputData, network) {
      const payload = Buffer.alloc(8);
      payload[0] = this.frameCode;
      payload.writeUInt8(inputData.return_mode, 1);
      return payload;
    };
    return Repeater0x01Builder;
  })();
  codec.Repeater0x01Builder = Repeater0x01Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Repeater 0x01 frame parser
   */
  const Repeater0x01Parser = /** @class */ (function () {
    function Repeater0x01Parser() {
      this.deviceType = "repeater";
      this.frameCode = 0x01;
    }
    Repeater0x01Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        type: "0x01 Repeater WL add",
        ...this.getDataFromPayload(payload),
      };
      return appContent;
    };
    Repeater0x01Parser.prototype.getDataFromPayload = function (payload) {
      const appContent = {};
      codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
      return appContent;
    };
    return Repeater0x01Parser;
  })();
  codec.Repeater0x01Parser = Repeater0x01Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const Repeater0x02InputData = /** @class */ (function () {
    function Repeater0x02InputData() {
      // wl_activation accepted values are 0x00 or 0x01
      this.wl_activation = 0x00;
      this.id = 0;
    }
    return Repeater0x02InputData;
  })();
  codec.Repeater0x02InputData = Repeater0x02InputData;
  /**
   * Repeater 0x02 frame builder
   */
  const Repeater0x02Builder = /** @class */ (function () {
    function Repeater0x02Builder() {
      this.deviceType = "repeater";
      this.frameCode = 0x02;
      this.inputDataClass = Repeater0x02InputData;
    }
    Repeater0x02Builder.prototype.buildFrame = function (inputData, network) {
      const payload = Buffer.alloc(8);
      payload[0] = this.frameCode;
      payload.writeUInt8(inputData.wl_activation, 1);
      payload.writeUInt32BE(inputData.id, 1);
      return payload;
    };
    return Repeater0x02Builder;
  })();
  codec.Repeater0x02Builder = Repeater0x02Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Repeater 0x02 frame parser
   */
  const Repeater0x02Parser = /** @class */ (function () {
    function Repeater0x02Parser() {
      this.deviceType = "repeater";
      this.frameCode = 0x02;
    }
    Repeater0x02Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        type: "0x02 Repeater WL modification",
        ...this.getDataFromPayload(payload),
      };
      return appContent;
    };
    Repeater0x02Parser.prototype.getDataFromPayload = function (payload) {
      const appContent = {};
      codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
      appContent.numberOfIdInWl = payload.readUInt8(2);
      return appContent;
    };
    return Repeater0x02Parser;
  })();
  codec.Repeater0x02Parser = Repeater0x02Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const Repeater0x03InputData = /** @class */ (function () {
    function Repeater0x03InputData() {
      // wl_validation accepted values are 0x00 or 0x01
      this.wl_validation = 0x00;
      this.id = 0;
    }
    return Repeater0x03InputData;
  })();
  codec.Repeater0x03InputData = Repeater0x03InputData;
  /**
   * Repeater 0x03 frame builder
   */
  const Repeater0x03Builder = /** @class */ (function () {
    function Repeater0x03Builder() {
      this.deviceType = "repeater";
      this.frameCode = 0x03;
      this.inputDataClass = Repeater0x03InputData;
    }
    Repeater0x03Builder.prototype.buildFrame = function (inputData, network) {
      const payload = Buffer.alloc(8);
      payload[0] = this.frameCode;
      payload.writeUInt8(inputData.wl_validation, 1);
      payload.writeUInt32BE(inputData.id, 2);
      return payload;
    };
    return Repeater0x03Builder;
  })();
  codec.Repeater0x03Builder = Repeater0x03Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Repeater 0x02 frame parser
   */
  const Repeater0x03Parser = /** @class */ (function () {
    function Repeater0x03Parser() {
      this.deviceType = "repeater";
      this.frameCode = 0x03;
    }
    Repeater0x03Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        type: "0x03 Repeater DL confirmation",
        ...this.getDataFromPayload(payload),
      };
      return appContent;
    };
    Repeater0x03Parser.prototype.getDataFromPayload = function (payload) {
      const appContent = {};
      codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
      appContent.downlinkCode =
        codec.RepeaterHelper.getDownlinkDescriptionForCode(
          payload.readUInt8(2),
        );
      appContent.downlinkErrorCode =
        codec.RepeaterHelper.getErrorDescriptionForCode(payload.readUInt8(3));
      return appContent;
    };
    return Repeater0x03Parser;
  })();
  codec.Repeater0x03Parser = Repeater0x03Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const Repeater0x04InputData = /** @class */ (function () {
    function Repeater0x04InputData() {
      this.S300 = 1; // 01- 31
      this.S303 = 0; // 00 ou 02
      this.S304 = 0; // 00/01/02
      this.S306 = 0; // 00 ou 02
    }
    return Repeater0x04InputData;
  })();
  codec.Repeater0x04InputData = Repeater0x04InputData;
  /**
   * Repeater 0x04 frame builder
   */
  const Repeater0x04Builder = /** @class */ (function () {
    function Repeater0x04Builder() {
      this.deviceType = "repeater";
      this.frameCode = 0x04;
      this.inputDataClass = Repeater0x04InputData;
    }
    Repeater0x04Builder.prototype.buildFrame = function (inputData, network) {
      const payload = Buffer.alloc(8);
      payload[0] = this.frameCode;
      payload.writeUInt8(inputData.S300, 1);
      payload.writeUInt8(inputData.S303, 2);
      payload.writeUInt8(inputData.S304, 3);
      payload.writeUInt8(inputData.S306, 4);
      return payload;
    };
    Repeater0x04Builder.prototype.getFirstIds = function (ids) {
      return ids.filter((id) => id >= 8);
    };
    Repeater0x04Builder.prototype.getLastIds = function (ids) {
      return ids.filter((id) => id < 8);
    };
    Repeater0x04Builder.prototype.getByteFromIdsList = function (ids) {
      const intArray = Buffer.alloc(8);
      ids.forEach((id, idx) => (intArray[idx] = id));
      return intArray.readUInt8(0);
    };
    return Repeater0x04Builder;
  })();
  codec.Repeater0x04Builder = Repeater0x04Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Repeater 0x04 frame parser
   */
  const Repeater0x04Parser = /** @class */ (function () {
    function Repeater0x04Parser() {
      this.deviceType = "repeater";
      this.frameCode = 0x04;
    }
    Repeater0x04Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = {
        type: "0x04 White List confirmation",
        ...this.getDataFromPayload(payload),
      };
      return appContent;
    };
    Repeater0x04Parser.prototype.getDataFromPayload = function (payload) {
      const appContent = {};
      codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
      appContent.numberOfIdInWl = payload.readUInt8(2);
      return appContent;
    };
    return Repeater0x04Parser;
  })();
  codec.Repeater0x04Parser = Repeater0x04Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const Repeater0x05InputData = /** @class */ (function () {
    function Repeater0x05InputData() {}
    return Repeater0x05InputData;
  })();
  codec.Repeater0x05InputData = Repeater0x05InputData;
  /**
   * Repeater 0x05 frame builder
   */
  const Repeater0x05Builder = /** @class */ (function () {
    function Repeater0x05Builder() {
      this.deviceType = "repeater";
      this.frameCode = 0x05;
      this.inputDataClass = Repeater0x05InputData;
    }
    Repeater0x05Builder.prototype.buildFrame = function (inputData, network) {
      const payload = Buffer.alloc(8);
      payload[0] = this.frameCode;
      return payload;
    };
    return Repeater0x05Builder;
  })();
  codec.Repeater0x05Builder = Repeater0x05Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const errorCode = {
    0x00: "0x00 The action has been correctly realized",
    0x0a: "0x0A Uplink code is invalid",
    0x0b: "0x0B Harware error, please contact adeunis support",
    0x0c: "0x0C Callback error",
    0x0d: "0x0D Generic error",
    0x01: "0x01 White List already empty",
    0x02: "0x02 White List not erased",
    0x03: "0x03 White List is empty, repeater switch into OPERATION with “auto-record” mode",
    0x04: "0x04 ID not found in the White List",
    0x05: "0x05 White List is full, “add an ID” not possible",
    0x06: "0x06 ID already existing in the White List",
    0x07: "0x07 No ID repeated, repeater stay into OPERATION with “auto-record” mode",
    0x08: "0x08 A White List is already existing, use “Suppress all IDs from White List” frame before",
    0x11: "0x11 Error with S300 configuration",
    0x12: "0x12 Error with S303 configuration",
    0x13: "0x13 Error with S300, S303 configuration",
    0x14: "0x14 Error with S304 configuration",
    0x15: "0x15 Error with S300, S304 configuration",
    0x16: "0x16 Error with S303, S304 configuration",
    0x17: "0x17 Error with S300, S303, S304 configuration",
    0x18: "0x18 Error with S306 configuration",
    0x19: "0x19 Error with S300, S306 configuration",
    0x1a: "0x1A Error with S303, S306 configuration",
    0x1b: "0x1B Error with S300, S303, S306 configuration",
    0x1c: "0x1C Error with S304, S306 configuration",
    0x1d: "0x1D Error with S300, S304, S306 configuration",
    0x1e: "0x1E Error with S303, S304, S306 configuration",
    0x1f: "0x1F Error with S300, S303, S304, S306 configuration",
  };
  const dlCode = {
    0x01: "0x01 Suppress all IDs from White List",
    0x02: "0x02 Delete an ID from White List",
    0x03: "0x03 Add an ID into White List",
    0x05: "0x05 Freeze the list of devices repeated in auto-record mode into the White List",
    0x04: "0x04 Modify Repeater configuration",
  };
  const RepeaterHelper = /** @class */ (function () {
    function RepeaterHelper() {}
    RepeaterHelper.hex2bin = function (hex) {
      return parseInt(hex, 16).toString(2).padStart(8, "0");
    };
    RepeaterHelper.getUPStatusFromPayload = function (payload, appContent) {
      const byte = payload[1];
      let charLb = 1;
      if (/^\d$/.test(`${byte}`)) {
        // one digit
        appContent.frameCounter = 0;
        charLb = 0;
      } else {
        appContent.frameCounter = parseInt(
          payload.readUInt8(1).toString(16).charAt(0),
          16,
        );
      }
      const hexLb = payload.readUInt8(1).toString(16);
      const binLb = RepeaterHelper.hex2bin(hexLb);
      const bitLb = binLb[binLb.length - 1];
      appContent.lowBattery = bitLb === 1;
      return appContent;
    };
    RepeaterHelper.getDownlinkDescriptionForCode = function (code) {
      return dlCode[code] || code;
    };
    RepeaterHelper.getErrorDescriptionForCode = function (code) {
      return errorCode[code] || code;
    };
    return RepeaterHelper;
  })();
  codec.RepeaterHelper = RepeaterHelper;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Extended status byte parser
   */
  const RepeaterStatusByteParser = /** @class */ (function () {
    function RepeaterStatusByteParser() {
      this.deviceType = "repeater";
      this.frameCode = 0;
    }
    RepeaterStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
    ) {
      // Skip generic status byte parser
      return {};
    };
    return RepeaterStatusByteParser;
  })();
  codec.RepeaterStatusByteParser = RepeaterStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature 0x10 (configuration) frame parser
   */
  const Temp0x10Parser = /** @class */ (function () {
    function Temp0x10Parser() {
      this.deviceType = "temp";
      this.frameCode = 0x10;
    }
    Temp0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Temperature configuration" };
      const temp1 = { name: "probe 1" };
      const temp2 = { name: "probe 2" };
      if (payload[8] === 2) {
        // TEST mode => period = value * 20sec
        appContent.transmissionPeriodKeepAlive = {
          unit: "s",
          value: payload[2] * 20,
        };
        appContent.transmissionPeriodData = {
          unit: "s",
          value: payload[3] * 20,
        };
        appContent.samplingPeriod = { unit: "s", value: payload[10] * 10 };
      } else {
        // PRODUCTION mode => period = value * 10min
        appContent.transmissionPeriodKeepAlive = {
          unit: "m",
          value: payload[2] * 10,
        };
        appContent.transmissionPeriodData = {
          unit: "m",
          value: payload[3] * 10,
        };
        appContent.samplingPeriod = { unit: "m", value: payload[10] };
      }
      // Internal sensor input states
      temp1.id = (payload[4] & 0xf0) >> 4;
      temp1.threshold = this.getThresholdTriggeringText(payload[5] & 0x03);
      // Concerns only FW >= 1.3.8
      temp1.state = payload[9] & 0x01 ? "activated" : "deactivated";
      // External sensor input states
      temp2.id = (payload[6] & 0xf0) >> 4;
      temp2.threshold = this.getThresholdTriggeringText(payload[7] & 0x03);
      // Concerns only FW >= 1.3.8
      temp2.state = payload[9] & 0x02 ? "activated" : "deactivated";
      appContent.probes = [temp1, temp2];
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[8],
      );
      return appContent;
    };
    /**
     * Get Threshold Triggering text
     * @param value value
     */
    Temp0x10Parser.prototype.getThresholdTriggeringText = function (value) {
      switch (value) {
        case 0:
          return "none";
        case 1:
          return "low";
        case 2:
          return "high";
        case 3:
          return "both";
        default:
          return "";
      }
    };
    return Temp0x10Parser;
  })();
  codec.Temp0x10Parser = Temp0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature 0x11 (configuration) frame parser
   */
  const Temp0x11Parser = /** @class */ (function () {
    function Temp0x11Parser() {
      this.deviceType = "temp";
      this.frameCode = 0x11;
    }
    Temp0x11Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x11 Temperature configuration" };
      // Internal sensor high threshold configuration
      appContent.threshold = {
        name: "probe 1",
        unit: "\u00B0" + "C",
        high: {
          value: payload.readInt16BE(2) / 10,
          hysteresis: payload[4] / 10,
        },
        low: {
          value: payload.readInt16BE(5) / 10,
          hysteresis: payload[7] / 10,
        },
      };
      appContent.superSamplingFactor = payload[8];
      return appContent;
    };
    return Temp0x11Parser;
  })();
  codec.Temp0x11Parser = Temp0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature 0x12 (configuration) frame parser
   */
  const Temp0x12Parser = /** @class */ (function () {
    function Temp0x12Parser() {
      this.deviceType = "temp";
      this.frameCode = 0x12;
    }
    Temp0x12Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x12 Temperature configuration" };
      appContent.threshold = {
        name: "probe 2",
        unit: "\u00B0" + "C",
        high: {
          value: payload.readInt16BE(2) / 10,
          hysteresis: payload[4] / 10,
        },
        low: {
          value: payload.readInt16BE(5) / 10,
          hysteresis: payload[7] / 10,
        },
      };
      return appContent;
    };
    return Temp0x12Parser;
  })();
  codec.Temp0x12Parser = Temp0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature 0x30 (keep alive) frame parser
   */
  const Temp0x30Parser = /** @class */ (function () {
    function Temp0x30Parser() {
      this.deviceType = "temp";
      this.frameCode = 0x30;
      this.temp0x43Parser = new codec.Temp0x43Parser();
    }
    Temp0x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = this.temp0x43Parser.parseFrame(
        payload,
        configuration,
        network,
      );
      appContent.type = "0x30 Temperature keep alive";
      return appContent;
    };
    return Temp0x30Parser;
  })();
  codec.Temp0x30Parser = Temp0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature 0x43 (data) frame parser
   */
  const Temp0x43Parser = /** @class */ (function () {
    function Temp0x43Parser() {
      this.deviceType = "temp";
      this.frameCode = 0x43;
    }
    Temp0x43Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x43 Temperature data" };
      const temp1 = { name: "probe 1" };
      const temp2 = { name: "probe 2" };
      // Internal sensor input states
      temp1.id = (payload[2] & 0xf0) >> 4;
      temp1.unit = "\u00B0" + "C";
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temp1.value = payload.readInt16BE(3) / 10;
      // External sensor input states
      temp2.id = (payload[5] & 0xf0) >> 4;
      temp2.unit = "\u00B0" + "C";
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temp2.value = payload.readInt16BE(6) / 10;
      // With FW > 1.3.8 we are able to activate or not a probe : detect these FW thanks to a specific value
      // sent by old FW
      if ((payload[5] & 0x0f) !== 2) {
        temp1.state = payload[2] & 0x01 ? "activated" : "deactivated";
        temp2.state = payload[5] & 0x01 ? "activated" : "deactivated";
      }
      appContent.temperatures = [temp1, temp2];
      return appContent;
    };
    return Temp0x43Parser;
  })();
  codec.Temp0x43Parser = Temp0x43Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temperature status byte parser
   */
  const TempStatusByteParser = /** @class */ (function () {
    function TempStatusByteParser() {
      this.deviceType = "temp";
      this.frameCode = 0;
    }
    TempStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.probe1Alarm = Boolean(payload[1] & 0x08);
      statusContent.probe2Alarm = Boolean(payload[1] & 0x10);
      return { status: statusContent };
    };
    return TempStatusByteParser;
  })();
  codec.TempStatusByteParser = TempStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 0x10 (configuration) frame parser
   */
  const TempV30x10Parser = /** @class */ (function () {
    function TempV30x10Parser() {
      this.deviceType = "temp3";
      this.frameCode = 0x10;
    }
    TempV30x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Temp 3 configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.redundantSamples = payload.readUInt8(10)),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return TempV30x10Parser;
  })();
  codec.TempV30x10Parser = TempV30x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 0x30 (keep alive) frame parser
   */
  const TempV30x30Parser = /** @class */ (function () {
    function TempV30x30Parser() {
      this.deviceType = "temp3";
      this.frameCode = 0x30;
    }
    TempV30x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Temp 3 keep alive" };
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      const temperatures = [];
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temperatures.push({
        name: "temperature 1",
        unit: "\u00B0" + "C",
        value: payload.readInt16BE(2) / 10,
      });
      if (nbSensors === 2) {
        temperatures.push({
          name: "temperature 2",
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(4) / 10,
        });
      }
      appContent.temperatures = temperatures;
      return appContent;
    };
    return TempV30x30Parser;
  })();
  codec.TempV30x30Parser = TempV30x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 0x57 (data) frame parser
   */
  const TempV30x57Parser = /** @class */ (function () {
    function TempV30x57Parser() {
      this.deviceType = "temp3";
      this.frameCode = 0x57;
    }
    TempV30x57Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x57 Temp 3 periodic data" };
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      let rawValue;
      const temperatures = [];
      const ch1Temp = [];
      const ch2Temp = [];
      // Loop through historic data [t=0, t-1, t-2,...]
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      for (
        let offset = 2;
        offset < payload.byteLength;
        offset += 2 * nbSensors
      ) {
        rawValue = payload.readInt16BE(offset);
        ch1Temp.push(rawValue / 10);
        if (nbSensors === 2) {
          rawValue = payload.readInt16BE(offset + 2);
          ch2Temp.push(rawValue / 10);
        }
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temperatures.push({
        name: "temperature 1",
        unit: "\u00B0" + "C",
        values: ch1Temp,
      });
      if (nbSensors === 2) {
        temperatures.push({
          name: "temperature 2",
          unit: "\u00B0" + "C",
          values: ch2Temp,
        });
      }
      appContent.temperatures = temperatures;
      return appContent;
    };
    return TempV30x57Parser;
  })();
  codec.TempV30x57Parser = TempV30x57Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 0x58 (alarm) frame parser
   */
  const TempV30x58Parser = /** @class */ (function () {
    function TempV30x58Parser() {
      this.deviceType = "temp3";
      this.frameCode = 0x58;
    }
    TempV30x58Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x58 Temp 3 alarm" };
      const alarms = [];
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      alarms.push({
        name: "temperature 1",
        alarmStatus: this.getAlarmStatusText(payload.readUInt8(2)),
        temperature: {
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(3) / 10,
        },
      });
      if (nbSensors === 2) {
        alarms.push({
          name: "temperature 2",
          alarmStatus: this.getAlarmStatusText(payload.readUInt8(5)),
          temperature: {
            unit: "\u00B0" + "C",
            value: payload.readInt16BE(6) / 10,
          },
        });
      }
      appContent.alarms = alarms;
      return appContent;
    };
    /**
     * Get Alarm status text
     * @param value value
     */
    TempV30x58Parser.prototype.getAlarmStatusText = function (value) {
      switch (value) {
        case 1:
          return "highThreshold";
        case 2:
          return "lowThreshold";
        default:
          return "none";
      }
    };
    return TempV30x58Parser;
  })();
  codec.TempV30x58Parser = TempV30x58Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 3 status byte parser
   */
  const TempV3StatusByteParser = /** @class */ (function () {
    function TempV3StatusByteParser() {
      this.deviceType = "temp3";
      this.frameCode = 0;
    }
    TempV3StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.configuration2ChannelsActivated = Boolean(
        payload[1] & 0x10,
      );
      return { status: statusContent };
    };
    return TempV3StatusByteParser;
  })();
  codec.TempV3StatusByteParser = TempV3StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 4 0x10 (configuration) frame parser
   */
  const TempV40x10Parser = /** @class */ (function () {
    function TempV40x10Parser() {
      this.deviceType = "temp4";
      this.frameCode = 0x10;
    }
    TempV40x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 Temp 4 configuration" };
      (appContent.transmissionPeriodKeepAlive = {
        unit: "s",
        value: payload.readUInt16BE(2) * 10,
      }),
        (appContent.numberOfHistorizationBeforeSending =
          payload.readUInt16BE(4)),
        (appContent.numberOfSamplingBeforeHistorization =
          payload.readUInt16BE(6)),
        (appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(8) * 2,
        }),
        (appContent.redundantSamples = payload.readUInt8(10)),
        (appContent.calculatedPeriodRecording = {
          unit: "s",
          value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
        }),
        (appContent.calculatedSendingPeriod = {
          unit: "s",
          value:
            payload.readUInt16BE(8) *
            payload.readUInt16BE(6) *
            payload.readUInt16BE(4) *
            2,
        });
      return appContent;
    };
    return TempV40x10Parser;
  })();
  codec.TempV40x10Parser = TempV40x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 4 0x30 (keep alive) frame parser
   */
  const TempV40x30Parser = /** @class */ (function () {
    function TempV40x30Parser() {
      this.deviceType = "temp4";
      this.frameCode = 0x30;
    }
    TempV40x30Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x30 Temp 4 keep alive" };
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      if (payload[1] & 0x04) {
        // offsetType for date timestamp position
        const offsetType = nbSensors === 2 ? 6 : 4;
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(offsetType) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      const temperatures = [];
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temperatures.push({
        name: "temperature 1",
        unit: "\u00B0" + "C",
        value: payload.readInt16BE(2) / 10,
      });
      if (nbSensors === 2) {
        temperatures.push({
          name: "temperature 2",
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(4) / 10,
        });
      }
      appContent.temperatures = temperatures;
      return appContent;
    };
    return TempV40x30Parser;
  })();
  codec.TempV40x30Parser = TempV40x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 4 0x57 (data) frame parser
   */
  const TempV40x57Parser = /** @class */ (function () {
    function TempV40x57Parser() {
      this.deviceType = "temp4";
      this.frameCode = 0x57;
    }
    TempV40x57Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x57 Temp 4 periodic data" };
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      let rawValue;
      const temperatures = [];
      const ch1Temp = [];
      const ch2Temp = [];
      const payloadLength =
        payload[1] & 0x04 ? payload.byteLength - 4 : payload.byteLength;
      // if the timestamp flag is true or false
      // if (payload[1] & 0x04) {
      // Loop through historic data [t=0, t-1, t-2,...]
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      // we subtract 4 bytes from the total length of the frame to deduce the timestamp
      for (let offset = 2; offset < payloadLength; offset += 2 * nbSensors) {
        rawValue = payload.readInt16BE(offset);
        ch1Temp.push(rawValue / 10);
        if (nbSensors === 2) {
          rawValue = payload.readInt16BE(offset + 2);
          ch2Temp.push(rawValue / 10);
        }
      }
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(payload.byteLength - 4) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.decodingInfo = "values: [t=0, t-1, t-2, ...]";
      // value@-3276.8 must be considered as an invalid measure (probe disconnected for instance)
      temperatures.push({
        name: "temperature 1",
        unit: "\u00B0" + "C",
        values: ch1Temp,
      });
      if (nbSensors === 2) {
        temperatures.push({
          name: "temperature 2",
          unit: "\u00B0" + "C",
          values: ch2Temp,
        });
      }
      appContent.temperatures = temperatures;
      return appContent;
    };
    return TempV40x57Parser;
  })();
  codec.TempV40x57Parser = TempV40x57Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 4 0x58 (alarm) frame parser
   */
  const TempV40x58Parser = /** @class */ (function () {
    function TempV40x58Parser() {
      this.deviceType = "temp4";
      this.frameCode = 0x58;
    }
    TempV40x58Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x58 Temp 4 alarm" };
      const alarms = [];
      const nbSensors = payload[1] & 0x10 ? 2 : 1;
      // offsetType for date timestamp position
      const offsetType = nbSensors === 2 ? 8 : 5;
      alarms.push({
        name: "temperature 1",
        alarmStatus: this.getAlarmStatusText(payload.readUInt8(2)),
        temperature: {
          unit: "\u00B0" + "C",
          value: payload.readInt16BE(3) / 10,
        },
      });
      if (nbSensors === 2) {
        alarms.push({
          name: "temperature 2",
          alarmStatus: this.getAlarmStatusText(payload.readUInt8(5)),
          temperature: {
            unit: "\u00B0" + "C",
            value: payload.readInt16BE(6) / 10,
          },
        });
      }
      if (payload[1] & 0x04) {
        // retrieval of the frame date timestamp value, then conversion to epoch 2013 (+1356998400), then in second
        const myDate = new Date(
          (payload.readUInt32BE(offsetType) + 1356998400) * 1000,
        );
        // As we do not know if timestamp is locale or UTC , do remove 'UTC' indication
        appContent.timestamp = myDate.toJSON().replace("Z", "");
      }
      appContent.alarms = alarms;
      return appContent;
    };
    /**
     * Get Alarm status text
     * @param value value
     */
    TempV40x58Parser.prototype.getAlarmStatusText = function (value) {
      switch (value) {
        case 1:
          return "highThreshold";
        case 2:
          return "lowThreshold";
        default:
          return "none";
      }
    };
    return TempV40x58Parser;
  })();
  codec.TempV40x58Parser = TempV40x58Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Temp 4 status byte parser
   */
  const TempV4StatusByteParser = /** @class */ (function () {
    function TempV4StatusByteParser() {
      this.deviceType = "temp4";
      this.frameCode = 0;
    }
    TempV4StatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent = {};
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.configuration2ChannelsActivated = Boolean(
        payload[1] & 0x10,
      );
      statusContent.timestamp = Boolean(payload[1] & 0x04);
      return { status: statusContent };
    };
    return TempV4StatusByteParser;
  })();
  codec.TempV4StatusByteParser = TempV4StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Tic 0x10 (configuration) frame parser
   */
  const Tic0x10Parser = /** @class */ (function () {
    function Tic0x10Parser() {
      this.deviceType = "ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri";
      this.frameCode = 0x10;
    }
    Tic0x10Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x10 TIC configuration" };
      if (payload[5] === 2) {
        // TEST mode => period = value * 20sec
        appContent.transmissionPeriodKeepAlive = {
          unit: "s",
          value: payload[2] * 20,
        };
        appContent.samplingPeriod = {
          unit: "s",
          value: payload.readUInt16BE(6) * 20,
        };
      } else {
        // PRODUCTION mode => period = value * 10min
        appContent.transmissionPeriodKeepAlive = {
          unit: "m",
          value: payload[2] * 10,
        };
        appContent.samplingPeriod = {
          unit: "m",
          value: payload.readUInt16BE(6),
        };
      }
      appContent.transmissionPeriodData = payload.readUInt16BE(3);
      // Product mode
      appContent.productMode = codec.PlateformCommonUtils.getProductModeText(
        payload[5],
      );
      return appContent;
    };
    return Tic0x10Parser;
  })();
  codec.Tic0x10Parser = Tic0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * TIC 0x49 (data) frame parser
   */
  const Tic0x49Parser = /** @class */ (function () {
    function Tic0x49Parser() {
      this.deviceType = "ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri";
      this.frameCode = 0x49;
    }
    Tic0x49Parser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
      deviceType,
    ) {
      let appContent = { type: "0x49 TIC data" };
      if (deviceType === "ticCbeLinkyMono") {
        appContent = this.payloadToString(
          payload,
          2,
          2 + 12,
          appContent,
          "ADCO",
        );
        appContent = this.payloadToString(
          payload,
          14,
          14 + 4,
          appContent,
          "OPTARIF",
        );
        appContent = this.payloadToValue(payload, 18, "Wh", appContent, "BASE");
        appContent = this.payloadToValue(
          payload,
          22,
          "A",
          appContent,
          "ISOUSC",
        );
        appContent = this.payloadToValue(payload, 26, "A", appContent, "IINST");
        appContent = this.payloadToValue(payload, 30, "A", appContent, "IMAX");
        appContent = this.payloadToValue(payload, 34, "VA", appContent, "PAPP");
        appContent = this.payloadToValue(payload, 38, "Wh", appContent, "HCHC");
        appContent = this.payloadToValue(payload, 42, "Wh", appContent, "HCHP");
        appContent = this.payloadToString(
          payload,
          46,
          46 + 4,
          appContent,
          "PTEC",
        );
      } else if (deviceType === "ticCbeLinkyTri") {
        appContent = this.payloadToString(
          payload,
          2,
          2 + 12,
          appContent,
          "ADCO",
        );
        appContent = this.payloadToValue(payload, 14, "Wh", appContent, "BASE");
        appContent = this.payloadToValue(
          payload,
          18,
          "A",
          appContent,
          "IINST1",
        );
        appContent = this.payloadToValue(
          payload,
          22,
          "A",
          appContent,
          "IINST2",
        );
        appContent = this.payloadToValue(
          payload,
          26,
          "A",
          appContent,
          "IINST3",
        );
        appContent = this.payloadToValue(payload, 30, "A", appContent, "IMAX1");
        appContent = this.payloadToValue(payload, 34, "A", appContent, "IMAX2");
        appContent = this.payloadToValue(payload, 38, "A", appContent, "IMAX3");
        appContent = this.payloadToValue(payload, 42, "W", appContent, "PMAX");
        appContent = this.payloadToValue(payload, 46, "VA", appContent, "PAPP");
      } else if (deviceType === "ticPmePmi") {
        appContent = this.payloadToDate(
          payload,
          2,
          deviceType,
          appContent,
          "DATE",
        );
        appContent = this.payloadToValue(payload, 8, "Wh", appContent, "EA_s");
        appContent = this.payloadToValue(
          payload,
          12,
          "varh",
          appContent,
          "ER+_s",
        );
        appContent = this.payloadToValue(
          payload,
          16,
          "varh",
          appContent,
          "ER-_s",
        );
        appContent = this.payloadToValue(
          payload,
          20,
          "VAh",
          appContent,
          "EAPP_s",
        );
        appContent = this.payloadToString(
          payload,
          24,
          24 + 3,
          appContent,
          "PTCOUR1",
        );
        appContent = this.payloadToValue(
          payload,
          27,
          "kWh",
          appContent,
          "EAP_s",
        );
        appContent = this.payloadToValue(
          payload,
          31,
          "kvarh",
          appContent,
          "ER+P_s",
        );
        appContent = this.payloadToValue(
          payload,
          35,
          "kvarh",
          appContent,
          "ER-P_s",
        );
        appContent = this.payloadToValue(
          payload,
          39,
          "kWh",
          appContent,
          "EaP-1_s",
        );
        appContent = this.payloadToValue(
          payload,
          43,
          "kvarh",
          appContent,
          "ER+P-1_s",
        );
        appContent = this.payloadToValue(
          payload,
          47,
          "kvarh",
          appContent,
          "ER-P-1_s",
        );
      }
      return appContent;
    };
    Tic0x49Parser.prototype.payloadToString = function (
      payload,
      start,
      end,
      appContent,
      label,
    ) {
      const charCode = [];
      for (let i = start; i < end; i++) {
        if (payload[i] !== 0x00) {
          charCode.push(payload[i]);
        }
      }
      const str = String.fromCharCode.apply(String, charCode);
      if (str.length > 0) {
        appContent[`${label}`] = str;
      } else {
        appContent[`${label}status`] = "notFound";
      }
      return appContent;
    };
    Tic0x49Parser.prototype.payloadToValue = function (
      payload,
      start,
      unit,
      appContent,
      label,
    ) {
      const val = payload.readUInt32BE(start);
      if (val !== 0x80000000) {
        appContent[`${label}`] = { unit, value: val };
      } else {
        appContent[`${label}status`] = "notFound";
      }
      return appContent;
    };
    Tic0x49Parser.prototype.p2d = function (val) {
      return `0${val}`.slice(-2);
    };
    Tic0x49Parser.prototype.payloadToDate = function (
      payload,
      start,
      deviceType,
      appContent,
      label,
    ) {
      let str = "2000-01-01T00:00:00";
      if (deviceType === "ticPmePmi") {
        // format iso8601 : 2020-4-21T13:43:5
        str = `${2000 + payload[start + 2]}-${this.p2d(
          payload[start + 1],
        )}-${this.p2d(payload[start + 0])}T${this.p2d(
          payload[start + 3],
        )}:${this.p2d(payload[start + 4])}:${this.p2d(payload[start + 5])}`;
      }
      if (str !== "2000-01-01T00:00:00") {
        appContent[`${label}`] = str;
      } else {
        appContent[`${label}status`] = "notFound";
      }
      return appContent;
    };
    return Tic0x49Parser;
  })();
  codec.Tic0x49Parser = Tic0x49Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Tic 0x4a (alarm) frame parser
   */
  const Tic0x4aParser = /** @class */ (function () {
    function Tic0x4aParser() {
      this.deviceType = "ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri";
      this.frameCode = 0x4a;
    }
    Tic0x4aParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      const appContent = { type: "0x4a TIC alarm" };
      appContent.label = this.payloadToString(payload, 2, 12);
      appContent.alarmType = this.getAlarmTypeText(payload[12]);
      appContent.value = this.payloadToString(payload, 13, payload.length);
      return appContent;
    };
    /**
     * Get Threshold Triggering text
     * @param value value
     */
    Tic0x4aParser.prototype.getAlarmTypeText = function (value) {
      switch (value) {
        case 0:
          return "manualTrigger";
        case 1:
          return "labelAppearance";
        case 2:
          return "labelDisappearance";
        case 3:
          return "highthreshold";
        case 4:
          return "lowthreshold";
        case 5:
          return "endThresholdAlarm";
        case 6:
          return "deltaPositive";
        case 7:
          return "deltaNegative";
        default:
          return "";
      }
    };
    Tic0x4aParser.prototype.payloadToString = function (payload, start, end) {
      const charCode = [];
      for (let i = start; i < end; i++) {
        if (payload[i] !== 0x00) {
          charCode.push(payload[i]);
        }
      }
      const str = String.fromCharCode.apply(String, charCode);
      return str.length > 0 ? str : "notFound";
    };
    return Tic0x4aParser;
  })();
  codec.Tic0x4aParser = Tic0x4aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  /**
   * Tic status byte parser
   */
  const TicStatusByteParser = /** @class */ (function () {
    function TicStatusByteParser() {
      this.deviceType = "ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri";
      this.frameCode = 0;
    }
    TicStatusByteParser.prototype.parseFrame = function (
      payload,
      configuration,
      network,
    ) {
      let statusContent;
      const parser = new codec.GenericStatusByteParser();
      statusContent = parser.parseFrame(payload, configuration);
      // Status byte, applicative flags
      statusContent.configurationInconsistency = Boolean(payload[1] & 0x08);
      statusContent.readError = Boolean(payload[1] & 0x10);
      return { status: statusContent };
    };
    return TicStatusByteParser;
  })();
  codec.TicStatusByteParser = TicStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
  let PartialDecodingReason;
  (function (PartialDecodingReason) {
    PartialDecodingReason[(PartialDecodingReason.NONE = 0)] = "NONE";
    PartialDecodingReason[(PartialDecodingReason.MISSING_NETWORK = 1)] =
      "MISSING_NETWORK";
    PartialDecodingReason[(PartialDecodingReason.MISSING_CONFIGURATION = 2)] =
      "MISSING_CONFIGURATION";
  })(
    (PartialDecodingReason =
      codec.PartialDecodingReason || (codec.PartialDecodingReason = {})),
  );
})(codec || (codec = {}));
var codec;
(function (codec) {
  const ContentImpl = /** @class */ (function () {
    function ContentImpl(type) {
      if (type === void 0) {
        type = "Unknown";
      }
      this.type = type;
      this.partialDecoding = codec.PartialDecodingReason.NONE;
    }
    ContentImpl.merge = function () {
      const contents = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        contents[_i] = arguments[_i];
      }
      if (!contents || contents.length === 0) {
        return null;
      }
      return Object.assign.apply(
        Object,
        __spreadArray([new ContentImpl(contents[0].type)], contents, false),
      );
    };
    ContentImpl.prototype.merge = function () {
      const contents = [];
      for (let _i = 0; _i < arguments.length; _i++) {
        contents[_i] = arguments[_i];
      }
      return ContentImpl.merge.apply(
        ContentImpl,
        __spreadArray([this], contents, false),
      );
    };
    return ContentImpl;
  })();
  codec.ContentImpl = ContentImpl;
})(codec || (codec = {}));
var codec;
(function (codec) {
  const PlateformCommonUtils = /** @class */ (function () {
    function PlateformCommonUtils() {}
    /**
     * Get Product Mode text
     * @param value value
     */
    PlateformCommonUtils.getProductModeText = function (value) {
      switch (value) {
        case 0:
          return "PARK";
        case 1:
          return "PRODUCTION";
        case 2:
          return "TEST";
        case 3:
          return "DEAD";
        default:
          return "";
      }
    };
    return PlateformCommonUtils;
  })();
  codec.PlateformCommonUtils = PlateformCommonUtils;
})(codec || (codec = {}));
var codec;
(function (codec) {
  let DecoderProducts;
  (function (DecoderProducts) {
    DecoderProducts.analog = "Analog";
    DecoderProducts.breath = "Breath";
    DecoderProducts.comfort = "Comfort";
    DecoderProducts.comfort2 = "Comfort 2";
    DecoderProducts.comfortCo2 = "Comfort CO2";
    DecoderProducts.drycontacts = "Dry Contacts";
    DecoderProducts.drycontacts2 = "Dry Contacts 2";
    DecoderProducts.deltap = "Delta P";
    DecoderProducts.motion = "Motion";
    DecoderProducts.pulse = "Pulse";
    DecoderProducts.pulse3 = "Pulse 3";
    DecoderProducts.pulse4 = "Pulse 4";
    DecoderProducts.pulse4nbiot = "Pulse 4 NB-IoT";
    DecoderProducts.repeater = "Repeater";
    DecoderProducts.temp = "Temp";
    DecoderProducts.temp3 = "Temp 3";
    DecoderProducts.temp4 = "Temp 4";
    DecoderProducts.ticCbeLinkyMono = "TIC CBE/LINKY MONO";
    DecoderProducts.ticCbeLinkyTri = "TIC CBE/LINKY TRI";
    DecoderProducts.ticPmePmi = "TIC PME-PMI";
  })((DecoderProducts = codec.DecoderProducts || (codec.DecoderProducts = {})));
})(codec || (codec = {}));
// # sourceMappingURL=lib.js.map

// >>> lib codec END

function consume(event) {
  const payload = event.data.payloadHex;
  const decoder = new codec.Decoder();
  const status = {};
  const data = {};

  decoder.setDeviceType("pulse4");
  const decoded = decoder.decode(payload);

  emit("sample", { data: decoded.status, topic: "lifecycle" });
  delete decoded.status;

  if (decoded.counterValues !== undefined && decoded.counterValues !== []) {
    let i = 0;
    decoded.counterValues.forEach((element) => {
      if (i == 0) {
        data.counterValue = element;
      } else {
        data[`counterValueT${i}`] = element;
      }
      i++;
    });
    emit("sample", { data, topic: "default" });
    delete decoded.counterValues;
  }

  emit("sample", { data: { extra: decoded }, topic: "extra" });
}
