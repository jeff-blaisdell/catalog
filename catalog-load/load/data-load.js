var fs = require('fs'),
    events = require('events');

var DataLoad = function() {
	// Defined by sub classes.
	this.databaseTable = undefined;
	this.db = undefined;
};

DataLoad.prototype = new events.EventEmitter;


DataLoad.prototype.insert = function(id, record, callback) {
	var self = this;
	var table = self.databaseTable;
	var db = self.db;

	db.collection(table).insert({_id : id, record : record });


};

module.exports = DataLoad;