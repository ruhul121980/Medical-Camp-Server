const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
//i have to put it env file later
const stripe=require('stripe')('sk_test_51PPO2h04OyLT3Gzbs41SuW41uVr3ctJoK58DpaS2ks02hoxOY8e4TLqo0N6p8OwcmOZB9gkbXqfUSXsWXow4kld800xYZ6kJ9L')
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

    app.get('/getFees/:id',async(req,res)=>{
      const id=req.params.id;
      const query = {_id: new ObjectId(id) };
      const result = await participantInfo.findOne(query);
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


  app.get('/registeredCampInfo/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // console.log("Email:", email);
        
        const query = {'participantEmail': email };
        const result = await participantInfo.find(query).toArray(); 
        
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

  app.get('/participantInfo/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // console.log("Email:", email);
        
        const query = { 'participantEmail': email };
        const result = await participantInfo.find(query).toArray(); 
        
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


  app.delete('/deleteCamp/:id',async(req,res)=>{
    const id=req.params.id;
    
    const query={_id:new ObjectId(id)}
    const result=await addCamp.deleteOne(query)
    res.send(result)
  })


  app.put('/updateCamp/:id',async(req,res)=>{
    const id=req.params.id;
    const camp=req.body;
    const filter={_id:new ObjectId(id)}
    const options={upsert:true}
    const updatedUser={
      
      $set:{
        name:camp.name,
        image:camp.image,
        fees:camp.fees,
        dateTime:camp.dateTime,
        campLocation:camp.location,
        location:camp.location,
        healthcareProfessional:camp.healthcareProfessional,
        description:camp.description
  
        
       
      }
    }
    const result=await addCamp.updateOne(filter,updatedUser,options)
    res.send(result)
  })


  app.put('/updateParticipant/:email', async (req, res) => {
    const email = req.params.email;
    const info = req.body;
    const filter = {'participantEmail': email };
    const options = { upsert: true };
    const updatedUser = {
      $set: {
        participantName: info.participantName,
        phoneNumber: info.phoneNumber,
        age: info.age
      }
    };
    try {
      const result = await participantInfo.updateMany(filter, updatedUser, options);
      res.json(result);
    } catch (error) {
      res.status(500).send('Error updating participant information');
    }
  });


  // payment Intent
  app.post('/create-payment-intent',async(req,res)=>{
    const {price}=req.body;
    const amount = parseInt(price*100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:amount,
      currency:'usd',
      payment_method_types:['card']
    })

    res.send({
      clientSecret:paymentIntent.client_secret
    })
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
