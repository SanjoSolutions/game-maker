var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// ../node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "../node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// ../node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// ../node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    module.exports = {
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// ../node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var promise = Promise.resolve();
    var queueTask = typeof queueMicrotask === "function" ? queueMicrotask : queueMicrotaskShim;
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = !!options.allowSynchronousEvents;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored)
          cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO)
            this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else {
            data = fragments;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            queueTask(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            queueTask(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          queueTask(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
    function queueMicrotaskShim(cb) {
      promise.then(cb).catch(throwErrorNextTick);
    }
    function throwError(err) {
      throw err;
    }
    function throwErrorNextTick(err) {
      process.nextTick(throwError, err);
    }
  }
});

// ../node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            randomFillSync(mask, 0, 4);
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(
            _Sender.frame(data, {
              [kByteLength]: byteLength,
              fin: options.fin,
              generateMask: this._generateMask,
              mask: options.mask,
              maskBuffer: this._maskBuffer,
              opcode,
              readOnly,
              rsv1: false
            }),
            cb
          );
        }
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const params = this._queue[i];
              const callback = params[params.length - 1];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {Buffer[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
  }
});

// ../node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// ../node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values))
                values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// ../node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL } = __require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }
      /**
       * This deviates from the WHATWG interface since ws doesn't support the
       * required default "blob" type (instead we define a custom "nodebuffer"
       * type).
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        if (socket.setTimeout)
          socket.setTimeout(0);
        if (socket.setNoDelay)
          socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(
          this._socket.destroy.bind(this._socket),
          closeTimeout
        );
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: false,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING)
          return;
        req = websocket._req = null;
        if (res.headers.upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong)
        websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// ../node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: false,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server2 = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server2.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (req.headers.upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!key || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server2, map) {
      for (const event of Object.keys(map))
        server2.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server2.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server2) {
      server2._state = CLOSED;
      server2.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server2, req, socket, code, message) {
      if (server2.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server2.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js
var require_json_typings = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isJsonObject = exports.typeofJsonValue = void 0;
    function typeofJsonValue(value) {
      let t = typeof value;
      if (t == "object") {
        if (Array.isArray(value))
          return "array";
        if (value === null)
          return "null";
      }
      return t;
    }
    exports.typeofJsonValue = typeofJsonValue;
    function isJsonObject(value) {
      return value !== null && typeof value == "object" && !Array.isArray(value);
    }
    exports.isJsonObject = isJsonObject;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/base64.js
var require_base64 = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/base64.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.base64encode = exports.base64decode = void 0;
    var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var decTable = [];
    for (let i = 0; i < encTable.length; i++)
      decTable[encTable[i].charCodeAt(0)] = i;
    decTable["-".charCodeAt(0)] = encTable.indexOf("+");
    decTable["_".charCodeAt(0)] = encTable.indexOf("/");
    function base64decode(base64Str) {
      let es = base64Str.length * 3 / 4;
      if (base64Str[base64Str.length - 2] == "=")
        es -= 2;
      else if (base64Str[base64Str.length - 1] == "=")
        es -= 1;
      let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
      for (let i = 0; i < base64Str.length; i++) {
        b = decTable[base64Str.charCodeAt(i)];
        if (b === void 0) {
          switch (base64Str[i]) {
            case "=":
              groupPos = 0;
            case "\n":
            case "\r":
            case "	":
            case " ":
              continue;
            default:
              throw Error(`invalid base64 string.`);
          }
        }
        switch (groupPos) {
          case 0:
            p = b;
            groupPos = 1;
            break;
          case 1:
            bytes[bytePos++] = p << 2 | (b & 48) >> 4;
            p = b;
            groupPos = 2;
            break;
          case 2:
            bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
            p = b;
            groupPos = 3;
            break;
          case 3:
            bytes[bytePos++] = (p & 3) << 6 | b;
            groupPos = 0;
            break;
        }
      }
      if (groupPos == 1)
        throw Error(`invalid base64 string.`);
      return bytes.subarray(0, bytePos);
    }
    exports.base64decode = base64decode;
    function base64encode(bytes) {
      let base64 = "", groupPos = 0, b, p = 0;
      for (let i = 0; i < bytes.length; i++) {
        b = bytes[i];
        switch (groupPos) {
          case 0:
            base64 += encTable[b >> 2];
            p = (b & 3) << 4;
            groupPos = 1;
            break;
          case 1:
            base64 += encTable[p | b >> 4];
            p = (b & 15) << 2;
            groupPos = 2;
            break;
          case 2:
            base64 += encTable[p | b >> 6];
            base64 += encTable[b & 63];
            groupPos = 0;
            break;
        }
      }
      if (groupPos) {
        base64 += encTable[p];
        base64 += "=";
        if (groupPos == 1)
          base64 += "=";
      }
      return base64;
    }
    exports.base64encode = base64encode;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js
var require_protobufjs_utf8 = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utf8read = void 0;
    var fromCharCodes = (chunk) => String.fromCharCode.apply(String, chunk);
    function utf8read(bytes) {
      if (bytes.length < 1)
        return "";
      let pos = 0, parts = [], chunk = [], i = 0, t;
      let len = bytes.length;
      while (pos < len) {
        t = bytes[pos++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | bytes[pos++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (bytes[pos++] & 63) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63;
        if (i > 8191) {
          parts.push(fromCharCodes(chunk));
          i = 0;
        }
      }
      if (parts.length) {
        if (i)
          parts.push(fromCharCodes(chunk.slice(0, i)));
        return parts.join("");
      }
      return fromCharCodes(chunk.slice(0, i));
    }
    exports.utf8read = utf8read;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js
var require_binary_format_contract = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WireType = exports.mergeBinaryOptions = exports.UnknownFieldHandler = void 0;
    var UnknownFieldHandler6;
    (function(UnknownFieldHandler7) {
      UnknownFieldHandler7.symbol = Symbol.for("protobuf-ts/unknown");
      UnknownFieldHandler7.onRead = (typeName, message, fieldNo, wireType, data) => {
        let container = is(message) ? message[UnknownFieldHandler7.symbol] : message[UnknownFieldHandler7.symbol] = [];
        container.push({ no: fieldNo, wireType, data });
      };
      UnknownFieldHandler7.onWrite = (typeName, message, writer) => {
        for (let { no, wireType, data } of UnknownFieldHandler7.list(message))
          writer.tag(no, wireType).raw(data);
      };
      UnknownFieldHandler7.list = (message, fieldNo) => {
        if (is(message)) {
          let all = message[UnknownFieldHandler7.symbol];
          return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
        }
        return [];
      };
      UnknownFieldHandler7.last = (message, fieldNo) => UnknownFieldHandler7.list(message, fieldNo).slice(-1)[0];
      const is = (message) => message && Array.isArray(message[UnknownFieldHandler7.symbol]);
    })(UnknownFieldHandler6 = exports.UnknownFieldHandler || (exports.UnknownFieldHandler = {}));
    function mergeBinaryOptions(a, b) {
      return Object.assign(Object.assign({}, a), b);
    }
    exports.mergeBinaryOptions = mergeBinaryOptions;
    var WireType5;
    (function(WireType6) {
      WireType6[WireType6["Varint"] = 0] = "Varint";
      WireType6[WireType6["Bit64"] = 1] = "Bit64";
      WireType6[WireType6["LengthDelimited"] = 2] = "LengthDelimited";
      WireType6[WireType6["StartGroup"] = 3] = "StartGroup";
      WireType6[WireType6["EndGroup"] = 4] = "EndGroup";
      WireType6[WireType6["Bit32"] = 5] = "Bit32";
    })(WireType5 = exports.WireType || (exports.WireType = {}));
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js
var require_goog_varint = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.varint32read = exports.varint32write = exports.int64toString = exports.int64fromString = exports.varint64write = exports.varint64read = void 0;
    function varint64read() {
      let lowBits = 0;
      let highBits = 0;
      for (let shift = 0; shift < 28; shift += 7) {
        let b = this.buf[this.pos++];
        lowBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      let middleByte = this.buf[this.pos++];
      lowBits |= (middleByte & 15) << 28;
      highBits = (middleByte & 112) >> 4;
      if ((middleByte & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
      for (let shift = 3; shift <= 31; shift += 7) {
        let b = this.buf[this.pos++];
        highBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      throw new Error("invalid varint");
    }
    exports.varint64read = varint64read;
    function varint64write(lo, hi, bytes) {
      for (let i = 0; i < 28; i = i + 7) {
        const shift = lo >>> i;
        const hasNext = !(shift >>> 7 == 0 && hi == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
      const hasMoreBits = !(hi >> 3 == 0);
      bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
      if (!hasMoreBits) {
        return;
      }
      for (let i = 3; i < 31; i = i + 7) {
        const shift = hi >>> i;
        const hasNext = !(shift >>> 7 == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      bytes.push(hi >>> 31 & 1);
    }
    exports.varint64write = varint64write;
    var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
    function int64fromString(dec) {
      let minus = dec[0] == "-";
      if (minus)
        dec = dec.slice(1);
      const base = 1e6;
      let lowBits = 0;
      let highBits = 0;
      function add1e6digit(begin, end) {
        const digit1e6 = Number(dec.slice(begin, end));
        highBits *= base;
        lowBits = lowBits * base + digit1e6;
        if (lowBits >= TWO_PWR_32_DBL) {
          highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
          lowBits = lowBits % TWO_PWR_32_DBL;
        }
      }
      add1e6digit(-24, -18);
      add1e6digit(-18, -12);
      add1e6digit(-12, -6);
      add1e6digit(-6);
      return [minus, lowBits, highBits];
    }
    exports.int64fromString = int64fromString;
    function int64toString(bitsLow, bitsHigh) {
      if (bitsHigh >>> 0 <= 2097151) {
        return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
      }
      let low = bitsLow & 16777215;
      let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
      let high = bitsHigh >> 16 & 65535;
      let digitA = low + mid * 6777216 + high * 6710656;
      let digitB = mid + high * 8147497;
      let digitC = high * 2;
      let base = 1e7;
      if (digitA >= base) {
        digitB += Math.floor(digitA / base);
        digitA %= base;
      }
      if (digitB >= base) {
        digitC += Math.floor(digitB / base);
        digitB %= base;
      }
      function decimalFrom1e7(digit1e7, needLeadingZeros) {
        let partial = digit1e7 ? String(digit1e7) : "";
        if (needLeadingZeros) {
          return "0000000".slice(partial.length) + partial;
        }
        return partial;
      }
      return decimalFrom1e7(
        digitC,
        /*needLeadingZeros=*/
        0
      ) + decimalFrom1e7(
        digitB,
        /*needLeadingZeros=*/
        digitC
      ) + // If the final 1e7 digit didn't need leading zeros, we would have
      // returned via the trivial code path at the top.
      decimalFrom1e7(
        digitA,
        /*needLeadingZeros=*/
        1
      );
    }
    exports.int64toString = int64toString;
    function varint32write(value, bytes) {
      if (value >= 0) {
        while (value > 127) {
          bytes.push(value & 127 | 128);
          value = value >>> 7;
        }
        bytes.push(value);
      } else {
        for (let i = 0; i < 9; i++) {
          bytes.push(value & 127 | 128);
          value = value >> 7;
        }
        bytes.push(1);
      }
    }
    exports.varint32write = varint32write;
    function varint32read() {
      let b = this.buf[this.pos++];
      let result = b & 127;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 7;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 14;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 21;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 15) << 28;
      for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
        b = this.buf[this.pos++];
      if ((b & 128) != 0)
        throw new Error("invalid varint");
      this.assertBounds();
      return result >>> 0;
    }
    exports.varint32read = varint32read;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js
