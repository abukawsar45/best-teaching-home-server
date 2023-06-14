const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
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
  // //console.log(token);

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
      // //console.log(student);
      const token = jwt.sign(student,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1h'
      })
      res.send({token})
      // //console.log({token});
    })
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

  

  // app.get('/topClass',async (req,res)=>{
  //   const query = {status: 'paid'};
  //   const result = await orderClassCollection.find(query).toArray();
  //   res.send(result);
  // } )
// app.get('/topClass', async (req, res) => {
//   const pipeline = [
//     {
//       $match: { status: 'paid' } // Only consider paid entries
//     },
//     {
//       $group: {
//         _id: '$classId',
//         count: { $sum: 1 }, // Count the number of paid entries for each classId
//         info: { $first: '$$ROOT' } // Accumulate the first document for each classId
//       }
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the default _id field from the result
//         classId: '$_id', // Rename _id to classId
//         count: 1, // Include the count field
//         // Include additional fields as needed
//         orderClassName:`$info.orderClassName`,
//         orderClassImpage:`$info.orderClassImpage`,
//         orderClassPrice:`$info.orderClassPrice`,
//         instructorName:`$info.instructorName`,
//         instructorEmail:`$info.instructorEmail`,
//         instructorImage: `$info.instructorImage`

//         // Add more fields here
//       }
//     },
//     {
//       $sort: { count: -1 } // Sort by the count in descending order
//     }
//   ];

//   const result = await orderClassCollection.aggregate(pipeline).toArray();
  
  
//   res.send(result);
// });



// app.get('/topClass', async (req, res) => {
//   const pipeline = [
//     {
//       $match: { status: 'paid' } // Only consider paid entries
//     },
//     {
//       $group: {
//         _id: '$classId',
//         count: { $sum: 1 }, // Count the number of paid entries for each classId
//         info: { $first: '$$ROOT' } // Accumulate the first document for each classId
//       }
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the default _id field from the result
//         classId: '$_id', // Rename _id to classId
//         count: 1, // Include the count field
//         orderClassName: '$info.orderClassName',
//         orderClassImage: '$info.orderClassImage',
//         orderClassPrice: '$info.orderClassPrice',
//         instructorName: '$info.instructorName',
//         instructorEmail: '$info.instructorEmail',
//         instructorImage: '$info.instructorImage'
//         // Include additional fields as needed
//       }
//     },
//     {
//       $sort: { count: -1 } // Sort by the count in descending order
//     }
//   ];

//   const result = await orderClassCollection.aggregate(pipeline).toArray();

//   const instructorEmails = result.map((item) => item.instructorEmail); // Get the instructor's emails from the result

//   const query2 = {
//     email: { $in: instructorEmails } // Filter by instructorEmails using the $in operator
//   };

//   const result2 = await studentCollection.find(query2).toArray();

//   res.send({ result, result2 });
// });

// app.get('/topClass', async (req, res) => {
//   const pipeline = [
//     {
//       $match: { status: 'paid' } // Only consider paid entries
//     },
//     {
//       $group: {
//         _id: '$classId',
//         count: { $sum: 1 }, // Count the number of paid entries for each classId
//         info: { $first: '$$ROOT' } // Accumulate the first document for each classId
//       }
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the default _id field from the result
//         classId: '$_id', // Rename _id to classId
//         count: 1, // Include the count field
//         orderClassName: '$info.orderClassName',
//         orderClassImage: '$info.orderClassImage',
//         orderClassPrice: '$info.orderClassPrice',
//         instructorName: '$info.instructorName',
//         instructorEmail: '$info.instructorEmail',
//         instructorImage: '$info.instructorImage'
//         // Include additional fields as needed
//       }
//     },
//     {
//       $sort: { count: -1 } // Sort by the count in descending order
//     }
//   ];

//   const result = await orderClassCollection.aggregate(pipeline).toArray();

//   const instructorEmails = result.map((item) => item.instructorEmail); // Get the instructor's emails from the result

//   const query2 = {
//     email: { $in: instructorEmails } // Filter by instructorEmails using the $in operator
//   };

//   const result2 = await studentCollection.find(query2).toArray();

//   const totalStudent = {};
//   result2.forEach((item) => {
//     const instructorEmail = item.email;
//     const count = result.filter((classItem) => classItem.instructorEmail === instructorEmail)[0]?.count || 0;
//     totalStudent[instructorEmail] = count;
//   });

//   res.send({ result, result2, totalStudent });
// });


