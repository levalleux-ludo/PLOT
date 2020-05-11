import express = require('express');
import bodyParser = require('body-parser');
import girService from './gir.service';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/gir', (req: express.Request, res: express.Response) => {
  // return infos about the Global Infection Records
  const infos = girService.getInfos();
  if (!infos) {
    res.status(500).send('Cannot get Infos from service');
  } else {
    res.status(200).json(infos);
  }
});

app.get(
  '/gir/:day(\\d+)/:index(\\d+)',
  (req: express.Request, res: express.Response) => {
    const day = +req.params.day;
    const index = +req.params.index;
    try {
      // return URL of the 'index'th record for given day
      const gir = girService.getARecord(day, index);
      if (!gir) {
        res
          .status(404)
          .send(`No record found for day ${day} with index ${index}`);
      } else {
        const buckets = [].slice.call(gir.getBuckets());
        res.status(200).json(buckets);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

app.get(
  '/gir/:day(\\d+)/count',
  (req: express.Request, res: express.Response) => {
    const day = +req.params.day;
    // return the number of records for the given day
    const count = girService.getNbRecords(day);
    res.status(200).send({ count });
  }
);

app.put('/gir/:day', (req: express.Request, res: express.Response) => {
  const day = +req.params.day;
  // get data from body
  const bloomFilterData = req.body;
  // merge data into the global infection record of the given day
  try {
    girService.mergeIntoRecord(day, bloomFilterData);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

// module.exports = app;
export default app;