var require_pb_long = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PbLong = exports.PbULong = exports.detectBi = void 0;
    var goog_varint_1 = require_goog_varint();
    var BI;
    function detectBi() {
      const dv = new DataView(new ArrayBuffer(8));
      const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
      BI = ok ? {
        MIN: BigInt("-9223372036854775808"),
        MAX: BigInt("9223372036854775807"),
        UMIN: BigInt("0"),
        UMAX: BigInt("18446744073709551615"),
        C: BigInt,
        V: dv
      } : void 0;
    }
    exports.detectBi = detectBi;
    detectBi();
    function assertBi(bi) {
      if (!bi)
        throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
    }
    var RE_DECIMAL_STR = /^-?[0-9]+$/;
    var TWO_PWR_32_DBL = 4294967296;
    var HALF_2_PWR_32 = 2147483648;
    var SharedPbLong = class {
      /**
       * Create a new instance with the given bits.
       */
      constructor(lo, hi) {
        this.lo = lo | 0;
        this.hi = hi | 0;
      }
      /**
       * Is this instance equal to 0?
       */
      isZero() {
        return this.lo == 0 && this.hi == 0;
      }
      /**
       * Convert to a native number.
       */
      toNumber() {
        let result = this.hi * TWO_PWR_32_DBL + (this.lo >>> 0);
        if (!Number.isSafeInteger(result))
          throw new Error("cannot convert to safe number");
        return result;
      }
    };
    var PbULong = class _PbULong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.UMIN)
                throw new Error("signed value for ulong");
              if (value > BI.UMAX)
                throw new Error("ulong too large");
              BI.V.setBigUint64(0, value, true);
              return new _PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              if (minus)
                throw new Error("signed value for ulong");
              return new _PbULong(lo, hi);
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              if (value < 0)
                throw new Error("signed value for ulong");
              return new _PbULong(value, value / TWO_PWR_32_DBL);
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        return BI ? this.toBigInt().toString() : goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigUint64(0, true);
      }
    };
    exports.PbULong = PbULong;
    PbULong.ZERO = new PbULong(0, 0);
    var PbLong = class _PbLong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.MIN)
                throw new Error("signed long too small");
              if (value > BI.MAX)
                throw new Error("signed long too large");
              BI.V.setBigInt64(0, value, true);
              return new _PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              if (minus) {
                if (hi > HALF_2_PWR_32 || hi == HALF_2_PWR_32 && lo != 0)
                  throw new Error("signed long too small");
              } else if (hi >= HALF_2_PWR_32)
                throw new Error("signed long too large");
              let pbl = new _PbLong(lo, hi);
              return minus ? pbl.negate() : pbl;
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              return value > 0 ? new _PbLong(value, value / TWO_PWR_32_DBL) : new _PbLong(-value, -value / TWO_PWR_32_DBL).negate();
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Do we have a minus sign?
       */
      isNegative() {
        return (this.hi & HALF_2_PWR_32) !== 0;
      }
      /**
       * Negate two's complement.
       * Invert all the bits and add one to the result.
       */
      negate() {
        let hi = ~this.hi, lo = this.lo;
        if (lo)
          lo = ~lo + 1;
        else
          hi += 1;
        return new _PbLong(lo, hi);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        if (BI)
          return this.toBigInt().toString();
        if (this.isNegative()) {
          let n = this.negate();
          return "-" + goog_varint_1.int64toString(n.lo, n.hi);
        }
        return goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigInt64(0, true);
      }
    };
    exports.PbLong = PbLong;
    PbLong.ZERO = new PbLong(0, 0);
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js
var require_binary_reader = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryReader = exports.binaryReadOptions = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var defaultsRead = {
      readUnknownField: true,
      readerFactory: (bytes) => new BinaryReader(bytes)
    };
    function binaryReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports.binaryReadOptions = binaryReadOptions;
    var BinaryReader = class {
      constructor(buf, textDecoder) {
        this.varint64 = goog_varint_1.varint64read;
        this.uint32 = goog_varint_1.varint32read;
        this.buf = buf;
        this.len = buf.length;
        this.pos = 0;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
          fatal: true,
          ignoreBOM: true
        });
      }
      /**
       * Reads a tag - field number and wire type.
       */
      tag() {
        let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
        if (fieldNo <= 0 || wireType < 0 || wireType > 5)
          throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
        return [fieldNo, wireType];
      }
      /**
       * Skip one element on the wire and return the skipped data.
       * Supports WireType.StartGroup since v2.0.0-alpha.23.
       */
      skip(wireType) {
        let start = this.pos;
        switch (wireType) {
          case binary_format_contract_1.WireType.Varint:
            while (this.buf[this.pos++] & 128) {
            }
            break;
          case binary_format_contract_1.WireType.Bit64:
            this.pos += 4;
          case binary_format_contract_1.WireType.Bit32:
            this.pos += 4;
            break;
          case binary_format_contract_1.WireType.LengthDelimited:
            let len = this.uint32();
            this.pos += len;
            break;
          case binary_format_contract_1.WireType.StartGroup:
            let t;
            while ((t = this.tag()[1]) !== binary_format_contract_1.WireType.EndGroup) {
              this.skip(t);
            }
            break;
          default:
            throw new Error("cant skip wire type " + wireType);
        }
        this.assertBounds();
        return this.buf.subarray(start, this.pos);
      }
      /**
       * Throws error if position in byte array is out of range.
       */
      assertBounds() {
        if (this.pos > this.len)
          throw new RangeError("premature EOF");
      }
      /**
       * Read a `int32` field, a signed 32 bit varint.
       */
      int32() {
        return this.uint32() | 0;
      }
      /**
       * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
       */
      sint32() {
        let zze = this.uint32();
        return zze >>> 1 ^ -(zze & 1);
      }
      /**
       * Read a `int64` field, a signed 64-bit varint.
       */
      int64() {
        return new pb_long_1.PbLong(...this.varint64());
      }
      /**
       * Read a `uint64` field, an unsigned 64-bit varint.
       */
      uint64() {
        return new pb_long_1.PbULong(...this.varint64());
      }
      /**
       * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64() {
        let [lo, hi] = this.varint64();
        let s = -(lo & 1);
        lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
        hi = hi >>> 1 ^ s;
        return new pb_long_1.PbLong(lo, hi);
      }
      /**
       * Read a `bool` field, a variant.
       */
      bool() {
        let [lo, hi] = this.varint64();
        return lo !== 0 || hi !== 0;
      }
      /**
       * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
       */
      fixed32() {
        return this.view.getUint32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
       */
      sfixed32() {
        return this.view.getInt32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
       */
      fixed64() {
        return new pb_long_1.PbULong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
       */
      sfixed64() {
        return new pb_long_1.PbLong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `float` field, 32-bit floating point number.
       */
      float() {
        return this.view.getFloat32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `double` field, a 64-bit floating point number.
       */
      double() {
        return this.view.getFloat64((this.pos += 8) - 8, true);
      }
      /**
       * Read a `bytes` field, length-delimited arbitrary data.
       */
      bytes() {
        let len = this.uint32();
        let start = this.pos;
        this.pos += len;
        this.assertBounds();
        return this.buf.subarray(start, start + len);
      }
      /**
       * Read a `string` field, length-delimited data converted to UTF-8 text.
       */
      string() {
        return this.textDecoder.decode(this.bytes());
      }
    };
    exports.BinaryReader = BinaryReader;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/assert.js
var require_assert = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/assert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertFloat32 = exports.assertUInt32 = exports.assertInt32 = exports.assertNever = exports.assert = void 0;
    function assert(condition, msg) {
      if (!condition) {
        throw new Error(msg);
      }
    }
    exports.assert = assert;
    function assertNever(value, msg) {
      throw new Error(msg !== null && msg !== void 0 ? msg : "Unexpected object: " + value);
    }
    exports.assertNever = assertNever;
    var FLOAT32_MAX = 34028234663852886e22;
    var FLOAT32_MIN = -34028234663852886e22;
    var UINT32_MAX = 4294967295;
    var INT32_MAX = 2147483647;
    var INT32_MIN = -2147483648;
    function assertInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid int 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
        throw new Error("invalid int 32: " + arg);
    }
    exports.assertInt32 = assertInt32;
    function assertUInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid uint 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
        throw new Error("invalid uint 32: " + arg);
    }
    exports.assertUInt32 = assertUInt32;
    function assertFloat32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid float 32: " + typeof arg);
      if (!Number.isFinite(arg))
        return;
      if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
        throw new Error("invalid float 32: " + arg);
    }
    exports.assertFloat32 = assertFloat32;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js
var require_binary_writer = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryWriter = exports.binaryWriteOptions = void 0;
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var assert_1 = require_assert();
    var defaultsWrite = {
      writeUnknownFields: true,
      writerFactory: () => new BinaryWriter()
    };
    function binaryWriteOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports.binaryWriteOptions = binaryWriteOptions;
    var BinaryWriter = class {
      constructor(textEncoder) {
        this.stack = [];
        this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
        this.chunks = [];
        this.buf = [];
      }
      /**
       * Return all bytes written and reset this writer.
       */
      finish() {
        this.chunks.push(new Uint8Array(this.buf));
        let len = 0;
        for (let i = 0; i < this.chunks.length; i++)
          len += this.chunks[i].length;
        let bytes = new Uint8Array(len);
        let offset = 0;
        for (let i = 0; i < this.chunks.length; i++) {
          bytes.set(this.chunks[i], offset);
          offset += this.chunks[i].length;
        }
        this.chunks = [];
        return bytes;
      }
      /**
       * Start a new fork for length-delimited data like a message
       * or a packed repeated field.
       *
       * Must be joined later with `join()`.
       */
      fork() {
        this.stack.push({ chunks: this.chunks, buf: this.buf });
        this.chunks = [];
        this.buf = [];
        return this;
      }
      /**
       * Join the last fork. Write its length and bytes, then
       * return to the previous state.
       */
      join() {
        let chunk = this.finish();
        let prev = this.stack.pop();
        if (!prev)
          throw new Error("invalid state, fork stack empty");
        this.chunks = prev.chunks;
        this.buf = prev.buf;
        this.uint32(chunk.byteLength);
        return this.raw(chunk);
      }
      /**
       * Writes a tag (field number and wire type).
       *
       * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
       *
       * Generated code should compute the tag ahead of time and call `uint32()`.
       */
      tag(fieldNo, type) {
        return this.uint32((fieldNo << 3 | type) >>> 0);
      }
      /**
       * Write a chunk of raw bytes.
       */
      raw(chunk) {
        if (this.buf.length) {
          this.chunks.push(new Uint8Array(this.buf));
          this.buf = [];
        }
        this.chunks.push(chunk);
        return this;
      }
      /**
       * Write a `uint32` value, an unsigned 32 bit varint.
       */
      uint32(value) {
        assert_1.assertUInt32(value);
        while (value > 127) {
          this.buf.push(value & 127 | 128);
          value = value >>> 7;
        }
        this.buf.push(value);
        return this;
      }
      /**
       * Write a `int32` value, a signed 32 bit varint.
       */
      int32(value) {
        assert_1.assertInt32(value);
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `bool` value, a variant.
       */
      bool(value) {
        this.buf.push(value ? 1 : 0);
        return this;
      }
      /**
       * Write a `bytes` value, length-delimited arbitrary data.
       */
      bytes(value) {
        this.uint32(value.byteLength);
        return this.raw(value);
      }
      /**
       * Write a `string` value, length-delimited data converted to UTF-8 text.
       */
      string(value) {
        let chunk = this.textEncoder.encode(value);
        this.uint32(chunk.byteLength);
        return this.raw(chunk);
      }
      /**
       * Write a `float` value, 32-bit floating point number.
       */
      float(value) {
        assert_1.assertFloat32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setFloat32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `double` value, a 64-bit floating point number.
       */
      double(value) {
        let chunk = new Uint8Array(8);
        new DataView(chunk.buffer).setFloat64(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
       */
      fixed32(value) {
        assert_1.assertUInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setUint32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
       */
      sfixed32(value) {
        assert_1.assertInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setInt32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
       */
      sint32(value) {
        assert_1.assertInt32(value);
        value = (value << 1 ^ value >> 31) >>> 0;
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
       */
      sfixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = pb_long_1.PbLong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
      }
      /**
       * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
       */
      fixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = pb_long_1.PbULong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
      }
      /**
       * Write a `int64` value, a signed 64-bit varint.
       */
      int64(value) {
        let long = pb_long_1.PbLong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
      /**
       * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64(value) {
        let long = pb_long_1.PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
        goog_varint_1.varint64write(lo, hi, this.buf);
        return this;
      }
      /**
       * Write a `uint64` value, an unsigned 64-bit varint.
       */
      uint64(value) {
        let long = pb_long_1.PbULong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
    };
    exports.BinaryWriter = BinaryWriter;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js
var require_json_format_contract = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeJsonOptions = exports.jsonWriteOptions = exports.jsonReadOptions = void 0;
    var defaultsWrite = {
      emitDefaultValues: false,
      enumAsInteger: false,
      useProtoFieldName: false,
      prettySpaces: 0
    };
    var defaultsRead = {
      ignoreUnknownFields: false
    };
    function jsonReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports.jsonReadOptions = jsonReadOptions;
    function jsonWriteOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports.jsonWriteOptions = jsonWriteOptions;
    function mergeJsonOptions(a, b) {
      var _a, _b;
      let c = Object.assign(Object.assign({}, a), b);
      c.typeRegistry = [...(_a = a === null || a === void 0 ? void 0 : a.typeRegistry) !== null && _a !== void 0 ? _a : [], ...(_b = b === null || b === void 0 ? void 0 : b.typeRegistry) !== null && _b !== void 0 ? _b : []];
      return c;
    }
    exports.mergeJsonOptions = mergeJsonOptions;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js
var require_message_type_contract = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MESSAGE_TYPE = void 0;
    exports.MESSAGE_TYPE = Symbol.for("protobuf-ts/message-type");
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js
var require_lower_camel_case = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lowerCamelCase = void 0;
    function lowerCamelCase(snakeCase) {
      let capNext = false;
      const sb = [];
      for (let i = 0; i < snakeCase.length; i++) {
        let next = snakeCase.charAt(i);
        if (next == "_") {
          capNext = true;
        } else if (/\d/.test(next)) {
          sb.push(next);
          capNext = true;
        } else if (capNext) {
          sb.push(next.toUpperCase());
          capNext = false;
        } else if (i == 0) {
          sb.push(next.toLowerCase());
        } else {
          sb.push(next);
        }
      }
      return sb.join("");
    }
    exports.lowerCamelCase = lowerCamelCase;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js
var require_reflection_info = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readMessageOption = exports.readFieldOption = exports.readFieldOptions = exports.normalizeFieldInfo = exports.RepeatType = exports.LongType = exports.ScalarType = void 0;
    var lower_camel_case_1 = require_lower_camel_case();
    var ScalarType;
    (function(ScalarType2) {
      ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
      ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
      ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
      ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
      ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
      ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
      ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
      ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
      ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
      ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
      ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
      ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
      ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
      ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
      ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
    })(ScalarType = exports.ScalarType || (exports.ScalarType = {}));
    var LongType;
    (function(LongType2) {
      LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
      LongType2[LongType2["STRING"] = 1] = "STRING";
      LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
    })(LongType = exports.LongType || (exports.LongType = {}));
    var RepeatType;
    (function(RepeatType2) {
      RepeatType2[RepeatType2["NO"] = 0] = "NO";
      RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
      RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
    })(RepeatType = exports.RepeatType || (exports.RepeatType = {}));
    function normalizeFieldInfo(field) {
      var _a, _b, _c, _d;
      field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lower_camel_case_1.lowerCamelCase(field.name);
      field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lower_camel_case_1.lowerCamelCase(field.name);
      field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
      field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
      return field;
    }
    exports.normalizeFieldInfo = normalizeFieldInfo;
    function readFieldOptions(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      return options && options[extensionName] ? extensionType.fromJson(options[extensionName]) : void 0;
    }
    exports.readFieldOptions = readFieldOptions;
    function readFieldOption(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readFieldOption = readFieldOption;
    function readMessageOption(messageType, extensionName, extensionType) {
      const options = messageType.options;
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports.readMessageOption = readMessageOption;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js
var require_oneof = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectedOneofValue = exports.clearOneofValue = exports.setUnknownOneofValue = exports.setOneofValue = exports.getOneofValue = exports.isOneofGroup = void 0;
    function isOneofGroup(any) {
      if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
        return false;
      }
      switch (typeof any.oneofKind) {
        case "string":
          if (any[any.oneofKind] === void 0)
            return false;
          return Object.keys(any).length == 2;
        case "undefined":
          return Object.keys(any).length == 1;
        default:
          return false;
      }
    }
    exports.isOneofGroup = isOneofGroup;
    function getOneofValue(oneof, kind) {
      return oneof[kind];
    }
    exports.getOneofValue = getOneofValue;
    function setOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0) {
        oneof[kind] = value;
      }
    }
    exports.setOneofValue = setOneofValue;
    function setUnknownOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0 && kind !== void 0) {
        oneof[kind] = value;
      }
    }
    exports.setUnknownOneofValue = setUnknownOneofValue;
    function clearOneofValue(oneof) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = void 0;
    }
    exports.clearOneofValue = clearOneofValue;
    function getSelectedOneofValue(oneof) {
      if (oneof.oneofKind === void 0) {
        return void 0;
      }
      return oneof[oneof.oneofKind];
    }
    exports.getSelectedOneofValue = getSelectedOneofValue;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js
var require_reflection_type_check = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionTypeCheck = void 0;
    var reflection_info_1 = require_reflection_info();
    var oneof_1 = require_oneof();
    var ReflectionTypeCheck = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      prepare() {
        if (this.data)
          return;
        const req = [], known = [], oneofs = [];
        for (let field of this.fields) {
          if (field.oneof) {
            if (!oneofs.includes(field.oneof)) {
              oneofs.push(field.oneof);
              req.push(field.oneof);
              known.push(field.oneof);
            }
          } else {
            known.push(field.localName);
            switch (field.kind) {
              case "scalar":
              case "enum":
                if (!field.opt || field.repeat)
                  req.push(field.localName);
                break;
              case "message":
                if (field.repeat)
                  req.push(field.localName);
                break;
              case "map":
                req.push(field.localName);
                break;
            }
          }
        }
        this.data = { req, known, oneofs: Object.values(oneofs) };
      }
      /**
       * Is the argument a valid message as specified by the
       * reflection information?
       *
       * Checks all field types recursively. The `depth`
       * specifies how deep into the structure the check will be.
       *
       * With a depth of 0, only the presence of fields
       * is checked.
       *
       * With a depth of 1 or more, the field types are checked.
       *
       * With a depth of 2 or more, the members of map, repeated
       * and message fields are checked.
       *
       * Message fields will be checked recursively with depth - 1.
       *
       * The number of map entries / repeated values being checked
       * is < depth.
       */
      is(message, depth, allowExcessProperties = false) {
        if (depth < 0)
          return true;
        if (message === null || message === void 0 || typeof message != "object")
          return false;
        this.prepare();
        let keys = Object.keys(message), data = this.data;
        if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n)))
          return false;
        if (!allowExcessProperties) {
          if (keys.some((k) => !data.known.includes(k)))
            return false;
        }
        if (depth < 1) {
          return true;
        }
        for (const name of data.oneofs) {
          const group = message[name];
          if (!oneof_1.isOneofGroup(group))
            return false;
          if (group.oneofKind === void 0)
            continue;
          const field = this.fields.find((f) => f.localName === group.oneofKind);
          if (!field)
            return false;
          if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
            return false;
        }
        for (const field of this.fields) {
          if (field.oneof !== void 0)
            continue;
          if (!this.field(message[field.localName], field, allowExcessProperties, depth))
            return false;
        }
        return true;
      }
      field(arg, field, allowExcessProperties, depth) {
        let repeated = field.repeat;
        switch (field.kind) {
          case "scalar":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, field.T, depth, field.L);
            return this.scalar(arg, field.T, field.L);
          case "enum":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, reflection_info_1.ScalarType.INT32, depth);
            return this.scalar(arg, reflection_info_1.ScalarType.INT32);
          case "message":
            if (arg === void 0)
              return true;
            if (repeated)
              return this.messages(arg, field.T(), allowExcessProperties, depth);
            return this.message(arg, field.T(), allowExcessProperties, depth);
          case "map":
            if (typeof arg != "object" || arg === null)
              return false;
            if (depth < 2)
              return true;
            if (!this.mapKeys(arg, field.K, depth))
              return false;
            switch (field.V.kind) {
              case "scalar":
                return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
              case "enum":
                return this.scalars(Object.values(arg), reflection_info_1.ScalarType.INT32, depth);
              case "message":
                return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
            }
            break;
        }
        return true;
      }
      message(arg, type, allowExcessProperties, depth) {
        if (allowExcessProperties) {
          return type.isAssignable(arg, depth);
        }
        return type.is(arg, depth);
      }
      messages(arg, type, allowExcessProperties, depth) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (allowExcessProperties) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.isAssignable(arg[i], depth - 1))
              return false;
        } else {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.is(arg[i], depth - 1))
              return false;
        }
        return true;
      }
      scalar(arg, type, longType) {
        let argType = typeof arg;
        switch (type) {
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            switch (longType) {
              case reflection_info_1.LongType.BIGINT:
                return argType == "bigint";
              case reflection_info_1.LongType.NUMBER:
                return argType == "number" && !isNaN(arg);
              default:
                return argType == "string";
            }
          case reflection_info_1.ScalarType.BOOL:
            return argType == "boolean";
          case reflection_info_1.ScalarType.STRING:
            return argType == "string";
          case reflection_info_1.ScalarType.BYTES:
            return arg instanceof Uint8Array;
          case reflection_info_1.ScalarType.DOUBLE:
          case reflection_info_1.ScalarType.FLOAT:
            return argType == "number" && !isNaN(arg);
          default:
            return argType == "number" && Number.isInteger(arg);
        }
      }
      scalars(arg, type, depth, longType) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (Array.isArray(arg)) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!this.scalar(arg[i], type, longType))
              return false;
        }
        return true;
      }
      mapKeys(map, type, depth) {
        let keys = Object.keys(map);
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
          case reflection_info_1.ScalarType.UINT32:
            return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
          case reflection_info_1.ScalarType.BOOL:
            return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
          default:
            return this.scalars(keys, type, depth, reflection_info_1.LongType.STRING);
        }
      }
    };
    exports.ReflectionTypeCheck = ReflectionTypeCheck;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js
