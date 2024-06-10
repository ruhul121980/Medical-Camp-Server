const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
//i have to put it env file later
const stripe=require('stripe')('sk_test_51PPO2h04OyLT3Gzbs41SuW41uVr3ctJoK58DpaS2ks02hoxOY8e4TLqo0N6p8OwcmOZB9gkbXqfUSXsWXow4kld800xYZ6kJ9L')
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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
    const usersInfo = database.collection("usersInfo");
    const addCamp = database.collection("addCamp");
    const participantInfo = database.collection("participantInfo");
    const paymentHistory = database.collection("paymentHistory");
    

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

    
    app.post('/paymentHistory', async (req, res) => {
      const payment = req.body;
      const id = req.body.id;
      console.log("now", id);
  
      try {
          const result = await paymentHistory.insertOne(payment);
          const updateResult = await participantInfo.updateOne(
              { _id: new ObjectId(id) },
              { $set: { paymentStatus: 'paid' } } 
          );
  
          res.send({ result, updateResult });
      } catch (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
      }
  });


  app.post('/register', async (req, res) => {
    const { name, email, photoURL, contactNumber, address } = req.body;
  
    const newUser = { name, email, photoURL, contactNumber, address };
  
    try {
      await usersInfo.insertOne(newUser);
      res.status(201).send('User registered successfully');
    } catch (error) {
      res.status(500).send('Error registering user: ' + error.message);
    }
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
    const query = { 'email': email };
    const result = await usersInfo.findOne(query); // Use findOne to get a single document

    if (!result) {
      return res.status(404).send("User not found");
    }

    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.get('/paymentHistory/:email', async (req, res) => {
  try {
      const email = req.params.email;
      // console.log("Email:", email);
      
      const query = { 'participantEmail': email };
      const result = await paymentHistory.find(query).toArray(); 
      
      res.send(result);
  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/getRegisterInfo', async (req, res) => {
  const cursor = participantInfo.find();
  const result = await cursor.toArray();
  res.send(result);
});




  app.delete('/deleteCamp/:id',async(req,res)=>{
    const id=req.params.id;
    
    const query={_id:new ObjectId(id)}
    const result=await addCamp.deleteOne(query)
    res.send(result)
  })

  app.delete('/cancelRegistration/:id',async(req,res)=>{
    const id=req.params.id;
    
    const query={_id:new ObjectId(id)}
    const result=await participantInfo.deleteOne(query)
    res.send(result)
  })

  app.delete('/deleteRegistration/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await participantInfo.deleteOne(query);
    res.send(result);
  });
  


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

  app.put('/updateOrganizerProfile/:email', async (req, res) => {
    const email = req.params.email;
    const info = req.body;
    const filter = {'email': email };
    const options = { upsert: true };
    
    const updatedUser = {
      $set: {
        name: info.name,
        contactNumber: info.contactNumber,
        photoURL:info.photoURL
      }
    };
    try {
      const result = await usersInfo.updateOne(filter, updatedUser, options);
      res.json(result);
    } catch (error) {
      res.status(500).send('Error updating participant information');
    }
  });

  app.put('/updateConfirmationStatus/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { confirmationStatus: 'Confirmed' },
    };
    const result = await participantInfo.updateOne(filter, updateDoc);
    res.send(result);
  });
  
  

  // payment Intent
  // app.post('/create-payment-intent',async(req,res)=>{
  //   const {campFees}=req.body;
  //   const amount = parseInt(campFees*100);

  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount:amount,
  //     currency:'usd',
  //     payment_method_types:['card']
  //   })

  //   res.send({
  //     clientSecret:paymentIntent.client_secret
  //   })
  // })

  app.post('/create-payment-intent', async (req, res) => {
    try {
        const { campFees } = req.body;
        if (typeof campFees !== 'number' || isNaN(campFees) || campFees <= 0 || campFees > 999999.99) {
            console.error('Invalid camp fees amount:', campFees);
            return res.status(400).send({ error: 'Invalid camp fees amount' });
        }

        const amount = Math.round(campFees * 100); // Convert to smallest currency unit (e.g., cents for USD)
        console.log('Creating payment intent with amount:', amount);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: 'Internal Server Error' });
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
