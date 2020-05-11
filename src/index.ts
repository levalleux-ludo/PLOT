import express = require('express');
import app from './api.controller';
import girService from './gir.service';
import { today, addDays } from './utils';

const port = 8080 || process.env.PORT;

const maxDay = today();
const minDay = addDays(maxDay, -15);
girService.load(minDay.valueOf(), maxDay.valueOf(), './records');

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
