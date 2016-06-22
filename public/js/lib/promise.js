//@namespace lib.promise
// Copyright (C) 2013:
//    Alex Russell <slightlyoff@chromium.org>
//    Yehuda Katz
//
// Use of this source code is governed by
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Async Utilities
//

// Borrowed from RSVP.js
var browserGlobal = this;
var create;
var async;
var defineProperties;
var MutationObserver = browserGlobal.MutationObserver ||
    browserGlobal.WebKitMutationObserver;

if (Object.create) {
    create = function() {
        return Object.create.apply(Object, arguments);
    }
} else {
    create = function(proto, extend) {
        var O = function(){};
        var o;
        if (proto) {
            for (var key in proto) {
                Object.prototype = proto[key];
            }
            if (proto.constuctor) {
                Object.prototype.constuctor = proto.constuctor;
            }
        }
        o = new O();
        if (extend) {
            defineProperties(o, extend);
        }
        return o;
    }
}

if (Object.defineProperties) {
    defineProperties = function() {
        return Object.defineProperties.apply(Object, arguments);
    }
} else {
    defineProperties = function(obj, properties) {
        for (var key in properties) {
            var property = properties[key];
            if (property.enumerable != null &&
                property.configurable != null &&
                property.writable != null &&
                property.value != null) {
                obj[key] = property.value;
            } else {
                obj[key] = property;
            }
        }
        return obj;
    }
}

if (MutationObserver) {
    var queue = [];

    var observer = new MutationObserver(function() {
        var toProcess = queue.slice();
        queue = [];
        toProcess.forEach(function(tuple) {
            tuple[0].call(tuple[1]);
        });
    });

    var element = document.createElement('div');
    observer.observe(element, {
        attributes: true
    });

    // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
    window.addEventListener('unload', function() {
        observer.disconnect();
        observer = null;
    });

    async = function(callback, binding) {
        queue.push([callback, binding]);
        element.setAttribute('drainQueue', 'drainQueue');
    };
} else {
    async = function(callback, binding) {
        setTimeout(function() {
            callback.call(binding);
        }, 1);
    };
}

//
// Object Model Utilities
//

// defineProperties utilities
var _readOnlyProperty = function(v) {
    return {
        enumerable: true,
        configurable: false,
        get: v
    };
};

var _method = function(v, e, c, w) {
    return {
        enumerable: !!(e || 0),
        configurable: !!(c || 1),
        writable: !!(w || 1),
        value: v || function() {}
    };
};

var _pseudoPrivate = function(v) {
    return _method(v, 0, 1, 0);
};
var _public = function(v) {
    return _method(v, 1);
};

//
// Promises Utilities
//

function isThenable(any) {
    if (any === undefined)
        return false;
    try {
        var f = any.then;
        if (typeof f == "function") {
            return true;
        }
    } catch (e) { /*squelch*/ }
    return false;
};

var AlreadyResolved = function(name) {
    Error.call(this, name);
};
AlreadyResolved.prototype = create(Error.prototype);

var Backlog = function() {
    var bl = [];
    bl.pump = function(value) {
        async(function() {
            var l = bl.length;
            var x = 0;
            while (x < l) {
                x++;
                bl.shift()(value);
            }
        });
    };
    return bl;
};

//
// Resolver Constuctor
//

var Resolver = function(future,
    fulfillCallbacks,
    rejectCallbacks,
    setValue,
    setError,
    setState) {
    var isResolved = false;

    var resolver = this;
    var fulfill = function(value) {
        // console.log("queueing fulfill with:", value);
        async(function() {
            setState("fulfilled");
            setValue(value);
            // console.log("fulfilling with:", value);
            fulfillCallbacks.pump(value);
        });
    };
    var reject = function(reason) {
        // console.log("queuing reject with:", reason);
        async(function() {
            setState("rejected");
            setError(reason);
            // console.log("rejecting with:", reason);
            rejectCallbacks.pump(reason);
        });
    };
    var resolve = function(value) {
        if (isThenable(value)) {
            value.then(resolve, reject);
            return;
        }
        fulfill(value);
    };
    var ifNotResolved = function(func, name) {
        return function(value) {
            if (!isResolved) {
                isResolved = true;
                func(value);
            } else {
                if (typeof console != "undefined") {
                    console.error("Cannot resolve a Promise multiple times.");
                }
            }
        };
    };

    // Indirectly resolves the Promise, chaining any passed Promise's resolution
    this.resolve = ifNotResolved(resolve, "resolve");

    // Directly fulfills the future, no matter what value's type is
    this.fulfill = ifNotResolved(fulfill, "fulfill");

    // Rejects the future
    this.reject = ifNotResolved(reject, "reject");

    this.cancel = function() {
        resolver.reject(new Error("Cancel"));
    };
    this.timeout = function() {
        resolver.reject(new Error("Timeout"));
    };

    setState("pending");
};

//
// Promise Constuctor
//

//@export =Promise
function Promise(init) {
    var fulfillCallbacks = new Backlog();
    var rejectCallbacks = new Backlog();
    var value;
    var error;
    var state = "pending";

    defineProperties(this, {
        _addAcceptCallback: _pseudoPrivate(
            function(cb) {
                // console.log("adding fulfill callback:", cb);
                fulfillCallbacks.push(cb);
                if (state == "fulfilled") {
                    fulfillCallbacks.pump(value);
                }
            }
        ),
        _addRejectCallback: _pseudoPrivate(
            function(cb) {
                // console.log("adding reject callback:", cb);
                rejectCallbacks.push(cb);
                if (state == "rejected") {
                    rejectCallbacks.pump(error);
                }
            }
        )
    });
    var r = new Resolver(this,
        fulfillCallbacks, rejectCallbacks,
        function(v) {
            value = v;
        },
        function(e) {
            error = e;
        },
        function(s) {
            state = s;
        });

    var resolve = function() {
        r.resolve.apply(r, arguments);
    }
    resolve.resolve = function() {
        r.resolve.apply(r, arguments);
    }

    var reject = function() {
        r.reject.apply(r, arguments);
    }
    resolve.reject = function() {
        r.reject.apply(r, arguments);
    }

    try {
        if (init) {
            init(resolve, reject);
        }
    } catch (e) {
        console.error(e.message, e.stack);
        r.reject(e);
    }
};

