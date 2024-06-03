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
    const participantInfo = database.collection("participantInfo");

    app.post('/addCamp', async (req, res) => {
      const camp = req.body;
      const result = await addCamp.insertOne(camp);
      res.send(result);
    });

    app.post('/modalData/:id', async (req, res) => {
      const values = req.body;
      const id=req.params.id;
      const result = await participantInfo.insertOne(values);
      addCamp.updateOne(
        { _id: new ObjectId(id) }, // Filter by the specific _id
        { $inc: { 
          participantCount: 1 } } // Increment the count field
      );
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

    app.get('/allCamp/:email', async (req, res) => {
      try {
          const email = req.params.email;
          // console.log("Email:", email);
          
          const query = { 'email': email };
          const result = await addCamp.find(query).toArray(); // Use await to wait for the result
          
          res.send(result);
      } catch (error) {
          console.error("Error:", error);
          res.status(500).send("Internal Server Error");
      }
  });



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
