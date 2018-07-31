#!/usr/bin/env node

import heytech from './heytech';

heytech.rollershutter('13', 'up');

setTimeout(function () {
    heytech.rollershutter('13', 'off');
}, 1000);