var require_reflection_long_convert = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionLongConvert = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionLongConvert(long, type) {
      switch (type) {
        case reflection_info_1.LongType.BIGINT:
          return long.toBigInt();
        case reflection_info_1.LongType.NUMBER:
          return long.toNumber();
        default:
          return long.toString();
      }
    }
    exports.reflectionLongConvert = reflectionLongConvert;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js
var require_reflection_json_reader = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionJsonReader = void 0;
    var json_typings_1 = require_json_typings();
    var base64_1 = require_base64();
    var reflection_info_1 = require_reflection_info();
    var pb_long_1 = require_pb_long();
    var assert_1 = require_assert();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var ReflectionJsonReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (this.fMap === void 0) {
          this.fMap = {};
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          for (const field of fieldsInput) {
            this.fMap[field.name] = field;
            this.fMap[field.jsonName] = field;
            this.fMap[field.localName] = field;
          }
        }
      }
      // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
      assert(condition, fieldName, jsonValue) {
        if (!condition) {
          let what = json_typings_1.typeofJsonValue(jsonValue);
          if (what == "number" || what == "boolean")
            what = jsonValue.toString();
          throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
        }
      }
      /**
       * Reads a message from canonical JSON format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(input, message, options) {
        this.prepare();
        const oneofsHandled = [];
        for (const [jsonKey, jsonValue] of Object.entries(input)) {
          const field = this.fMap[jsonKey];
          if (!field) {
            if (!options.ignoreUnknownFields)
              throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
            continue;
          }
          const localName = field.localName;
          let target;
          if (field.oneof) {
            if (jsonValue === null && (field.kind !== "enum" || field.T()[0] !== "google.protobuf.NullValue")) {
              continue;
            }
            if (oneofsHandled.includes(field.oneof))
              throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
            oneofsHandled.push(field.oneof);
            target = message[field.oneof] = {
              oneofKind: localName
            };
          } else {
            target = message;
          }
          if (field.kind == "map") {
            if (jsonValue === null) {
              continue;
            }
            this.assert(json_typings_1.isJsonObject(jsonValue), field.name, jsonValue);
            const fieldObj = target[localName];
            for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
              this.assert(jsonObjValue !== null, field.name + " map value", null);
              let val;
              switch (field.V.kind) {
                case "message":
                  val = field.V.T().internalJsonRead(jsonObjValue, options);
                  break;
                case "enum":
                  val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name + " map value", jsonObjValue);
              let key = jsonObjKey;
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = key == "true" ? true : key == "false" ? false : key;
              key = this.scalar(key, field.K, reflection_info_1.LongType.STRING, field.name).toString();
              fieldObj[key] = val;
            }
          } else if (field.repeat) {
            if (jsonValue === null)
              continue;
            this.assert(Array.isArray(jsonValue), field.name, jsonValue);
            const fieldArr = target[localName];
            for (const jsonItem of jsonValue) {
              this.assert(jsonItem !== null, field.name, null);
              let val;
              switch (field.kind) {
                case "message":
                  val = field.T().internalJsonRead(jsonItem, options);
                  break;
                case "enum":
                  val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonItem, field.T, field.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name, jsonValue);
              fieldArr.push(val);
            }
          } else {
            switch (field.kind) {
              case "message":
                if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
                  this.assert(field.oneof === void 0, field.name + " (oneof member)", null);
                  continue;
                }
                target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
                break;
              case "enum":
                let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
                if (val === false)
                  continue;
                target[localName] = val;
                break;
              case "scalar":
                target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
                break;
            }
          }
        }
      }
      /**
       * Returns `false` for unrecognized string representations.
       *
       * google.protobuf.NullValue accepts only JSON `null` (or the old `"NULL_VALUE"`).
       */
      enum(type, json, fieldName, ignoreUnknownFields) {
        if (type[0] == "google.protobuf.NullValue")
          assert_1.assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
        if (json === null)
          return 0;
        switch (typeof json) {
          case "number":
            assert_1.assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
            return json;
          case "string":
            let localEnumName = json;
            if (type[2] && json.substring(0, type[2].length) === type[2])
              localEnumName = json.substring(type[2].length);
            let enumNumber = type[1][localEnumName];
            if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
              return false;
            }
            assert_1.assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
            return enumNumber;
        }
        assert_1.assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
      }
      scalar(json, type, longType, fieldName) {
        let e;
        try {
          switch (type) {
            case reflection_info_1.ScalarType.DOUBLE:
            case reflection_info_1.ScalarType.FLOAT:
              if (json === null)
                return 0;
              if (json === "NaN")
                return Number.NaN;
              if (json === "Infinity")
                return Number.POSITIVE_INFINITY;
              if (json === "-Infinity")
                return Number.NEGATIVE_INFINITY;
              if (json === "") {
                e = "empty string";
                break;
              }
              if (typeof json == "string" && json.trim().length !== json.length) {
                e = "extra whitespace";
                break;
              }
              if (typeof json != "string" && typeof json != "number") {
                break;
              }
              let float = Number(json);
              if (Number.isNaN(float)) {
                e = "not a number";
                break;
              }
              if (!Number.isFinite(float)) {
                e = "too large or small";
                break;
              }
              if (type == reflection_info_1.ScalarType.FLOAT)
                assert_1.assertFloat32(float);
              return float;
            case reflection_info_1.ScalarType.INT32:
            case reflection_info_1.ScalarType.FIXED32:
            case reflection_info_1.ScalarType.SFIXED32:
            case reflection_info_1.ScalarType.SINT32:
            case reflection_info_1.ScalarType.UINT32:
              if (json === null)
                return 0;
              let int32;
              if (typeof json == "number")
                int32 = json;
              else if (json === "")
                e = "empty string";
              else if (typeof json == "string") {
                if (json.trim().length !== json.length)
                  e = "extra whitespace";
                else
                  int32 = Number(json);
              }
              if (int32 === void 0)
                break;
              if (type == reflection_info_1.ScalarType.UINT32)
                assert_1.assertUInt32(int32);
              else
                assert_1.assertInt32(int32);
              return int32;
            case reflection_info_1.ScalarType.INT64:
            case reflection_info_1.ScalarType.SFIXED64:
            case reflection_info_1.ScalarType.SINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.from(json), longType);
            case reflection_info_1.ScalarType.FIXED64:
            case reflection_info_1.ScalarType.UINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.from(json), longType);
            case reflection_info_1.ScalarType.BOOL:
              if (json === null)
                return false;
              if (typeof json !== "boolean")
                break;
              return json;
            case reflection_info_1.ScalarType.STRING:
              if (json === null)
                return "";
              if (typeof json !== "string") {
                e = "extra whitespace";
                break;
              }
              try {
                encodeURIComponent(json);
              } catch (e2) {
                e2 = "invalid UTF8";
                break;
              }
              return json;
            case reflection_info_1.ScalarType.BYTES:
              if (json === null || json === "")
                return new Uint8Array(0);
              if (typeof json !== "string")
                break;
              return base64_1.base64decode(json);
          }
        } catch (error) {
          e = error.message;
        }
        this.assert(false, fieldName + (e ? " - " + e : ""), json);
      }
    };
    exports.ReflectionJsonReader = ReflectionJsonReader;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js
