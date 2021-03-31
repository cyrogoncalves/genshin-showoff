import { Db, MongoClient } from 'mongodb';

export let db: Db;

console.log("connecting db...");
MongoClient.connect(process.env.MONGO_URI_SHOWOFF,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.error(err);
        return;
      }
      db = client.db("GenshinShowoff");
      console.log("GenshinShowoff db connected.");
    });
