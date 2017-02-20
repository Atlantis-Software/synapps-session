var session = require('./session');

var store = function() {};

/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} cb
 * @api public
 */

store.prototype.regenerate = function(req, cb) {
  var self = this;
  this.destroy(req.sessionID, function(err) {
    self.set(req.sessionID, {}, function(err, sess) {
      if (err) {
        return cb(err);
      }
      req.session = self.createSession(req, {});
      cb();
    });
  });
};

/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */

store.prototype.createSession = function(req, sess) {
  req.session = new session(req, sess);
  return req.session;
};

module.exports = store;
