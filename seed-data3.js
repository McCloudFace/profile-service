// Data generation for json file output

// Start timer
let start = new Date();

const mongoose = require('mongoose');
const Profile = require('./models/profile');
// const fs = require('fs');
const faker = require('faker');

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/profileService',
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.on('error', (err) => {
  console.error.bind(console, 'DB connection error: ');
});
db.once('open', () => {
  console.log('...Mongoose connected');
});

// How many datas?
let batchSize = 100000;
let batch = 1;
let profilesBatch;

const getRandomImg = () => {
  let imgId = Math.floor(Math.random() * (10000 - 5)) + 4;
  return (
    'http://graph.facebook.com/v2.5/' + imgId + '/picture?height=200&width=200'
  );
};

const makeBatch = () => {
  profilesBatch = [];
  // Get that fake data
  for (let i = 0; i < batchSize; i++) {
    let profile = new Profile({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      location: faker.address.city() + ', ' + faker.address.state(),
      dateJoined: faker.date.month(),
      bio: faker.lorem.sentence(),
      photoUrl: getRandomImg(),
      pro: 0,
      activities: [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word()
      ]
    });
    profilesBatch.push(profile);
  }
};

const saveBatches = () => {
  makeBatch();
  return new Promise(function(resolve, reject) {
    Profile.insertMany(profilesBatch, (err, docs) => {
      if (err) {
        console.error('...insertMany error: ', err);
      } else {
        console.log(`...Batch ${batch} saved`);
        resolve();
      }
    });
  });
};

let makeAndSave = async () => {
  while (batch < 100) {
    await saveBatches();
    batch++;
    // console.log(batch);
  }
  let end = new Date();
  let seconds = (end.getTime() - start.getTime()) / 1000;
  console.log(
    `... ⏰  Done! Wrote 10,000,000 records to DB in ${seconds} seconds`
  );
};

makeAndSave();