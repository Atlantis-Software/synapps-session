var fs = require('fs');
var path = require('path');
var os = require('os');
var assert = require('assert');
var Session = require('../lib/session');
var fileStore = require('../lib/fileStore');

var FOLDER = os.tmpdir();
var PREFIX = 'SESSION_TEST_';
var SESSIONID = 'TEST_SESSION';

var store = new fileStore({
  folder: FOLDER,
  prefix: PREFIX,
  maxAge: 10000
});

var SESSION_FILE_PATH = path.join(FOLDER, PREFIX + SESSIONID);

describe('Session', function() {
  var req = {
    sessionID: SESSIONID,
    sessionStore: store
  };
  req.session = new Session(req, {});

  it('regenerate: should (re)create a new session', function(done) {
    req.session.regenerate(function(err) {
      if (err) {
        return done(err);
      }
      assert(req.session, 'request should contain the session object');
      assert(fs.existsSync(SESSION_FILE_PATH), 'fileStore should create a new file for session');
      done();
    });
  });

  it('touch: should update session time', function(done) {
    var before = fs.readFileSync(SESSION_FILE_PATH);
    req.session.touch(function(err) {
      if (err) {
        return done(err);
      }
      var touched = fs.readFileSync(SESSION_FILE_PATH);
      assert(before !== touched, 'session file content should change');
      done();
    });
  });

  it('save: should save the session', function(done) {
    req.session.test = true;
    req.session.save(function(err) {
      if (err) {
        return done(err);
      }
      store.get(SESSIONID, function(err) {
        if (err) { 
          return done(err);
        }
        assert.equal(req.session.test, true, 'session should be saved');
        done();
      });
    });
  });

  it('reload: should reload session data', function(done) {
    req.session.test = false;
    req.session.reload(function(err) {
      if (err) {
        return done(err);
      }
      assert.equal(req.session.test, true, 'session should be reloaded');
      done();
    });
  });

  it('destroy: should delete the session', function(done) {
    req.session.destroy(function(err) {
      if (err) {
        return done(err);
      }
      assert(!req.session, 'request should not contain a session object');
      assert(!fs.existsSync(SESSION_FILE_PATH), 'fileStore should delete the file session');
      done();
    });
  });
});