var require_reflection_json_writer = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionJsonWriter = void 0;
    var base64_1 = require_base64();
    var pb_long_1 = require_pb_long();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var ReflectionJsonWriter = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      /**
       * Converts the message to a JSON object, based on the field descriptors.
       */
      write(message, options) {
        const json = {}, source = message;
        for (const field of this.fields) {
          if (!field.oneof) {
            let jsonValue2 = this.field(field, source[field.localName], options);
            if (jsonValue2 !== void 0)
              json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
            continue;
          }
          const group = source[field.oneof];
          if (group.oneofKind !== field.localName)
            continue;
          const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
          let jsonValue = this.field(field, group[field.localName], opt);
          assert_1.assert(jsonValue !== void 0);
          json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
        }
        return json;
      }
      field(field, value, options) {
        let jsonValue = void 0;
        if (field.kind == "map") {
          assert_1.assert(typeof value == "object" && value !== null);
          const jsonObj = {};
          switch (field.V.kind) {
            case "scalar":
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.scalar(field.V.T, entryValue, field.name, false, true);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "message":
              const messageType = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.message(messageType, entryValue, field.name, options);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "enum":
              const enumInfo = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                assert_1.assert(entryValue === void 0 || typeof entryValue == "number");
                const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
          }
          if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
            jsonValue = jsonObj;
        } else if (field.repeat) {
          assert_1.assert(Array.isArray(value));
          const jsonArr = [];
          switch (field.kind) {
            case "scalar":
              for (let i = 0; i < value.length; i++) {
                const val = this.scalar(field.T, value[i], field.name, field.opt, true);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "enum":
              const enumInfo = field.T();
              for (let i = 0; i < value.length; i++) {
                assert_1.assert(value[i] === void 0 || typeof value[i] == "number");
                const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "message":
              const messageType = field.T();
              for (let i = 0; i < value.length; i++) {
                const val = this.message(messageType, value[i], field.name, options);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
          }
          if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
            jsonValue = jsonArr;
        } else {
          switch (field.kind) {
            case "scalar":
              jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
              break;
            case "enum":
              jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
              break;
            case "message":
              jsonValue = this.message(field.T(), value, field.name, options);
              break;
          }
        }
        return jsonValue;
      }
      /**
       * Returns `null` as the default for google.protobuf.NullValue.
       */
      enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
        if (type[0] == "google.protobuf.NullValue")
          return !emitDefaultValues && !optional ? void 0 : null;
        if (value === void 0) {
          assert_1.assert(optional);
          return void 0;
        }
        if (value === 0 && !emitDefaultValues && !optional)
          return void 0;
        assert_1.assert(typeof value == "number");
        assert_1.assert(Number.isInteger(value));
        if (enumAsInteger || !type[1].hasOwnProperty(value))
          return value;
        if (type[2])
          return type[2] + type[1][value];
        return type[1][value];
      }
      message(type, value, fieldName, options) {
        if (value === void 0)
          return options.emitDefaultValues ? null : void 0;
        return type.internalJsonWrite(value, options);
      }
      scalar(type, value, fieldName, optional, emitDefaultValues) {
        if (value === void 0) {
          assert_1.assert(optional);
          return void 0;
        }
        const ed = emitDefaultValues || optional;
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assertInt32(value);
            return value;
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assertUInt32(value);
            return value;
          case reflection_info_1.ScalarType.FLOAT:
            assert_1.assertFloat32(value);
          case reflection_info_1.ScalarType.DOUBLE:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assert(typeof value == "number");
            if (Number.isNaN(value))
              return "NaN";
            if (value === Number.POSITIVE_INFINITY)
              return "Infinity";
            if (value === Number.NEGATIVE_INFINITY)
              return "-Infinity";
            return value;
          case reflection_info_1.ScalarType.STRING:
            if (value === "")
              return ed ? "" : void 0;
            assert_1.assert(typeof value == "string");
            return value;
          case reflection_info_1.ScalarType.BOOL:
            if (value === false)
              return ed ? false : void 0;
            assert_1.assert(typeof value == "boolean");
            return value;
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let ulong = pb_long_1.PbULong.from(value);
            if (ulong.isZero() && !ed)
              return void 0;
            return ulong.toString();
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let long = pb_long_1.PbLong.from(value);
            if (long.isZero() && !ed)
              return void 0;
            return long.toString();
          case reflection_info_1.ScalarType.BYTES:
            assert_1.assert(value instanceof Uint8Array);
            if (!value.byteLength)
              return ed ? "" : void 0;
            return base64_1.base64encode(value);
        }
      }
    };
    exports.ReflectionJsonWriter = ReflectionJsonWriter;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js
