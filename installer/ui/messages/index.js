'use strict';

let fs = require('fs');
let marked = require('marked');
let renderer = new marked.Renderer();
let path = require('path');
let camelcase = require('camelcase');

let fileNames = fs.readdirSync(__dirname);
let markdownFiles = fileNames.filter((fileName) => /\.md$/.test(fileName));
let messages = {};

renderer.link = (href, title, text)=>{
  title = title ? `title="${title}"` : "";
  return `<a href="${href}" ${title} target="_blank">${text}</a>`
};

for (let fileName of markdownFiles) {
  let message = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  // Trim the extension '.md'
  // and apply camelCase
  let messageName = camelcase(fileName.substr(0, fileName.length - 3));
  messages[messageName] = marked(message, {renderer: renderer});
}

module.exports = messages;
