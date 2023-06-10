const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const req = require('express/lib/request');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

/* verify jwt token */
const verifyJWT = (req,res,next)=>{
  const authorization = req.headers.authorization;
  // clg
  // console.log(authorization);

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





// const uri = 'mongodb://0.0.0.0:27017'
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
        const studentCollection = client.db('educationalDb').collection('students');
    const subjectCollection = client.db('educationalDb').collection('subjects');
    const addmitCollection = client.db('educationalDb').collection('addmits');

    
// jwt post
    app.post('/jwt', (req,res)=>{
      const student = req.body;
      console.log(student);
      const token = jwt.sign(student,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1h'
      })
      res.send({token})
      console.log({token});
    })

      // verify admin
    const verifyAdmin =async (req,res,next)=>{
      const email = req.decoded.email;
      const query ={email: email};
      const user = await studentCollection.findOne(query);
      if(user?.email !== 'admin'){
        return res.status(403).send({error:true, message: 'forbidden access'})
      }
      next();
    }



    // verify admin
    app.get('/users/admin/:email', async (req,res)=>{
      const email = req.params.email;

      console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {admin: user?.role === 'admin'};
      res.send(result);
    })
    // verify instructor
    app.get('/users/instructor/:email', async (req,res)=>{
      const email = req.params.email;
      // if(req.email !== email ){
      //   return res.send({instructor : false})
      // }
      console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {instructor: user?.role === 'instructor'};
      res.send(result);
    })
    app.get('/users/student/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      if(req.email !== email ){
        return res.send({instructor : false})
      }
      console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {student: user?.role === 'student'};
      res.send(result);
    })

    app.get('/allUser', async (req,res)=>{
      const results = await studentCollection.find().toArray();
      res.send(results);
    } )
    // app.get('/subjects', async (req,res)=>{
    //   const results = await subjectCollection.find().toArray();
    //   res.send(results);
    // } )

        app.get('/allClass', async (req,res)=>{
      const results = await subjectCollection.find().toArray();
      res.send(results);
    } )
   

    app.get('/students/:category', async (req, res) => {
  const category = req.params.category;
  console.log(category);
    let filteredStudents;
    if (category === 'admin') {
      filteredStudents = await studentCollection.find({ role: 'admin' }).toArray();
    } else if (category === 'student') {
      filteredStudents = await studentCollection.find({ role: 'student' }).toArray();
    } else if (category === 'instructor') {
      filteredStudents = await studentCollection.find({ role: 'instructor' }).toArray();
    }
    res.send(filteredStudents);
});


  // all student post
  app.post('/students', async(req,res)=>{
      const student = req.body;
      // console.log('93');
      const query = {email: student.email};
      const existStudent = await studentCollection.findOne(query);
      if(existStudent){
        return res.send({message: 'Student already exist'});
      }
      const result = await studentCollection.insertOne(student);
      res.send(result)
    })

// all subject post
app.post('/subjects', async (req, res) => {
  const subject = req.body;
  console.log('subject'); // This line logs the string 'subject' to the console
  const result = await subjectCollection.insertOne(subject); // Inserts the subject into the subjectCollection
  res.send(result); // Sends the result as the response
});


    app.patch('/students/admin:id',async (req,res)=>{
      const id= req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const updateRole = {
        $set: {
          role:'admin'
        }
      };
      const result = await studentCollection.updateOne(filter,updateRole); 
      res.send(result)
    })
    
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