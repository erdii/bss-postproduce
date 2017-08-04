#!/usr/bin/env node

const glob = require("glob");
const { minify }= require("html-minifier");
const fs = require("fs");
const async = require("async");
const { exec } = require("child_process");

const exportPath = process.argv[1];
const version = process.argv[2];

// html-minification
function minifyHTMLFile(filename, cb) {
	fs.readFile(filename, function(err, data) {
		if (err != null) {
			console.log("A fs error occured:", err);
			cb(err);
		} else {
			const miniHtml = minify(data.toString("utf8"), {
				removeComments: true,
				removeTagWhitespace: true,
				sortClassName: true,
				sortAttributes: true,
				collapseWhitespace: true,
				collapseInlineTagWhitespace: true,
			});

			console.log(filename, miniHtml.substr(0, 50));

			fs.writeFile(filename, miniHtml.replace("styles.min.css", `styles.min.css?v=${version}`), cb);
		}
	});
}

// kick off the minifier!
glob(exportPath + "/**/*.html", function(err, files) {
	if (err != null) {
		console.log("A globbing error occured:", err);
		process.exit(1);
	}

	async.eachLimit(files, 5, minifyHTMLFile, function(err) {
		if (err != null) {
			process.exit(1);
		} else {
			console.log("successfully minified and css-versioned %d html files", files.length);
		}
	});
});