var require_reflection_scalar_default = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionScalarDefault = void 0;
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var pb_long_1 = require_pb_long();
    function reflectionScalarDefault(type, longType = reflection_info_1.LongType.STRING) {
      switch (type) {
        case reflection_info_1.ScalarType.BOOL:
          return false;
        case reflection_info_1.ScalarType.UINT64:
        case reflection_info_1.ScalarType.FIXED64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
        case reflection_info_1.ScalarType.INT64:
        case reflection_info_1.ScalarType.SFIXED64:
        case reflection_info_1.ScalarType.SINT64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
        case reflection_info_1.ScalarType.DOUBLE:
        case reflection_info_1.ScalarType.FLOAT:
          return 0;
        case reflection_info_1.ScalarType.BYTES:
          return new Uint8Array(0);
        case reflection_info_1.ScalarType.STRING:
          return "";
        default:
          return 0;
      }
    }
    exports.reflectionScalarDefault = reflectionScalarDefault;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js
var require_reflection_binary_reader = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionBinaryReader = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var ReflectionBinaryReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (!this.fieldNoToField) {
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
        }
      }
      /**
       * Reads a message from binary format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(reader, message, options, length) {
        this.prepare();
        const end = length === void 0 ? reader.len : reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
          if (!field) {
            let u = options.readUnknownField;
            if (u == "throw")
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? binary_format_contract_1.UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
            continue;
          }
          let target = message, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            target = target[field.oneof];
            if (target.oneofKind !== localName)
              target = message[field.oneof] = {
                oneofKind: localName
              };
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              let L = field.kind == "scalar" ? field.L : void 0;
              if (repeated) {
                let arr = target[localName];
                if (wireType == binary_format_contract_1.WireType.LengthDelimited && T != reflection_info_1.ScalarType.STRING && T != reflection_info_1.ScalarType.BYTES) {
                  let e = reader.uint32() + reader.pos;
                  while (reader.pos < e)
                    arr.push(this.scalar(reader, T, L));
                } else
                  arr.push(this.scalar(reader, T, L));
              } else
                target[localName] = this.scalar(reader, T, L);
              break;
            case "message":
              if (repeated) {
                let arr = target[localName];
                let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
                arr.push(msg);
              } else
                target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
              break;
            case "map":
              let [mapKey, mapVal] = this.mapEntry(field, reader, options);
              target[localName][mapKey] = mapVal;
              break;
          }
        }
      }
      /**
       * Read a map field, expecting key field = 1, value field = 2
       */
      mapEntry(field, reader, options) {
        let length = reader.uint32();
        let end = reader.pos + length;
        let key = void 0;
        let val = void 0;
        while (reader.pos < end) {
          let [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case 1:
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = reader.bool().toString();
              else
                key = this.scalar(reader, field.K, reflection_info_1.LongType.STRING);
              break;
            case 2:
              switch (field.V.kind) {
                case "scalar":
                  val = this.scalar(reader, field.V.T, field.V.L);
                  break;
                case "enum":
                  val = reader.int32();
                  break;
                case "message":
                  val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
                  break;
              }
              break;
            default:
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
          }
        }
        if (key === void 0) {
          let keyRaw = reflection_scalar_default_1.reflectionScalarDefault(field.K);
          key = field.K == reflection_info_1.ScalarType.BOOL ? keyRaw.toString() : keyRaw;
        }
        if (val === void 0)
          switch (field.V.kind) {
            case "scalar":
              val = reflection_scalar_default_1.reflectionScalarDefault(field.V.T, field.V.L);
              break;
            case "enum":
              val = 0;
              break;
            case "message":
              val = field.V.T().create();
              break;
          }
        return [key, val];
      }
      scalar(reader, type, longType) {
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            return reader.int32();
          case reflection_info_1.ScalarType.STRING:
            return reader.string();
          case reflection_info_1.ScalarType.BOOL:
            return reader.bool();
          case reflection_info_1.ScalarType.DOUBLE:
            return reader.double();
          case reflection_info_1.ScalarType.FLOAT:
            return reader.float();
          case reflection_info_1.ScalarType.INT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.int64(), longType);
          case reflection_info_1.ScalarType.UINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.uint64(), longType);
          case reflection_info_1.ScalarType.FIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.fixed64(), longType);
          case reflection_info_1.ScalarType.FIXED32:
            return reader.fixed32();
          case reflection_info_1.ScalarType.BYTES:
            return reader.bytes();
          case reflection_info_1.ScalarType.UINT32:
            return reader.uint32();
          case reflection_info_1.ScalarType.SFIXED32:
            return reader.sfixed32();
          case reflection_info_1.ScalarType.SFIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sfixed64(), longType);
          case reflection_info_1.ScalarType.SINT32:
            return reader.sint32();
          case reflection_info_1.ScalarType.SINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sint64(), longType);
        }
      }
    };
    exports.ReflectionBinaryReader = ReflectionBinaryReader;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js
