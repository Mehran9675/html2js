#!/usr/bin/env node
const fs = require("fs");
const html2js = require("./html2js");

const args = process.argv;
const html = fs.readFileSync(args[2], "utf8");
console.log(JSON.stringify(html2js(html), null, 1));

module.exports = html2js;