app.get('/topClass', async (req, res) => {
  const pipeline = [
    {
      $match: { status: 'paid' } // Only consider paid entries
    },
    {
      $group: {
        _id: '$classId',
        count: { $sum: 1 }, // Count the number of paid entries for each classId
        info: { $first: '$$ROOT' } // Accumulate the first document for each classId
      }
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field from the result
        classId: '$_id', // Rename _id to classId
        count: 1, // Include the count field
        orderClassName: '$info.orderClassName',
        orderClassImage: '$info.orderClassImpage',
        orderClassPrice: '$info.orderClassPrice',
        instructorName: '$info.instructorName',
        instructorEmail: '$info.instructorEmail',
        instructorImage: '$info.instructorImage'
        // Include additional fields as needed
      }
    },
    {
      $sort: { count: -1 } // Sort by the count in descending order
    }
  ];

  const result = await orderClassCollection.aggregate(pipeline).toArray();

  const instructorEmails = result.map((item) => item.instructorEmail); // Get the instructor's emails from the result

  const query2 = {
    email: { $in: instructorEmails } // Filter by instructorEmails using the $in operator
  };

  const result2 = await studentCollection.find(query2).sort({totalStudent:-1}).toArray();
  const totalStudent = {};
  result.forEach((item) => {
    const instructorEmail = item.instructorEmail;
    totalStudent[instructorEmail] = (totalStudent[instructorEmail] || 0) + item.count;
  });


  res.send({ result, result2, totalStudent });
});


// app.get('/topClass', async (req, res) => {
//   const pipeline = [
//     {
//       $match: { status: 'paid' } // Only consider paid entries
//     },
//     {
//       $group: {
//         _id: '$classId',
//         count: { $sum: 1 }, // Count the number of paid entries for each classId
//         info: { $first: '$$ROOT' } // Accumulate the first document for each classId
//       }
//     },
//     {
//       $sort: { count: -1 } // Sort by the count in descending order
//     }
//   ];

//   const result = await orderClassCollection.aggregate(pipeline).toArray();

//   const classIds = result.map((item) => item.ins); // Extract classIds from the result

//   const query2 = {
//     _id: { $in: classIds } // Filter by classIds in the result
//   };

//   const result2 = await studentCollection
//     .find(query2)
//     .sort({ count: -1 }) // Sort by the previous paid count
//     .toArray();

//   res.send({ result, result2 });
// });


       app.get('/allClass', async (req,res)=>{
          const query = {status: 'approved'};
      const results = await subjectCollection.find(query).sort({date: -1}).toArray();
      res.send(results);
    } )
       app.get('/allUsers', async (req,res)=>{
          
      const results = await subjectCollection.find().sort({date: -1}).toArray();
      res.send(results);
    } )

    app.get('/totalStudents/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      const status = req.query.status;
        if(req.decoded.email !== email ){
        return res.send({instructor : false});
      }
      const query ={
        instructorEmail : email,
        status: 'paid'
      };
      const paidlStudents = await orderClassCollection.find(query).toArray();
      // const result = paidlStudents.reduce()
      res.send(paidlStudents)
    })

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
          //  //console.log(email);
    if(req.decoded.email !== email ){
        return res.send({admin : false});
      }
// .sort({date: -1})
      const results = await studentCollection.find().sort({dete: -1}).toArray();
      res.send(results);
    } )
   

   app.get('/selectedClass/:email',verifyJWT, async (req, res) => {
    const email = req.params.email;
    // //console.log({email},'000000');
      if(req.decoded.email !== email ){
        return res.send({admin : false});
      }

    const query ={
      customerEmail: email,
      status:'selected'
    }
    const result = await orderClassCollection.find(query).sort({selectedDate: -1}).toArray();
    res.send(result);
  })

   app.get('/paidClass/:email',verifyJWT, async (req, res) => {
    const email = req.params.email;
    // //console.log({email},'000000');
      if(req.decoded.email !== email ){
        return res.send({admin : false});
      }

    const query ={
      customerEmail: email,
      status:'paid'
    }
    const result = await orderClassCollection.find(query).sort({paymentDate: -1}).toArray();
    res.send(result);
  })



  app.delete('/selectedClass/:id', async (req,res)=>{
    const id = req.params.id;
    //console.log(id);
    const query = {_id: new ObjectId(id)};
    const result = await orderClassCollection.deleteOne(query);
    res.send(result);
  })



app.get('/orderClass', async (req, res) => {
  const email = req.query.email;
  const orderClassName = req.query.orderClassName;
  //console.log({email,orderClassName});

  const query = {
    customerEmail: email,
    orderClassName: orderClassName,
  };

  const existingClass = await orderClassCollection.findOne(query);

  if (existingClass) {
    return res.send({ orderClassNameExists: true });
  } else {
    return res.send({ orderClassNameExists: false });
  }
});
app.get('/totalPaidClass/:id', async (req, res) => {
  const classId = req.params.id;
  const orderClassName = req.query.orderClassName;
  //console.log({classId,orderClassName});

  const query = {
    classId: classId,
    orderClassName: orderClassName,
    status: 'paid'
  };

  const result = await orderClassCollection.find(query).toArray();
  res.send(result);
  //console.log({query,result});
});



