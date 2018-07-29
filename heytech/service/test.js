#!/usr/bin/env node

var heytech = require('./heytech');

heytech.rollershutter('13','up');

setTimeout(function() {
heytech.rollershutter('13','off');
}, 1000);


