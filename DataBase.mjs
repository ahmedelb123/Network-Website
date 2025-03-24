// This class handle database functionalities;

import { MongoAPIError, MongoClient, ServerApiVersion } from "mongodb";

export class DataBase {
  constructor(username, password, database, server) {
    const encodeUsername = encodeURIComponent(username);
    const encodePassword = encodeURIComponent(password);

    const uri = `mongodb+srv://${encodeUsername}:${encodePassword}@${server}/?retryWrites=true&w=majority`;
    console.log(uri);
    //create client
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      tls: true,
      tlsInsecure: true,
    });
    this.database = this.client.db(database);
    this.connected = false;
  }
  async connect() {
    if (!this.connected) {
      try {
        await this.client.connect();
        this.connected = true;
        console.log("Connected to database");
      } catch (error) {
        console.error("Failed to connect to the database", error);
      }
    }
  }
  async disconnect() {
    if (this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        console.log("Disconnected from database");
      } catch (error) {
        console.error("Failed to disconnect from the database", error);
      }
    }
  }

  async find(collectionName, query, options = null) {
    try {
      await this.connect();
      const collection = this.database.collection(collectionName);

      const results = await collection.find(query, options).toArray();
      console.log(results);
      return results;
    } catch (error) {
      console.log(error);
    }
  }
  async insertOne(collectionName, doc) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.insertOne(doc);
      console.log("The insertion is succesfull");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
  async insertMany(collectionName, arrayOfDoc) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.inserOne(arrayOfDoc);
      console.log("The insertion is succesfull: " + arrayOfDoc);
    } catch (error) {
      console.log(error);
    }
  }
  async replaceOne(collectionName, query, doc) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.replaceOneOne(query, doc);
      console.log("The doc has been modified");
      console.log("The new doc is: " + doc);
    } catch (error) {
      console.log(error);
    }
  }
  async updateOne(collectionName, query, updateOne) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.updateOne(query, updateOne);
      console.log("The doc has been modified");
      console.log("The new doc is: " + updateOne);
    } catch (error) {
      console.log(error);
    }
  }
  async updateMany(collectionName, query, updateOne) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.updateMany(query, updateOne);
      console.log("The doc has been modified");
      console.log("The new doc is: " + updateOne);
    } catch (error) {
      console.log(error);
    }
  }
  async deleteOne(collectionName, query) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.deleteOne(query);
      console.log("Successfully deleted the document");

      return result;
    } catch (error) {
      console.error("Error in deleteOne operation:", error);
    }
  }
  async deleteMany(collectionName, query) {
    try {
      await this.client.connect();
      const collection = this.database.collection(collectionName);
      const result = await collection.deleteMany(query);
      console.log("Successfully deleted the documents");

      return result;
    } catch (error) {
      console.error("Error in deleteMany operation:", error);
    }
  }
}