app.post('/orderClass', async (req, res) => {
  const orderClass = req.body;
  const query = { 
    orderClassName: orderClass.orderClassName,
    customerEmail: orderClass.customerEmail
  };
  //console.log({ query });
  const existClass = await orderClassCollection.findOne(query);
  // //console.log(existClass, '744444');
  
  if (existClass) {
    return res.send({ message: 'This class already exists' });
  }
  
  const result = await orderClassCollection.insertOne(orderClass);
  res.send(result);
});


    // all subject post
app.post('/subjects', async (req, res) => {
  const subject = req.body;
  // //console.log('subject'); // This line logs the string 'subject' to the //console
  const result = await subjectCollection.insertOne(subject); // Inserts the subject into the subjectCollection
  res.send(result); // Sends the result as the response
});

    app.get('/class/:id',async (req,res)=>{
      const id = req.params.id;
      // //console.log(id);
      const query = {_id: new ObjectId(id) };
      const result = await subjectCollection.findOne(query);
      res.send(result);
    } )

    // update data
app.patch('/classesStatus/:id', async (req, res) => {
  const id = req.params.id;
  const status = req.query.status;
  // //console.log(id);
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
app.patch('/students/role/:id',verifyJWT,verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const email = req.query.email;
  const status = req.body.power;
  //console.log({id,status});
  if(req.decoded.email !== email){
    return res.send({error: true, admin: false});
  }
  // //console.log(id);
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
      $set: {
        role: status
    }
  }
  const result = await studentCollection.updateOne(query,updateDoc);
  res.send(result);
});

app.put('/feedback/:id', async (req, res) => {
  const id=req.params.id;
  const text = req.body.feedback;
  //console.log({id,text});
  const query = { _id: new ObjectId(id) };
  const updateDoc ={
    $set:{
      feedback: text
    }
  }
  //console.log({updateDoc});
  const result = await subjectCollection.updateOne(query, updateDoc);
  res.send(result)
})

    app.patch('/updateClass/:id', async (req,res)=>{
      const id = req.params.id;
      // //console.log(id);
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
app.put('/updateOrderStatus/:id', async (req, res) => {

    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const updateClass = req.body;
    const classId = updateClass.classId;
    const query2 = { _id: new ObjectId(classId) };

    const updateDoc = {
      $set: {
        ...updateClass,
      },
    };
    const result = await orderClassCollection.updateOne(query, updateDoc);
    // //console.log(result);

    const result2 = await subjectCollection.updateOne(query2,  { $inc: { availableSeat: -1 } });
    // //console.log(result2);

    res.send({ result, result2 });
});



    app.get('/instructor/class/:email',verifyJWT, async (req,res)=>{
      const email=req.params.email;
      // //console.log(email,87);
      const result = await subjectCollection.find({email: email}).sort({date: -1}).toArray();
      res.send(result)
    } )

    app.get('/users/admin/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
    if(req.decoded.email !== email ){
        return res.send({student : false, instructor: false});
      }
      // //console.log(email);
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
      // //console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {instructor: user?.role === 'instructor'};
      res.send(result);
    })
    app.get('/users/student/:email',verifyJWT, async (req,res)=>{
      const email = req.params.email;
      // //console.log('109', {email, amar:email});
      if(req.decoded.email !== email ){
        return res.send({instructor : false, admin: false});
      }
      // //console.log(email);
      const query = {email: email};
      const user = await studentCollection.findOne(query);
      const result = {student: user?.role === 'student'};
      res.send(result);
    })

    app.get('/allUser', async (req,res)=>{
      const results = await studentCollection.find().toArray();
      res.send(results);
    } )
  

    app.get('/students/:category', async (req, res) => {
  const category = req.params.category;
  // //console.log(category);
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
      // //console.log('93');
      const query = {email: student.email};
      const existStudent = await studentCollection.findOne(query);
      // //console.log(existStudent,'099009');
      if(existStudent){
        return res.send({message: 'Student already exist'});
      }
      const result = await studentCollection.insertOne(student);
      res.send(result)
    })

// all subject post
app.post('/subjects', async (req, res) => {
  const subject = req.body;
  // //console.log('subject'); // This line logs the string 'subject' to the //console
  const result = await subjectCollection.insertOne(subject); // Inserts the subject into the subjectCollection
  res.send(result); // Sends the result as the response
});


    app.patch('/students/admin:id',async (req,res)=>{
      const id= req.params.id;
      // //console.log(id);
      const filter = {_id: new ObjectId(id)};
      const updateRole = {
        $set: {
          role:'admin'
        }
      };
      const result = await studentCollection.updateOne(filter,updateRole); 
      res.send(result)
    })
    
    app.post('/paymentData',verifyJWT, async (req,res)=>{
      const {price} = req.body;
      const amount = price*100;
      //console.log({price,amount});
      const email = req.query.email;
      if(req.decoded.email !== email ){
        return res.send({admin : false});
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
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
})
app.get('/school', (req, res) => {
  res.send('best teaching school server is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}) 