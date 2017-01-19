#!/bin/bash
// >&/dev/null;exec node --harmony-async-await $0 $@


process.env.TS_NODE_FAST = true;

// require("ts-babel-node/register");
// require("babel-polyfill");

require("./dist");
