const fs = require('fs');
const dns = require('dns');
// Use reliable public DNS resolvers (Google & Cloudflare) for SRV records
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const logFile = __dirname + '/mongo_diag.txt';
function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

log('Testing DNS SRV resolution with 8.8.8.8...');
dns.resolveSrv('_mongodb._tcp.febluxury.g5gwn.mongodb.net', (err, addresses) => {
  if (err) {
    log('SRV Lookup Error: ' + err.message);
  } else {
    log('SRV Lookup Success: ' + JSON.stringify(addresses));
  }

  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();

  const url = process.env.DB_URL;
  log('Connecting with mongoose...');
  mongoose.connect(url, { serverSelectionTimeoutMS: 15000 })
    .then(() => {
      log('SUCCESS: Connected to database ' + mongoose.connection.name);
      return mongoose.connection.db.listCollections().toArray();
    })
    .then(cols => {
      log('Collections found: ' + cols.map(c => c.name).join(', '));
      process.exit(0);
    })
    .catch(mErr => {
      log('Mongoose Connect Error: ' + mErr.message);
      process.exit(1);
    });
});