var require_reflection_binary_writer = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReflectionBinaryWriter = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var pb_long_1 = require_pb_long();
    var ReflectionBinaryWriter = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        if (!this.fields) {
          const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
          this.fields = fieldsInput.sort((a, b) => a.no - b.no);
        }
      }
      /**
       * Writes the message to binary format.
       */
      write(message, writer, options) {
        this.prepare();
        for (const field of this.fields) {
          let value, emitDefault, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            const group = message[field.oneof];
            if (group.oneofKind !== localName)
              continue;
            value = group[localName];
            emitDefault = true;
          } else {
            value = message[localName];
            emitDefault = false;
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                if (repeated == reflection_info_1.RepeatType.PACKED)
                  this.packed(writer, T, field.no, value);
                else
                  for (const item of value)
                    this.scalar(writer, T, field.no, item, true);
              } else if (value === void 0)
                assert_1.assert(field.opt);
              else
                this.scalar(writer, T, field.no, value, emitDefault || field.opt);
              break;
            case "message":
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                for (const item of value)
                  this.message(writer, options, field.T(), field.no, item);
              } else {
                this.message(writer, options, field.T(), field.no, value);
              }
              break;
            case "map":
              assert_1.assert(typeof value == "object" && value !== null);
              for (const [key, val] of Object.entries(value))
                this.mapEntry(writer, options, field, key, val);
              break;
          }
        }
        let u = options.writeUnknownFields;
        if (u !== false)
          (u === true ? binary_format_contract_1.UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
      }
      mapEntry(writer, options, field, key, value) {
        writer.tag(field.no, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let keyValue = key;
        switch (field.K) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            keyValue = Number.parseInt(key);
            break;
          case reflection_info_1.ScalarType.BOOL:
            assert_1.assert(key == "true" || key == "false");
            keyValue = key == "true";
            break;
        }
        this.scalar(writer, field.K, 1, keyValue, true);
        switch (field.V.kind) {
          case "scalar":
            this.scalar(writer, field.V.T, 2, value, true);
            break;
          case "enum":
            this.scalar(writer, reflection_info_1.ScalarType.INT32, 2, value, true);
            break;
          case "message":
            this.message(writer, options, field.V.T(), 2, value);
            break;
        }
        writer.join();
      }
      message(writer, options, handler, fieldNo, value) {
        if (value === void 0)
          return;
        handler.internalBinaryWrite(value, writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited).fork(), options);
        writer.join();
      }
      /**
       * Write a single scalar value.
       */
      scalar(writer, type, fieldNo, value, emitDefault) {
        let [wireType, method, isDefault] = this.scalarInfo(type, value);
        if (!isDefault || emitDefault) {
          writer.tag(fieldNo, wireType);
          writer[method](value);
        }
      }
      /**
       * Write an array of scalar values in packed format.
       */
      packed(writer, type, fieldNo, value) {
        if (!value.length)
          return;
        assert_1.assert(type !== reflection_info_1.ScalarType.BYTES && type !== reflection_info_1.ScalarType.STRING);
        writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let [, method] = this.scalarInfo(type);
        for (let i = 0; i < value.length; i++)
          writer[method](value[i]);
        writer.join();
      }
      /**
       * Get information for writing a scalar value.
       *
       * Returns tuple:
       * [0]: appropriate WireType
       * [1]: name of the appropriate method of IBinaryWriter
       * [2]: whether the given value is a default value
       *
       * If argument `value` is omitted, [2] is always false.
       */
      scalarInfo(type, value) {
        let t = binary_format_contract_1.WireType.Varint;
        let m;
        let i = value === void 0;
        let d = value === 0;
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            m = "int32";
            break;
          case reflection_info_1.ScalarType.STRING:
            d = i || !value.length;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "string";
            break;
          case reflection_info_1.ScalarType.BOOL:
            d = value === false;
            m = "bool";
            break;
          case reflection_info_1.ScalarType.UINT32:
            m = "uint32";
            break;
          case reflection_info_1.ScalarType.DOUBLE:
            t = binary_format_contract_1.WireType.Bit64;
            m = "double";
            break;
          case reflection_info_1.ScalarType.FLOAT:
            t = binary_format_contract_1.WireType.Bit32;
            m = "float";
            break;
          case reflection_info_1.ScalarType.INT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "int64";
            break;
          case reflection_info_1.ScalarType.UINT64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            m = "uint64";
            break;
          case reflection_info_1.ScalarType.FIXED64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "fixed64";
            break;
          case reflection_info_1.ScalarType.BYTES:
            d = i || !value.byteLength;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "bytes";
            break;
          case reflection_info_1.ScalarType.FIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "fixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "sfixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "sfixed64";
            break;
          case reflection_info_1.ScalarType.SINT32:
            m = "sint32";
            break;
          case reflection_info_1.ScalarType.SINT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "sint64";
            break;
        }
        return [t, m, i || d];
      }
    };
    exports.ReflectionBinaryWriter = ReflectionBinaryWriter;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js
var require_reflection_create = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionCreate = void 0;
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var message_type_contract_1 = require_message_type_contract();
    function reflectionCreate(type) {
      const msg = type.messagePrototype ? Object.create(type.messagePrototype) : Object.defineProperty({}, message_type_contract_1.MESSAGE_TYPE, { value: type });
      for (let field of type.fields) {
        let name = field.localName;
        if (field.opt)
          continue;
        if (field.oneof)
          msg[field.oneof] = { oneofKind: void 0 };
        else if (field.repeat)
          msg[name] = [];
        else
          switch (field.kind) {
            case "scalar":
              msg[name] = reflection_scalar_default_1.reflectionScalarDefault(field.T, field.L);
              break;
            case "enum":
              msg[name] = 0;
              break;
            case "map":
              msg[name] = {};
              break;
          }
      }
      return msg;
    }
    exports.reflectionCreate = reflectionCreate;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js
var require_reflection_merge_partial = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionMergePartial = void 0;
    function reflectionMergePartial6(info, target, source) {
      let fieldValue, input = source, output;
      for (let field of info.fields) {
        let name = field.localName;
        if (field.oneof) {
          const group = input[field.oneof];
          if ((group === null || group === void 0 ? void 0 : group.oneofKind) == void 0) {
            continue;
          }
          fieldValue = group[name];
          output = target[field.oneof];
          output.oneofKind = group.oneofKind;
          if (fieldValue == void 0) {
            delete output[name];
            continue;
          }
        } else {
          fieldValue = input[name];
          output = target;
          if (fieldValue == void 0) {
            continue;
          }
        }
        if (field.repeat)
          output[name].length = fieldValue.length;
        switch (field.kind) {
          case "scalar":
          case "enum":
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = fieldValue[i];
            else
              output[name] = fieldValue;
            break;
          case "message":
            let T = field.T();
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = T.create(fieldValue[i]);
            else if (output[name] === void 0)
              output[name] = T.create(fieldValue);
            else
              T.mergePartial(output[name], fieldValue);
            break;
          case "map":
            switch (field.V.kind) {
              case "scalar":
              case "enum":
                Object.assign(output[name], fieldValue);
                break;
              case "message":
                let T2 = field.V.T();
                for (let k of Object.keys(fieldValue))
                  output[name][k] = T2.create(fieldValue[k]);
                break;
            }
            break;
        }
      }
    }
    exports.reflectionMergePartial = reflectionMergePartial6;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js
var require_reflection_equals = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectionEquals = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionEquals(info, a, b) {
      if (a === b)
        return true;
      if (!a || !b)
        return false;
      for (let field of info.fields) {
        let localName = field.localName;
        let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
        let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
        switch (field.kind) {
          case "enum":
          case "scalar":
            let t = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
            if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b)))
              return false;
            break;
          case "map":
            if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
              return false;
            break;
          case "message":
            let T = field.T();
            if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b)))
              return false;
            break;
        }
      }
      return true;
    }
    exports.reflectionEquals = reflectionEquals;
    var objectValues = Object.values;
    function primitiveEq(type, a, b) {
      if (a === b)
        return true;
      if (type !== reflection_info_1.ScalarType.BYTES)
        return false;
      let ba = a;
      let bb = b;
      if (ba.length !== bb.length)
        return false;
      for (let i = 0; i < ba.length; i++)
        if (ba[i] != bb[i])
          return false;
      return true;
    }
    function repeatedPrimitiveEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!primitiveEq(type, a[i], b[i]))
          return false;
      return true;
    }
    function repeatedMsgEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!type.equals(a[i], b[i]))
          return false;
      return true;
    }
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js
var require_message_type = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageType = void 0;
    var message_type_contract_1 = require_message_type_contract();
    var reflection_info_1 = require_reflection_info();
    var reflection_type_check_1 = require_reflection_type_check();
    var reflection_json_reader_1 = require_reflection_json_reader();
    var reflection_json_writer_1 = require_reflection_json_writer();
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    var reflection_create_1 = require_reflection_create();
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    var json_typings_1 = require_json_typings();
    var json_format_contract_1 = require_json_format_contract();
    var reflection_equals_1 = require_reflection_equals();
    var binary_writer_1 = require_binary_writer();
    var binary_reader_1 = require_binary_reader();
    var baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
    var MessageType7 = class {
      constructor(name, fields, options) {
        this.defaultCheckDepth = 16;
        this.typeName = name;
        this.fields = fields.map(reflection_info_1.normalizeFieldInfo);
        this.options = options !== null && options !== void 0 ? options : {};
        this.messagePrototype = Object.create(null, Object.assign(Object.assign({}, baseDescriptors), { [message_type_contract_1.MESSAGE_TYPE]: { value: this } }));
        this.refTypeCheck = new reflection_type_check_1.ReflectionTypeCheck(this);
        this.refJsonReader = new reflection_json_reader_1.ReflectionJsonReader(this);
        this.refJsonWriter = new reflection_json_writer_1.ReflectionJsonWriter(this);
        this.refBinReader = new reflection_binary_reader_1.ReflectionBinaryReader(this);
        this.refBinWriter = new reflection_binary_writer_1.ReflectionBinaryWriter(this);
      }
      create(value) {
        let message = reflection_create_1.reflectionCreate(this);
        if (value !== void 0) {
          reflection_merge_partial_1.reflectionMergePartial(this, message, value);
        }
        return message;
      }
      /**
       * Clone the message.
       *
       * Unknown fields are discarded.
       */
      clone(message) {
        let copy = this.create();
        reflection_merge_partial_1.reflectionMergePartial(this, copy, message);
        return copy;
      }
      /**
       * Determines whether two message of the same type have the same field values.
       * Checks for deep equality, traversing repeated fields, oneof groups, maps
       * and messages recursively.
       * Will also return true if both messages are `undefined`.
       */
      equals(a, b) {
        return reflection_equals_1.reflectionEquals(this, a, b);
      }
      /**
       * Is the given value assignable to our message type
       * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      is(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, false);
      }
      /**
       * Is the given value assignable to our message type,
       * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      isAssignable(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, true);
      }
      /**
       * Copy partial data into the target message.
       */
      mergePartial(target, source) {
        reflection_merge_partial_1.reflectionMergePartial(this, target, source);
      }
      /**
       * Create a new message from binary format.
       */
      fromBinary(data, options) {
        let opt = binary_reader_1.binaryReadOptions(options);
        return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
      }
      /**
       * Read a new message from a JSON value.
       */
      fromJson(json, options) {
        return this.internalJsonRead(json, json_format_contract_1.jsonReadOptions(options));
      }
      /**
       * Read a new message from a JSON string.
       * This is equivalent to `T.fromJson(JSON.parse(json))`.
       */
      fromJsonString(json, options) {
        let value = JSON.parse(json);
        return this.fromJson(value, options);
      }
      /**
       * Write the message to canonical JSON value.
       */
      toJson(message, options) {
        return this.internalJsonWrite(message, json_format_contract_1.jsonWriteOptions(options));
      }
      /**
       * Convert the message to canonical JSON string.
       * This is equivalent to `JSON.stringify(T.toJson(t))`
       */
      toJsonString(message, options) {
        var _a;
        let value = this.toJson(message, options);
        return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
      }
      /**
       * Write the message to binary format.
       */
      toBinary(message, options) {
        let opt = binary_writer_1.binaryWriteOptions(options);
        return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
      }
      /**
       * This is an internal method. If you just want to read a message from
       * JSON, use `fromJson()` or `fromJsonString()`.
       *
       * Reads JSON value and merges the fields into the target
       * according to protobuf rules. If the target is omitted,
       * a new instance is created first.
       */
      internalJsonRead(json, options, target) {
        if (json !== null && typeof json == "object" && !Array.isArray(json)) {
          let message = target !== null && target !== void 0 ? target : this.create();
          this.refJsonReader.read(json, message, options);
          return message;
        }
        throw new Error(`Unable to parse message ${this.typeName} from JSON ${json_typings_1.typeofJsonValue(json)}.`);
      }
      /**
       * This is an internal method. If you just want to write a message
       * to JSON, use `toJson()` or `toJsonString().
       *
       * Writes JSON value and returns it.
       */
      internalJsonWrite(message, options) {
        return this.refJsonWriter.write(message, options);
      }
      /**
       * This is an internal method. If you just want to write a message
       * in binary format, use `toBinary()`.
       *
       * Serializes the message in binary format and appends it to the given
       * writer. Returns passed writer.
       */
      internalBinaryWrite(message, writer, options) {
        this.refBinWriter.write(message, writer, options);
        return writer;
      }
      /**
       * This is an internal method. If you just want to read a message from
       * binary data, use `fromBinary()`.
       *
       * Reads data from binary format and merges the fields into
       * the target according to protobuf rules. If the target is
       * omitted, a new instance is created first.
       */
      internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create();
        this.refBinReader.read(reader, message, options, length);
        return message;
      }
    };
    exports.MessageType = MessageType7;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js
