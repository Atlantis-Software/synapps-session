var _ = require('lodash');

var session = function(req, data) {
  this.req = req;
  this.id = this.req.sessionID;
  _.assign(this, data);
};

/**
 * Remove id and req from session's data
 * to avoid circular reference in serialization.
 *
 * @return {object}
 * @api public
 */

session.prototype.toJSON = function() {
  var data = _.pickBy(this, function(value, key) {
    if (key === 'id' || key === 'req' || _.isFunction(value)) {
      return false;
    }
    return true;
  });
  return data;
}

/**
 * Regenerate this request's session.
 *
 * @param {Function} cb
 * @return {Session} for chaining
 * @api public
 */

session.prototype.regenerate = function(cb) {
  this.req.sessionStore.regenerate(this.req, cb);
  return this;
}

/**
 * Destroy `this` session.
 *
 * @param {Function} cb
 * @return {Session} for chaining
 * @api public
 */

session.prototype.destroy = function(cb) {
  delete this.req.session;
  this.req.sessionStore.destroy(this.id, cb);
  return this;
}

/**
 * Re-loads the session data _without_ altering
 * the maxAge properties. Invokes the callback `cb(err)`,
 * after which time if no exception has occurred the
 * `req.session` property will be a new `Session` object,
 * although representing the same session.
 *
 * @param {Function} cb
 * @return {Session} for chaining
 * @api public
 */

session.prototype.reload = function(cb) {
  var self = this;
  this.req.sessionStore.get(this.id, function(err, sess){
    if (err) {
      return cb(err);
    }
    if (!sess) {
      return cb(new Error('failed to load session'));
    }
    self.req.sessionStore.createSession(self.req, sess);
    cb();
  });
  return this;
}

/**
 * Save the session data with optional callback `cb(err)`.
 *
 * @param {Function} cb
 * @return {Session} for chaining
 * @api public
 */

session.prototype.save = function(cb) {
  this.req.sessionStore.set(this.id, this, cb || function(){});
  return this;
}

/**
 * Update session to prevent
 * from expiring when it is still active.
 *
 * @return {Session} for chaining
 * @api public
 */

session.prototype.touch = function(cb) {
  this.req.sessionStore.touch(this.id, this, cb || function(){});
  return this;
}

module.exports = session;