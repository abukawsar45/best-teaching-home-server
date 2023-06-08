const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

/* verify jwt token */
const verifyJWT = (req,res,next)=>{
  // clg
  console.log( req.headers.authorization);
  const authorization = req.headers.authorization;
  // clg
  console.log(authorization);

  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1];
  // clg
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error, decoded)=>{
    if(error){
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next()
  })
}






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9lqzgjv.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db('educationalDb').collection('users');
    const subjectCollection = client.db('educationalDb').collection('subjects');
    const addmitCollection = client.db('educationalDb').collection('addmits');
    
    

    // verify admin
    const verifyAdmin =async (req,res,next)=>{
      const email = req.decoded.email;
      const query ={email: email};
      const user = await userCollection.findOne(query);
      if(user?.email !== 'admin'){
        return res.status(403).send({error:true, message: 'forbidden access'})
      }
      next();
    }


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('best teaching home server is running!');
});
app.get('/school', (req, res) => {
  res.send('best teaching school server is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}) 