const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Medi-Camp:D7yBt1PomnbYcNAP@cluster0.v1zto12.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("medi-camp");
    const addCamp = database.collection("addCamp");

    app.post('/addCamp', async (req, res) => {
      const camp = req.body;
      const result = await addCamp.insertOne(camp);
      res.send(result);
    });


    app.get('/addCampData',async(req,res)=>{
      const cursor=addCamp.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get('/addCampData/:id',async(req,res)=>{
      const id=req.params.id;
      const query = {_id: new ObjectId(id) };
      const result = await addCamp.findOne(query);
      res.send(result);
    })  



  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
