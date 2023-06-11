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
  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1];
  // clg
  // console.log(token);

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
    const orderClassCollection = client.db('educationalDb').collection('orderClass');

    
// jwt post
    app.post('/jwt', (req,res)=>{
      const student = req.body;
      // console.log(student);
      const token = jwt.sign(student,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1h'
      })
      res.send({token})
      // console.log({token});
    })


app.get('/orderClass/', async (req, res) => {
  const email = req.query.email;
  const orderClassName = req.query.orderClassName;
  console.log({email,orderClassName});

  // const query = {
  //   customerEmail: email,
  //   orderClassName: orderClassName,
  // };

  // const existingClass = await orderClassCollection.findOne(query);

  // if (existingClass) {
  //   return res.send({ orderClassNameExists: true });
  // } else {
  //   return res.send({ orderClassNameExists: false });
  // }
});


    /*  app.get('/users/instructor/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      // if(req.email !== email ){
       if(req.decoded.email !== email ){
        return res.send({student : false, admin: false});
      }
      // console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {instructor: user?.role === 'instructor'};
      res.send(result);
    }) */

app.post('/orderClass', async (req, res) => {
  const orderClass = req.body;
  const query = { orderClassName: orderClass.orderClassName };
  console.log({ query });
  const existClass = await orderClassCollection.findOne(query);
  console.log(existClass, '744444');
  
  if (existClass) {
    return res.send({ message: 'This class already exists' });
  }
  
  const result = await orderClassCollection.insertOne(orderClass);
  res.send(result);
});


    /*   // console.log('93');
      const query = {email: student.email};
      const existStudent = await studentCollection.findOne(query);
      // console.log(existStudent,'099009');
      if(existStudent){
        return res.send({message: 'Student already exist'});
      } */
    // all subject post
app.post('/subjects', async (req, res) => {
  const subject = req.body;
  // console.log('subject'); // This line logs the string 'subject' to the console
  const result = await subjectCollection.insertOne(subject); // Inserts the subject into the subjectCollection
  res.send(result); // Sends the result as the response
});

    app.get('/class/:id',async (req,res)=>{
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id) };
      const result = await subjectCollection.findOne(query);
      res.send(result);
    } )

    // update data
app.patch('/classesStatus/:id', async (req, res) => {
  const id = req.params.id;
  const status = req.query.status;
  // console.log(id);
  const query = { _id: new ObjectId(id) };
  let updateDoc = {};
  if (status === 'approve') {
    updateDoc = {
      $set: {
        status: 'approved'
      }
    };
  } else {
    updateDoc = {
      $set: {
        status: 'deny'
      }
    };
  }
  const result = await subjectCollection.updateOne(query, updateDoc);
  res.send(result);
});
app.put('/feedback/:id', async (req, res) => {
  const id = req.params.id;
  const text = req.body.feedback ;
  console.log(id, text);
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
      $set: {
        feedback: text
      }
    };
    console.log(updateDoc);
  const result = await subjectCollection.updateOne(query, updateDoc);
  res.send(result);
});

    app.put('/updateClass/:id', async (req,res)=>{
      const id = req.params.id;
      // console.log(id);
      const query = ({_id: new ObjectId(id) });
      const updateClass = req.body;
      const updateDoc = {
        $set: {
          ...updateClass
        }
      }
      const result = await subjectCollection.updateOne(query, updateDoc);
      res.send(result);
    } )

      // verify admin
    const verifyAdmin =async (req,res,next)=>{
      const email = req.decoded.email;
      const query ={email: email};
      const user = await studentCollection.findOne(query);
      if(user?.role !== 'admin'){
        return res.status(403).send({error:true, message: 'forbidden access'})
      }
      next();
    }

       app.get('/allClass', async (req,res)=>{
          const query = {status: 'approved'};
      const results = await subjectCollection.find(query).toArray();
      res.send(results);
    } )

        // verify admin
        app.get('/admin/allClass/:email',verifyJWT,verifyAdmin, async (req,res)=>{
           const email = req.params.email;
    if(req.decoded.email !== email ){
        return res.send({admin : false});
      }

      const results = await subjectCollection.find().sort({date: -1}).toArray();
      res.send(results);
    } )
        app.get('/admin/allUser/:email',verifyJWT,verifyAdmin, async (req,res)=>{
           const email = req.params.email;
    if(req.decoded.email !== email ){
        return res.send({admin : false});
      }

      const results = await studentCollection.find().sort({date: -1}).toArray();
      res.send(results);
    } )
   




    app.get('/instructor/class/:email',verifyJWT, async (req,res)=>{
      const email=req.params.email;
      // console.log(email,87);
      const result = await subjectCollection.find({email: email}).sort({date: -1}).toArray();
      res.send(result)
    } )

    app.get('/users/admin/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
    if(req.decoded.email !== email ){
        return res.send({student : false, instructor: false});
      }
      // console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {admin: user?.role === 'admin'};
      res.send(result);
    })
    // verify instructor
    app.get('/users/instructor/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      // if(req.email !== email ){
       if(req.decoded.email !== email ){
        return res.send({student : false, admin: false});
      }
      // console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {instructor: user?.role === 'instructor'};
      res.send(result);
    })
    app.get('/users/student/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      // console.log('109', {email, amar:email});
      if(req.decoded.email !== email ){
        return res.send({instructor : false, admin: false});
      }
      // console.log(email);
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

 

    app.get('/students/:category', async (req, res) => {
  const category = req.params.category;
  // console.log(category);
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
      // console.log(existStudent,'099009');
      if(existStudent){
        return res.send({message: 'Student already exist'});
      }
      const result = await studentCollection.insertOne(student);
      res.send(result)
    })

// all subject post
app.post('/subjects', async (req, res) => {
  const subject = req.body;
  // console.log('subject'); // This line logs the string 'subject' to the console
  const result = await subjectCollection.insertOne(subject); // Inserts the subject into the subjectCollection
  res.send(result); // Sends the result as the response
});


    app.patch('/students/admin:id',async (req,res)=>{
      const id= req.params.id;
      // console.log(id);
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