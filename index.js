var fileStore = require('./lib/fileStore');
var uuid = require('uuid');

function generateSessionId(req) {
  return uuid.v4();
}

module.exports = function(opts) {
  opts = opts || {};
  var store = opts.store || new fileStore(opts);
  var generateId = opts.genid || generateSessionId;
  if (typeof generateId !== 'function') {
    throw new TypeError('genid option must be a function');
  }

  return function(req, next) {
    if (req.session) {
      return next();
    }

    // expose store
    req.sessionStore = store;

    if (req.sessionID) {
      store.get(req.sessionID, function(err, sess){
        if (err) {
          req.reject('#INVALID_SESSION');
          return next(err);
        }
        store.createSession(req, sess);
        next();
      });
    } else {
      // if no session passed from browser
      req.sessionID = generateId(req);
      store.createSession(req, {});
      next();
    }
  }
};
