# Node.js Fundamentals

## What is Node.js?
Node.js is a runtime environment that allows us to run JavaScript outside of a web browser. It uses the V8 JavaScript engine and gives JavaScript access to things like files, the operating system, and servers.

## How does Node.js differ from running JavaScript in the browser?
JavaScript in the browser mainly works with web pages and browser features such as the DOM. Node.js runs JavaScript outside the browser and can work with the file system, operating system, environment variables, and servers.

## What is the V8 engine, and how does Node use it?
V8 is Google's JavaScript engine. It executes JavaScript code by converting it into machine instructions. Node.js uses the V8 engine to run JavaScript outside the browser and adds features for working with the operating system and file system.

## What are some key use cases for Node.js?
Some common uses for Node.js are building web servers and APIs, creating command-line tools, building real-time applications, and writing scripts and development tools.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**
```js
const fs = require("fs");

module.exports = fs;

**ES Modules (supported in modern Node.js):**
```js
import fs from "fs";

export default fs;