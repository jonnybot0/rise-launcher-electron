'use strict';

let fs = require('fs');
let marked = require('marked');
let path = require('path');
let camelcase = require('camelcase');

let fileNames = fs.readdirSync(__dirname);
let markdownFiles = fileNames.filter((fileName) => /\.md$/.test(fileName));
let messages = {};

for (let fileName of markdownFiles) {
  let message = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  // Trim the extension '.md'
  // and apply camelCase
  let messageName = camelcase(fileName.substr(0, fileName.length - 3));
  messages[messageName] = marked(message);
}

module.exports = messages;
