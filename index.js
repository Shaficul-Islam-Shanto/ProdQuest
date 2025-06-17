const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.send({ token });
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ error: "Unauthorized" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ error: "Forbidden" });
    req.decoded = decoded;
    next();
  });
};



const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.b5mtpb6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();

    const db = client.db("prodQuestDB");
    const queriesCollection = db.collection("queries");
    const recommendationsCollection = db.collection("recommendations");

    app.post("/queries", async (req, res) => {
      const queryData = req.body;
      const result = await queriesCollection.insertOne(queryData);
      res.send(result);

    });

    app.get("/queries", async (req, res) => {
      const { email } = req.query;
      const query = email ? { userEmail: email } : {};
      const result = await queriesCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const result = await queriesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const query = await queriesCollection.findOne({ _id: new ObjectId(id) });
      res.send(query);
    });

    app.put("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await queriesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );

      res.send(result);
    });

    app.get("/recent-queries", async (req, res) => {
      const result = await queriesCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.post("/recommendations", verifyJWT, async (req, res) => {
      const recData = req.body;
      const result = await recommendationsCollection.insertOne(recData);

      
      await queriesCollection.updateOne(
        { _id: new ObjectId(recData.queryId) },
        { $inc: { recommendationCount: 1 } }
      );
      res.send(result);
    });

    app.get("/recommendations/:queryId", verifyJWT, async (req, res) => {
      const { queryId } = req.params;
      const recommendations = await recommendationsCollection
        .find({ queryId })
        .sort({ timestamp: -1 })
        .toArray();
      res.send(recommendations);
    });

    app.delete("/recommendations/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;

      try {
        // Find the recommendation to get queryId before deleting
        const rec = await recommendationsCollection.findOne({ _id: new ObjectId(id) });

        if (!rec) {
          return res.status(404).send({ error: "Recommendation not found" });
        }

        // Delete the recommendation
        const deleteResult = await recommendationsCollection.deleteOne({ _id: new ObjectId(id) });

        // Decrease the count in queries collection
        await queriesCollection.updateOne(
          { _id: new ObjectId(rec.queryId) },
          { $inc: { recommendationCount: -1 } }
        );

        res.send(deleteResult);
      } catch (error) {
        console.error("Error deleting recommendation:", error);
        res.status(500).send({ error: "Failed to delete recommendation" });
      }
    });

    app.get("/recommendations-by-user", verifyJWT, async (req, res) => {
      const { email } = req.query;
      if (!email) return res.status(400).send({ error: "Email is required" });

      try {
        const result = await recommendationsCollection
          .find({ recommenderEmail: email })
          .sort({ timestamp: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch recommendations" });
      }
    });

    app.get("/my-query-recommendations", verifyJWT, async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }

      const recommendations = await recommendationsCollection
        .find({
          userEmail: email,
          recommenderEmail: { $ne: email }, // Only others' recommendations
        })
        .sort({ timestamp: -1 })
        .toArray();

      res.send(recommendations);
    });
    

    app.get("/search-queries", verifyJWT, async (req, res) => {
      const { text } = req.query;

      const searchRegex = new RegExp(text, "i"); 
      const result = await queriesCollection
        .find({ productName: { $regex: searchRegex } })
        .sort({ timestamp: -1 })
        .toArray();

      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is cooking.')
})

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
})