var fs = require('fs'),
	Q = require('q'),
	Process = require('../model/process'),
    events = require('events'),
    readDir = Q.nbind(fs.readdir),
    renameFile = Q.nbind(fs.rename);



var DataLoadService = function(opts) {
	this.rootPath = opts.rootFilePath;
	this.db = opts.db;
	this.opts = opts;
};

DataLoadService.prototype = new events.EventEmitter;


DataLoadService.prototype.load = function() {
	var opts = this,
		rootPath = opts.rootPath;

	/**
	 *  Read root directory.
	 */
	readDir.call(opts, rootPath)


	/**
	 * Filter out Node specific directories.
	 */
	.then(function(directories) {
		return directories.filter(function(directory) {
			if (directory.match(/node_modules$/)) {
				return false;
			} else if (directory.match(/package.json$/)) {
				return false;
			} else {
				return true;
			}
		});
	})	

	/**
	 * Gather all processes for this run.
	 */
	.then(PRIVATE.processDirectories(opts))

	/**
	 * Run processes.
	 */	
	.then(function(processes) {
		var p = processes.map(function(process) {
			return process.execute();
		});
		Q.all(p)

	   /**
	    * Processes complete.  Close DB Connection.
	    */		
		.then(function() {
			console.log("All files processed.");
			PRIVATE.closeDB(opts.db);
		})

	   /**
	    * Handle any exceptions.
	    */		
		.fail(function(error) {
			console.log(error);
			throw error;
		})	

	   /**
	    * Terminate promise chain.
	    */		
		.done();		

	})

};

module.exports = DataLoadService;

/**
 * DataLoad private methods.
 */
var PRIVATE = {

	/*
	 * ProcessDirectories will interogate a file path
	 * defined by rootPath attribute of config.json, 
	 * and determine all load processes needed to be execute.
	 * RETURN: Process[]
	 */
	processDirectories : function(opts) {
		return function(directories) {
			var deferred = Q.defer(),
				rootPath = opts.rootPath,
				promises = [],
				processes = [];

			/**
			 * Make a promise to process each directory.
			 */
			directories.forEach(function(directory) {
				promises.push(PRIVATE.processDirectory(directory, opts));
			});

			/**
			 * Run promises.
			 */			
			Q.all(promises)

			/**
			 * Promises have been fulfilled.
			 * Extract all Process models.
			 */			
			.then(function() {
				promises.forEach(function(promise) {
					if (Q.isFulfilled(promise)) {
						processes = processes.concat(promise.valueOf());
					}
				});
				return processes;
			})

			/**
			 *
			 */			
			.then(function(processes) {
				deferred.resolve(processes);
			})

		   /**
	 		* Handle any exceptions.
	 		*/				
			.fail(function(error) {
				console.log(error);
				throw error;
			})

		   /**
	 		* Terminate promise chain.
	 		*/				
			.done();

			return deferred.promise;
		}
	},

	/**
	 * ProcessDirectory is a helper method for the pluralized method of same name.
	 * Will search a directory for all files in need of processing.
	 * RETURN: Process[]
	 */
	processDirectory : function(directory, opts) {
		var rootPath = opts.rootPath,
		    deferred = Q.defer(),
		    makeProcesses = Q.nbind(PRIVATE.makeProcesses, opts),
		    module = rootPath + directory + "\\process",
		    processor = require(module);

		/**
		 * Read all files from parameterized directory.
		 */
		readDir.call(opts, rootPath + directory)

		/**
		 * Mark files as ready to process, 
		 * and filter out non-processable files.
		 */
		.then(function(files) {
			return files.filter(PRIVATE.filterFile(rootPath, directory));
		})

		.then(function(files) {
			return PRIVATE.makeProcesses(rootPath, directory, processor, opts)(files);
		})

		.then(function(processes) {
			deferred.resolve(processes);
		})

		/**
		 * Handle any exceptions.
		 */
		.fail(function(error) {
			console.log(error);
			throw error;
		})

		/**
		 * Terminate promise chain.
		 */
		.done();

		return deferred.promise;

	},

	/**
	 * FilterFile contains logic related to which
	 * files are eligible for processing.
	 * It is also responsible for initialize file as inprocess.
	 * RETURN: boolean
	 */
	filterFile : function(rootPath, directory) {
		return function(file) {
			if (file.match(/.*\.json.inprocess$/)) {
				return true;
			} else if (file.match(/.*\.json$/)) {
				renameFile.call(file, rootPath + directory + "\\" + file, rootPath + directory + "\\" + file + ".inprocess")
				.then(function() {
					file = file + ".inprocess";
					return true;
				})
				.fail(function(error) {
					console.log(error);
					throw error;
				})			
				.done();

				return false;
			}
			return false;
		}
	},

	/**
	 * MakeProcesses will take a list of files ready for processing
	 * and create a Process model for each.
	 * RETURN: Process[]
	 */
	makeProcesses : function(rootPath, directory, processor, opts) {
		return function(files) {
			return files.map(function(file) {
				return new Process(rootPath + directory, file, processor, opts);
			});
		}
	},


	closeDB : function(db) {
		db.close(true, function(err, result) {
			if (err) {
				console.log("Failure.");
				console.log(err);
				throw err;
			}
			console.log("Database connection closed.");
			console.log("Finished.");
		});
	}
}

