#!/usr/bin/env node


// var heytech = require('../service/heytech');
//
// heytech.rollershutter('9', 'down');
//
// setTimeout(function () {
//     heytech.rollershutter('9', 'off');
// }, 1000);

var heytechReader = require('../service/heytechReader');

// heytechReader.klima().then(console.log);
heytechReader.oeffnungsProzent().then(console.log);



