
var _ = require('lodash');

module.exports = function(self, options) {

  self.newInstance = function() {
    return self.apos.schemas.newInstance(self.schema);
  };

  self.find = function(req, criteria, projection) {
    var cursor = self.apos.docs.find(req, criteria, projection);
    require('./cursor.js')(self, cursor);
    return cursor;
  };

  self.addListFilters = function(req, filters, cursor) {

    _.each(filters, function(value, name) {
      if (_.has(cursor.filters, name) && cursor.filters.safeFor) {
        value = cursor.filters[name].launder(value);
        cursor[name](value);
      }
    });
  };

  // middleware for JSON API routes that expect the ID of
  // an existing piece at req.body._id
  self.requirePiece = function(req, res, next) {
    return self.find(req, { _id: req.body._id }).permission('edit').toObject(function(err, _piece) {
      if (err) {
        return self.apiResponse(res, err);
      }
      if (!piece) {
        return self.apiResponse(res, 'notfound');
      }
      req.piece = _piece;
      return next();
    });
  };

  self.list = function(req, callback) {
    var cursor = self.find(req);
    var filters = req.body || {};
    self.addListFilters(req, filters, cursor);
    var results = {};
    return async.series({
      toCount: function(callback) {
        return cursor.toCount(function(err, count) {
          if (err) {
            return callback(err);
          }
          results.total = count;
          results.skip = cursor.get('skip');
          results.limit = cursor.get('limit');
          results.page = cursor.get('page');
          return callback(null);
        });
      },
      toArray: function(callback) {
        return cursor.toArray(function(err, pieces) {
          if (err) {
            return callback(err);
          }
          results.pieces = pieces;
          return callback(null);
        });
      }
    }, function(err) {
      if (err) {
        return callback(err);
      }
      return callback(null, results);
    });
  };

  self.insert = function(req, piece, callback) {
    self.apos.docs.insert(req, piece, callback);
  };

  self.update = function(req, piece, callback) {
    self.apos.docs.update(req, piece, callback);
  };

  self.beforeCreate = function(req, piece, callback) {
    return setImmediate(callback);
  };

  self.afterCreate = function(req, piece, callback) {
    return setImmediate(callback);
  };

  self.beforeUpdate = function(req, piece, callback) {
    return setImmediate(callback);
  };

  self.afterUpdate = function(req, piece, callback) {
    return setImmediate(callback);
  };

  self.beforeList = function(req, pieces, callback) {
    return setImmediate(callback);
  };

  self.afterList = function(req, pieces, callback) {
    return setImmediate(callback);
  };

  self.apiResponse = function(res, err, data) {
    if (err) {
      if (typeof(err) !== 'string') {
        err = 'error';
      }
      return res.send({ status: err });
    } else {
      return res.send({ status: 'ok', data: data });
    }
  };

};