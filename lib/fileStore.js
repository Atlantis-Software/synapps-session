var fs = require('fs');
var path = require('path');
var os = require('os');
var store = require('./store');

var HEADER_SIZE = 20;

function fullpath(key) {
  return path.join(PATH, PREFIX + key);
};

var fileStore = function(opts) {
  opts = opts || {};
  this.folder = opts.folder || os.tmpdir();
  this.prefix = opts.prefix || 'SESSION_';
  this.maxAge = opts.maxAge || 72000000;
};

fileStore.prototype = new store();

fileStore.prototype._fullpath = function(sessionID) {
  return path.join(this.folder, this.prefix + sessionID);
};

/**
 * Destroy the session associated with the given session ID.
 *var session = require('./session');
 * @param {string} sessionId
 * @public
 */

fileStore.prototype.destroy = function(sessionId, cb) {
  fs.unlink(this._fullpath(sessionId), cb);
};

/**
 * Fetch session by the given session ID.
 *
 * @param {string} sessionId
 * @param {function} cb
 * @public
 */

fileStore.prototype.get = function(sessionId, cb) {
  var self = this;
  var headerStream = fs.createReadStream(this._fullpath(sessionId), { start: 0, end: HEADER_SIZE - 1 });
  var header = '';
  headerStream.on('error', function(err) {
    headerStream.destroy();
    if (err.code === 'ENOENT') {
      return cb(new Error("#INVALID_SESSION"));
    }
    cb(err);
  });
  headerStream.on('data', function(data) {
    header += data.toString();
  });
  headerStream.on('end', function() {
    var time = parseInt(header);
    // if cache is valid
    if (time >= new Date().getTime() || time === 0) {
      var content = '';
      var contentStream = fs.createReadStream(self._fullpath(sessionId), { start: HEADER_SIZE });
      contentStream.on('error', function(err) {
        contentStream.destroy();
        cb(err);
      });
      contentStream.on('data', function(data) {
        content += data.toString();
      });
      contentStream.on('end', function() {
        var session;
        var err;
        if (content === 'UNDEFINED') {
          return cb(null);
        }
        try {
          session = JSON.parse(content);
        } catch (e) {
          err = e;
        }
        if (err) {
          return cb(err);
        }
        cb(null, session);
      });
    } else {
      cb(new Error("#INVALID_SESSION"));
    }
  });
};

/**
 * Commit the given session associated with the given sessionId to the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} cb
 * @public
 */

fileStore.prototype.set = function(sessionId, session, cb) {
  var cb = cb || function() { };
  var valid = new Date().getTime() + this.maxAge;
  var content;
  if (session === void 0) {
    content = 'UNDEFINED';
  } else {
    content = JSON.stringify(session);
  }
  var header = valid.toString();
  var pad = HEADER_SIZE - header.length;
  for (var i = 0; i < pad; i++) {
    header += ' ';
  }
  var sessionCreateStream = fs.createWriteStream(this._fullpath(sessionId));
  sessionCreateStream.on('error', function(err) {
    __debug.error('Session write error', err);
    cb(err);
    cb = function() { };
  });
  sessionCreateStream.on('finish', cb);
  sessionCreateStream.write(header + content);
  sessionCreateStream.end();
};

/**
 * Touch the given session object associated with the given session ID.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} cb
 * @public
 */

fileStore.prototype.touch = function(sessionId, session, cb) {
  var valid = new Date().getTime() + this.maxAge;
  var header = valid.toString();
  var pad = HEADER_SIZE - header.length;
  for (var i = 0; i < pad; i++) {
    header += ' ';
  }
  fs.open(this._fullpath(sessionId), 'r+', function(err, fd) {
    if (err) {
      return cb(err);
    }
    fs.write(fd, valid, 0, function(err) {
      if (err) {
        return cb(err);
      }
      cb();
    });
  });
};

module.exports = fileStore;