var require_reflection_contains_message_type = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.containsMessageType = void 0;
    var message_type_contract_1 = require_message_type_contract();
    function containsMessageType(msg) {
      return msg[message_type_contract_1.MESSAGE_TYPE] != null;
    }
    exports.containsMessageType = containsMessageType;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js
var require_enum_object = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listEnumNumbers = exports.listEnumNames = exports.listEnumValues = exports.isEnumObject = void 0;
    function isEnumObject(arg) {
      if (typeof arg != "object" || arg === null) {
        return false;
      }
      if (!arg.hasOwnProperty(0)) {
        return false;
      }
      for (let k of Object.keys(arg)) {
        let num = parseInt(k);
        if (!Number.isNaN(num)) {
          let nam = arg[num];
          if (nam === void 0)
            return false;
          if (arg[nam] !== num)
            return false;
        } else {
          let num2 = arg[k];
          if (num2 === void 0)
            return false;
          if (typeof num2 !== "number")
            return false;
          if (arg[num2] === void 0)
            return false;
        }
      }
      return true;
    }
    exports.isEnumObject = isEnumObject;
    function listEnumValues(enumObject) {
      if (!isEnumObject(enumObject))
        throw new Error("not a typescript enum object");
      let values = [];
      for (let [name, number] of Object.entries(enumObject))
        if (typeof number == "number")
          values.push({ name, number });
      return values;
    }
    exports.listEnumValues = listEnumValues;
    function listEnumNames(enumObject) {
      return listEnumValues(enumObject).map((val) => val.name);
    }
    exports.listEnumNames = listEnumNames;
    function listEnumNumbers(enumObject) {
      return listEnumValues(enumObject).map((val) => val.number).filter((num, index, arr) => arr.indexOf(num) == index);
    }
    exports.listEnumNumbers = listEnumNumbers;
  }
});

// ../node_modules/@protobuf-ts/runtime/build/commonjs/index.js
var require_commonjs = __commonJS({
  "../node_modules/@protobuf-ts/runtime/build/commonjs/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var json_typings_1 = require_json_typings();
    Object.defineProperty(exports, "typeofJsonValue", { enumerable: true, get: function() {
      return json_typings_1.typeofJsonValue;
    } });
    Object.defineProperty(exports, "isJsonObject", { enumerable: true, get: function() {
      return json_typings_1.isJsonObject;
    } });
    var base64_1 = require_base64();
    Object.defineProperty(exports, "base64decode", { enumerable: true, get: function() {
      return base64_1.base64decode;
    } });
    Object.defineProperty(exports, "base64encode", { enumerable: true, get: function() {
      return base64_1.base64encode;
    } });
    var protobufjs_utf8_1 = require_protobufjs_utf8();
    Object.defineProperty(exports, "utf8read", { enumerable: true, get: function() {
      return protobufjs_utf8_1.utf8read;
    } });
    var binary_format_contract_1 = require_binary_format_contract();
    Object.defineProperty(exports, "WireType", { enumerable: true, get: function() {
      return binary_format_contract_1.WireType;
    } });
    Object.defineProperty(exports, "mergeBinaryOptions", { enumerable: true, get: function() {
      return binary_format_contract_1.mergeBinaryOptions;
    } });
    Object.defineProperty(exports, "UnknownFieldHandler", { enumerable: true, get: function() {
      return binary_format_contract_1.UnknownFieldHandler;
    } });
    var binary_reader_1 = require_binary_reader();
    Object.defineProperty(exports, "BinaryReader", { enumerable: true, get: function() {
      return binary_reader_1.BinaryReader;
    } });
    Object.defineProperty(exports, "binaryReadOptions", { enumerable: true, get: function() {
      return binary_reader_1.binaryReadOptions;
    } });
    var binary_writer_1 = require_binary_writer();
    Object.defineProperty(exports, "BinaryWriter", { enumerable: true, get: function() {
      return binary_writer_1.BinaryWriter;
    } });
    Object.defineProperty(exports, "binaryWriteOptions", { enumerable: true, get: function() {
      return binary_writer_1.binaryWriteOptions;
    } });
    var pb_long_1 = require_pb_long();
    Object.defineProperty(exports, "PbLong", { enumerable: true, get: function() {
      return pb_long_1.PbLong;
    } });
    Object.defineProperty(exports, "PbULong", { enumerable: true, get: function() {
      return pb_long_1.PbULong;
    } });
    var json_format_contract_1 = require_json_format_contract();
    Object.defineProperty(exports, "jsonReadOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonReadOptions;
    } });
    Object.defineProperty(exports, "jsonWriteOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonWriteOptions;
    } });
    Object.defineProperty(exports, "mergeJsonOptions", { enumerable: true, get: function() {
      return json_format_contract_1.mergeJsonOptions;
    } });
    var message_type_contract_1 = require_message_type_contract();
    Object.defineProperty(exports, "MESSAGE_TYPE", { enumerable: true, get: function() {
      return message_type_contract_1.MESSAGE_TYPE;
    } });
    var message_type_1 = require_message_type();
    Object.defineProperty(exports, "MessageType", { enumerable: true, get: function() {
      return message_type_1.MessageType;
    } });
    var reflection_info_1 = require_reflection_info();
    Object.defineProperty(exports, "ScalarType", { enumerable: true, get: function() {
      return reflection_info_1.ScalarType;
    } });
    Object.defineProperty(exports, "LongType", { enumerable: true, get: function() {
      return reflection_info_1.LongType;
    } });
    Object.defineProperty(exports, "RepeatType", { enumerable: true, get: function() {
      return reflection_info_1.RepeatType;
    } });
    Object.defineProperty(exports, "normalizeFieldInfo", { enumerable: true, get: function() {
      return reflection_info_1.normalizeFieldInfo;
    } });
    Object.defineProperty(exports, "readFieldOptions", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOptions;
    } });
    Object.defineProperty(exports, "readFieldOption", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOption;
    } });
    Object.defineProperty(exports, "readMessageOption", { enumerable: true, get: function() {
      return reflection_info_1.readMessageOption;
    } });
    var reflection_type_check_1 = require_reflection_type_check();
    Object.defineProperty(exports, "ReflectionTypeCheck", { enumerable: true, get: function() {
      return reflection_type_check_1.ReflectionTypeCheck;
    } });
    var reflection_create_1 = require_reflection_create();
    Object.defineProperty(exports, "reflectionCreate", { enumerable: true, get: function() {
      return reflection_create_1.reflectionCreate;
    } });
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    Object.defineProperty(exports, "reflectionScalarDefault", { enumerable: true, get: function() {
      return reflection_scalar_default_1.reflectionScalarDefault;
    } });
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    Object.defineProperty(exports, "reflectionMergePartial", { enumerable: true, get: function() {
      return reflection_merge_partial_1.reflectionMergePartial;
    } });
    var reflection_equals_1 = require_reflection_equals();
    Object.defineProperty(exports, "reflectionEquals", { enumerable: true, get: function() {
      return reflection_equals_1.reflectionEquals;
    } });
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    Object.defineProperty(exports, "ReflectionBinaryReader", { enumerable: true, get: function() {
      return reflection_binary_reader_1.ReflectionBinaryReader;
    } });
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    Object.defineProperty(exports, "ReflectionBinaryWriter", { enumerable: true, get: function() {
      return reflection_binary_writer_1.ReflectionBinaryWriter;
    } });
    var reflection_json_reader_1 = require_reflection_json_reader();
    Object.defineProperty(exports, "ReflectionJsonReader", { enumerable: true, get: function() {
      return reflection_json_reader_1.ReflectionJsonReader;
    } });
    var reflection_json_writer_1 = require_reflection_json_writer();
    Object.defineProperty(exports, "ReflectionJsonWriter", { enumerable: true, get: function() {
      return reflection_json_writer_1.ReflectionJsonWriter;
    } });
    var reflection_contains_message_type_1 = require_reflection_contains_message_type();
    Object.defineProperty(exports, "containsMessageType", { enumerable: true, get: function() {
      return reflection_contains_message_type_1.containsMessageType;
    } });
    var oneof_1 = require_oneof();
    Object.defineProperty(exports, "isOneofGroup", { enumerable: true, get: function() {
      return oneof_1.isOneofGroup;
    } });
    Object.defineProperty(exports, "setOneofValue", { enumerable: true, get: function() {
      return oneof_1.setOneofValue;
    } });
    Object.defineProperty(exports, "getOneofValue", { enumerable: true, get: function() {
      return oneof_1.getOneofValue;
    } });
    Object.defineProperty(exports, "clearOneofValue", { enumerable: true, get: function() {
      return oneof_1.clearOneofValue;
    } });
    Object.defineProperty(exports, "getSelectedOneofValue", { enumerable: true, get: function() {
      return oneof_1.getSelectedOneofValue;
    } });
    var enum_object_1 = require_enum_object();
    Object.defineProperty(exports, "listEnumValues", { enumerable: true, get: function() {
      return enum_object_1.listEnumValues;
    } });
    Object.defineProperty(exports, "listEnumNames", { enumerable: true, get: function() {
      return enum_object_1.listEnumNames;
    } });
    Object.defineProperty(exports, "listEnumNumbers", { enumerable: true, get: function() {
      return enum_object_1.listEnumNumbers;
    } });
    Object.defineProperty(exports, "isEnumObject", { enumerable: true, get: function() {
      return enum_object_1.isEnumObject;
    } });
    var lower_camel_case_1 = require_lower_camel_case();
    Object.defineProperty(exports, "lowerCamelCase", { enumerable: true, get: function() {
      return lower_camel_case_1.lowerCamelCase;
    } });
    var assert_1 = require_assert();
    Object.defineProperty(exports, "assert", { enumerable: true, get: function() {
      return assert_1.assert;
    } });
    Object.defineProperty(exports, "assertNever", { enumerable: true, get: function() {
      return assert_1.assertNever;
    } });
    Object.defineProperty(exports, "assertInt32", { enumerable: true, get: function() {
      return assert_1.assertInt32;
    } });
    Object.defineProperty(exports, "assertUInt32", { enumerable: true, get: function() {
      return assert_1.assertUInt32;
    } });
    Object.defineProperty(exports, "assertFloat32", { enumerable: true, get: function() {
      return assert_1.assertFloat32;
    } });
  }
});

