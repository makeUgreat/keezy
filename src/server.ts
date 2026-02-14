import fs from 'fs';
import https from 'https';
import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Keezy running on http://localhost:${config.port} [${config.nodeEnv}]`);
});

if (config.tlsCert && config.tlsKey) {
  const tlsOptions = {
    cert: fs.readFileSync(config.tlsCert),
    key: fs.readFileSync(config.tlsKey),
  };
  https.createServer(tlsOptions, app).listen(config.tlsPort, () => {
    console.log(`Keezy running on https://localhost:${config.tlsPort} [${config.nodeEnv}]`);
  });
}