//
// Consructor
//

var isCallback = function(any) {
    return (typeof any == "function");
};

// Used in .then()
var wrap = function(callback, resolver, disposition) {
    if (!isCallback(callback)) {
        // If we don't get a callback, we want to forward whatever resolution we get
        //return resolver[disposition].bind(resolver);
        var func = resolver[disposition];
        return resolver[disposition] = function() {
            func.apply(resolver, arguments);
        }
    }

    return function() {
        try {
            var r = callback.apply(null, arguments);
            resolver.resolve(r);
        } catch (e) {
            // Exceptions reject the resolver
            console.error(e.message, e.stack);
            resolver.reject(e);
        }
    };
};

var addCallbacks = function(onfulfill, onreject, scope) {
    if (isCallback(onfulfill)) {
        scope._addAcceptCallback(onfulfill);
    }
    if (isCallback(onreject)) {
        scope._addRejectCallback(onreject);
    }
    return scope;
};

//
// Prototype properties
//

Promise.prototype = create(null, {
    "then": _public(function(onfulfill, onreject) {
        // The logic here is:
        //    We return a new Promise whose resolution merges with the return from
        //    onfulfill() or onerror(). If onfulfill() returns a Promise, we forward
        //    the resolution of that future to the resolution of the returned
        //    Promise.
        var f = this;
        return new Promise(function(r) {
            addCallbacks(wrap(onfulfill, r, "resolve"),
                wrap(onreject, r, "reject"), f);
        });
    }),
    "catch": _public(function(onreject) {
        var f = this;
        return new Promise(function(r) {
            addCallbacks(null, wrap(onreject, r, "reject"), f);
        });
    })
});

//
// Statics
//

var toPromiseList = function(list) {
    if (list.length === 1 && list[0] instanceof Array) {
        list = list[0];
    }
    return Array.prototype.slice.call(list).map(Promise.resolve);
};

Promise.race = Promise.any = function( /*...futuresOrValues*/ ) {
    var futures = toPromiseList(arguments);
    return new Promise(function(r) {
        if (!futures.length) {
            r.reject("No futures passed to Promise.any()");
        } else {
            var complete = false;
            futures.forEach(function(f) {
                f.then(function(value) {
                    if (complete) {
                        return;
                    }
                    complete = true;
                    r.resolve(value);
                }, function(reason) {
                    if (complete) {
                        return;
                    }
                    complete = true;
                    r.reject(reason);
                });
            });
        }
    });
};

Promise.all = Promise.every = function( /*...futuresOrValues*/ ) {
    var futures = toPromiseList(arguments);
    return new Promise(function(r) {
        if (!futures.length) {
            r.reject("No futures passed to Promise.every()");
        } else {
            var values = new Array(futures.length);
            var count = 0;
            var complete = false;
            futures.forEach(function(f, i) {
                f.then(function (value) {
                    if (complete) {
                        return;
                    }
                    values[i] = value;
                    if (++count == futures.length) {
                        complete = true;
                        r.resolve(values);
                    }
                }, function(reason) {
                    if (complete) {
                        return;
                    }
                    complete = true;
                    r.reject(reason);
                });
            });
        }
    });
};

Promise.some = function(/*...futuresOrValues*/) {
    var futures = toPromiseList(arguments);
    return new Promise(function(r) {
        if (!futures.length) {
            r.reject("No futures passed to Promise.some()");
        } else {
            var reasons = new Array(futures.length);
            var count = 0;
            var complete = false;
            futures.forEach(function(f, i) {
                f.then(function(value) {
                    if (complete) {
                        return;
                    }
                    complete = true;
                    r.resolve(value);
                }, function(reason) {
                    if (complete) {
                        return;
                    }
                    reasons[i] = reason;
                    if (++count == futures.length) {
                        complete = true;
                        r.reject(reasons);
                    }
                });
            });
        }
    });
};

Promise.fulfill = function(value) {
    return new Promise(function(r) {
        r.fulfill(value);
    });
};

Promise.resolve = function(value) {
    return new Promise(function(r) {
        r.resolve(value);
    });
};

Promise.reject = function(reason) {
    return new Promise(function(r) {
        r.reject(reason);
    });
};

Promise.defer = function() {
    var resolver;
    var deferred = {
        promise: new Promise(function(r) {
            resolver = r;
        })
    };

    ['resolve', 'reject', 'fulfill', 'timeout', 'cancel'].forEach(function(key) {
        deferred[key] = function() {
            resolver[key].apply(key, arguments);
        }
    });

    return deferred;
}

// 兼容Zepto和jQuery的Deferred
Promise.deferred = function() {
    var resolver;
    var promise = new Promise(function(r) {
        resolver = r;
    });
    var deferred = {};

    ['resolve', 'reject', 'fulfill', 'timeout', 'cancel'].forEach(function(key) {
        deferred[key] = function() {
            resolver[key].apply(key, arguments);
        }
    });

    deferred.promise = function(obj) {
        if (obj) {
            ['then', 'catch'].forEach(function(key) {
                obj[key] = function() {
                    return promise[key].apply(promise, arguments);
                }
            })
            return obj;
        } else {
            return promise;
        }
    }

    return deferred;
}