// ../node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// ../shared/protos/Error.ts
var import_runtime = __toESM(require_commonjs());
var import_runtime2 = __toESM(require_commonjs());
var import_runtime3 = __toESM(require_commonjs());
var import_runtime4 = __toESM(require_commonjs());
var Error$Type = class extends import_runtime4.MessageType {
  constructor() {
    super("Error", [
      {
        no: 1,
        name: "message",
        kind: "scalar",
        T: 9
        /*ScalarType.STRING*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.message = "";
    if (value !== void 0)
      (0, import_runtime3.reflectionMergePartial)(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string message */
        1:
          message.message = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? import_runtime2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.message !== "")
      writer.tag(1, import_runtime.WireType.LengthDelimited).string(message.message);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? import_runtime2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Error2 = new Error$Type();

// ../shared/protos/RequestMoneyFromMentorResponse.ts
var import_runtime5 = __toESM(require_commonjs());
var import_runtime6 = __toESM(require_commonjs());
var import_runtime7 = __toESM(require_commonjs());
var import_runtime8 = __toESM(require_commonjs());
var RequestMoneyFromMentorResponse$Type = class extends import_runtime8.MessageType {
  constructor() {
    super("RequestMoneyFromMentorResponse", [
      {
        no: 1,
        name: "money",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "hasMentorGivenMoney",
        kind: "scalar",
        T: 8
        /*ScalarType.BOOL*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.money = 0;
    message.hasMentorGivenMoney = false;
    if (value !== void 0)
      (0, import_runtime7.reflectionMergePartial)(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 money */
        1:
          message.money = reader.uint32();
          break;
        case /* bool hasMentorGivenMoney */
        2:
          message.hasMentorGivenMoney = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.money !== 0)
      writer.tag(1, import_runtime5.WireType.Varint).uint32(message.money);
    if (message.hasMentorGivenMoney !== false)
      writer.tag(2, import_runtime5.WireType.Varint).bool(message.hasMentorGivenMoney);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var RequestMoneyFromMentorResponse = new RequestMoneyFromMentorResponse$Type();

// ../shared/protos/Message.ts
var import_runtime16 = __toESM(require_commonjs());
var import_runtime17 = __toESM(require_commonjs());
var import_runtime18 = __toESM(require_commonjs());
var import_runtime19 = __toESM(require_commonjs());

// ../shared/protos/SynchronizedState.ts
var import_runtime9 = __toESM(require_commonjs());
var import_runtime10 = __toESM(require_commonjs());
var import_runtime11 = __toESM(require_commonjs());
var import_runtime12 = __toESM(require_commonjs());
var SynchronizedState$Type = class extends import_runtime12.MessageType {
  constructor() {
    super("SynchronizedState", [
      {
        no: 1,
        name: "money",
        kind: "scalar",
        T: 13
        /*ScalarType.UINT32*/
      },
      {
        no: 2,
        name: "hasMentorGivenMoney",
        kind: "scalar",
        T: 8
        /*ScalarType.BOOL*/
      }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.money = 0;
    message.hasMentorGivenMoney = false;
    if (value !== void 0)
      (0, import_runtime11.reflectionMergePartial)(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint32 money */
        1:
          message.money = reader.uint32();
          break;
        case /* bool hasMentorGivenMoney */
        2:
          message.hasMentorGivenMoney = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? import_runtime10.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.money !== 0)
      writer.tag(1, import_runtime9.WireType.Varint).uint32(message.money);
    if (message.hasMentorGivenMoney !== false)
      writer.tag(2, import_runtime9.WireType.Varint).bool(message.hasMentorGivenMoney);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? import_runtime10.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var SynchronizedState = new SynchronizedState$Type();

// ../shared/protos/RequestMoneyFromMentor.ts
var import_runtime13 = __toESM(require_commonjs());
var import_runtime14 = __toESM(require_commonjs());
var import_runtime15 = __toESM(require_commonjs());
var RequestMoneyFromMentor$Type = class extends import_runtime15.MessageType {
  constructor() {
    super("RequestMoneyFromMentor", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== void 0)
      (0, import_runtime14.reflectionMergePartial)(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    return target ?? this.create();
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? import_runtime13.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var RequestMoneyFromMentor = new RequestMoneyFromMentor$Type();

// ../shared/protos/Message.ts
var Message$Type = class extends import_runtime19.MessageType {
  constructor() {
    super("Message", [
      { no: 1, name: "requestMoneyFromMentor", kind: "message", oneof: "body", T: () => RequestMoneyFromMentor },
      { no: 2, name: "requestMoneyFromMentorResponse", kind: "message", oneof: "body", T: () => RequestMoneyFromMentorResponse },
      { no: 3, name: "error", kind: "message", oneof: "body", T: () => Error2 },
      { no: 4, name: "synchronizedState", kind: "message", oneof: "body", T: () => SynchronizedState }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.body = { oneofKind: void 0 };
    if (value !== void 0)
      (0, import_runtime18.reflectionMergePartial)(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* RequestMoneyFromMentor requestMoneyFromMentor */
        1:
          message.body = {
            oneofKind: "requestMoneyFromMentor",
            requestMoneyFromMentor: RequestMoneyFromMentor.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentor)
          };
          break;
        case /* RequestMoneyFromMentorResponse requestMoneyFromMentorResponse */
        2:
          message.body = {
            oneofKind: "requestMoneyFromMentorResponse",
            requestMoneyFromMentorResponse: RequestMoneyFromMentorResponse.internalBinaryRead(reader, reader.uint32(), options, message.body.requestMoneyFromMentorResponse)
          };
          break;
        case /* Error error */
        3:
          message.body = {
            oneofKind: "error",
            error: Error2.internalBinaryRead(reader, reader.uint32(), options, message.body.error)
          };
          break;
        case /* SynchronizedState synchronizedState */
        4:
          message.body = {
            oneofKind: "synchronizedState",
            synchronizedState: SynchronizedState.internalBinaryRead(reader, reader.uint32(), options, message.body.synchronizedState)
          };
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? import_runtime17.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.body.oneofKind === "requestMoneyFromMentor")
      RequestMoneyFromMentor.internalBinaryWrite(message.body.requestMoneyFromMentor, writer.tag(1, import_runtime16.WireType.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "requestMoneyFromMentorResponse")
      RequestMoneyFromMentorResponse.internalBinaryWrite(message.body.requestMoneyFromMentorResponse, writer.tag(2, import_runtime16.WireType.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "error")
      Error2.internalBinaryWrite(message.body.error, writer.tag(3, import_runtime16.WireType.LengthDelimited).fork(), options).join();
    if (message.body.oneofKind === "synchronizedState")
      SynchronizedState.internalBinaryWrite(message.body.synchronizedState, writer.tag(4, import_runtime16.WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? import_runtime17.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
};
var Message = new Message$Type();

// ../shared/clientServerCommunication/messageFactories.ts
function createRequestMoneyFromMentorResponse(requestMoneyFromMentorResponse) {
  return Message.create({
    body: {
      oneofKind: "requestMoneyFromMentorResponse" /* RequestMoneyFromMentorResponse */,
      requestMoneyFromMentorResponse
    }
  });
}
function createError(error) {
  return Message.create({
    body: {
      oneofKind: "error" /* Error */,
      error
    }
  });
}
function createSynchronizedState(synchronizedState) {
  return Message.create({
    body: {
      oneofKind: "synchronizedState" /* SynchronizedState */,
      synchronizedState
    }
  });
}

// src/server.mts
var GameServer = class {
  money = 0;
  hasMentorGivenMoney = false;
  listen() {
    const webSocketServer = new import_websocket_server.default({ port: 8080 });
    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("error", console.error);
      webSocket.on("message", (data) => {
        console.log("data", data);
        const message = Message.fromBinary(data);
        if (message.body.oneofKind === "requestMoneyFromMentor" /* RequestMoneyFromMentor */) {
          console.log("RequestMoneyFromMentor", message);
          try {
            const updatedState = this.requestMoneyFromMentor();
            webSocket.send(
              Message.toBinary(
                createRequestMoneyFromMentorResponse(
                  RequestMoneyFromMentorResponse.create(updatedState)
                )
              )
            );
          } catch (error) {
            webSocket.send(
              Message.toBinary(
                createError(
                  Error2.create({
                    message: error.message
                  })
                )
              )
            );
          }
        }
      });
      webSocket.send(
        Message.toBinary(
          createSynchronizedState({
            money: this.money,
            hasMentorGivenMoney: this.hasMentorGivenMoney
          })
        )
      );
    });
  }
  requestMoneyFromMentor() {
    if (this.hasMentorGivenMoney) {
      throw new Error(
        "The mentor has already given money and only gives money once."
      );
    } else {
      this.money += 50;
      this.hasMentorGivenMoney = true;
      return {
        money: this.money,
        hasMentorGivenMoney: this.hasMentorGivenMoney
      };
    }
  }
};
var server = new GameServer();
server.listen();
//# sourceMappingURL=server.js.map
