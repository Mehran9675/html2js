#!/usr/bin/env node
const fs = require("fs");
const html2json = require("./html2json");

const [file] = process.argv;

fs.readFile(file, (err, data) => {
  console.log(JSON.stringify(data, null, 1));
});

module.exports = html2json;
