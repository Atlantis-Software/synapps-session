# synapps-session

[![npm version](https://badge.fury.io/js/%40synapps%2Fsession.svg)](https://badge.fury.io/js/%40synapps%2Fsession)
[![Build](https://travis-ci.org/Atlantis-Software/synapps-session.svg?branch=master)](https://travis-ci.org/Atlantis-Software/synapps-session)
[![Coverage Status](https://coveralls.io/repos/github/Atlantis-Software/synapps-session/badge.svg?branch=master)](https://coveralls.io/github/Atlantis-Software/synapps-session?branch=master)
[![NSP Status](https://nodesecurity.io/orgs/atlantis/projects/d5bab00c-95c6-4c71-a85d-d1d7d6c00e7c/badge)](https://nodesecurity.io/orgs/atlantis/projects/d5bab00c-95c6-4c71-a85d-d1d7d6c00e7c)
[![Dependencies Status](https://david-dm.org/Atlantis-Software/synapps-session.svg)](https://david-dm.org/Atlantis-Software/synapps-session)

## Installation


This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install @synapps/session
```

## API

```js
var session = require('@synapps/session');
```

### session(options)

create a session middleware with the given `options`.

#### Options

`synapps/session` accepts these properties in the options object.

```js
var app = synapps();
app.use(session({
  maxAge: 60000
}));
```


##### genid

Function to call to generate a new session ID. Provide a function that returns
a string that will be used as a session ID. The function is given `req` as the
first argument if you want to use some value attached to `req` when generating
the ID.

##### store

The session store instance, defaults to a new `fileStore` instance.

##### maxAge

Specifies the time (in milliseconds) a session is valid. by default 72000000.

### req.session

To store or access session data, simply use the request property `req.session`,
which is (generally) serialized as JSON by the store, so nested objects
are typically fine. For example below is a user-specific view counter:

```js
// Use the session middleware
app.use(session())

// Access the session as req.session
app.route('user', {
  login: [
    {
      input: {
        username: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      }
    }, function(req){
      var sess = req.session
      if (sess.views) {
       sess.views++;
       req.resolve({views: sess.views});
     } else {
       sess.views = 1
     }
     sess.save();
     req.resolve({views: sess.views});
  }]
});
```


#### Session.regenerate(callback)

To regenerate the session simply invoke the method. Once complete,
a new SID and `Session` instance will be initialized at `req.session`
and the `callback` will be invoked.

```js
req.session.regenerate(function(err) {
  // will have a new session here
})
```

#### Session.destroy(callback)

Destroys the session and will unset the `req.session` property.
Once complete, the `callback` will be invoked.

```js
req.session.destroy(function(err) {
  // cannot access session here
})
```

#### Session.reload(callback)

Reloads the session data from the store and re-populates the
`req.session` object. Once complete, the `callback` will be invoked.

```js
req.session.reload(function(err) {
  // session updated
})
```

#### Session.save(callback)

Save the session back to the store, replacing the contents on the store with the
contents in memory (though a store may do something else--consult the store's
documentation for exact behavior).

```js
req.session.save(function(err) {
  // session saved
})
```

#### Session.touch()

Updates the `.maxAge` property. Typically this is
not necessary to call, as the session middleware does this for you.

### req.session.id

Each session has a unique ID associated with it. This property will
contain the session ID and cannot be modified.

### req.sessionID

To get the ID of the loaded session, access the request property
`req.sessionID`. This is simply a read-only value set when a session
is loaded/created.

## Session Store Implementation

### store.destroy(sid, callback)

This required method is used to destroy/delete a session from the store given
a session ID (`sid`). The `callback` should be called as `callback(error)` once
the session is destroyed.

### store.get(sid, callback)

This required method is used to get a session from the store given a session
ID (`sid`). The `callback` should be called as `callback(error, session)`.

The `session` argument should be a session if found, otherwise `null` or
`undefined` if the session was not found (and there was no error). A special
case is made when `error.code === 'ENOENT'` to act like `callback(null, null)`.

### store.set(sid, session, callback)

This required method is used to upsert a session into the store given a
session ID (`sid`) and session (`session`) object. The callback should be
called as `callback(error)` once the session has been set in the store.

### store.touch(sid, session, callback)

This recommended method is used to "touch" a given session given a
session ID (`sid`) and session (`session`) object. The `callback` should be
called as `callback(error)` once the session has been touched.

This is primarily used when the store will automatically delete idle sessions
and this method is used to signal to the store the given session is active,
potentially resetting the idle timer.


## License

[MIT](LICENSE)
