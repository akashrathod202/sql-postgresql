import { Client } from 'pg'
import express, { response }  from  "express"


const app=express()
app.use(express.json());

const pgClient = new Client(
    "postgresql://neondb_owner:npg_ZTbrR1Gmk4gd@ep-delicate-silence-b4zy1761-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  );
  pgClient.connect()
  .then(()=>{
    console.log("database connected")
  }).catch((err)=>{
    console.log("databse connection failed",err)
  })
 


  app.post("/signup", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;

    try {

        // 1. Create user
        const insertQuery = `
            INSERT INTO users(username, email, password)
            VALUES($1, $2, $3)
            RETURNING id
        `;


        const addressInsertQuery = `
        INSERT INTO addresses(city, country, street, pincode, user_id)
        VALUES($1, $2, $3, $4, $5)
    `;

     await pgClient.query("BEGIN")
    
        const response = await pgClient.query(
            insertQuery,
            [username, email, password]
        );
        
        // 2. Get newly created user's ID
        const user_id = response.rows[0].id;

         
        
        const addressResponse = await pgClient.query(
            addressInsertQuery,
            [city, country, street, pincode, user_id]
        );

        await pgClient.query("COMMIT;")
 
        // 4. Send response
        res.json({
            message: "You have signed up",
            user_id: user_id
        });

    } catch (e) {

        console.log(e);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});


app.get("/metadata",async(req,res)=>{

    const id=req.query.id;
    const query=`SELECT users.id,users.username,users.email,addresses.city,
    addresses.country,addresses.street,addresses.pincode
    FROM users JOIN addresses ON users.id=addresses.user_id
    WHERE users.id=$1`

    console.log(query)

    const response= await pgClient.query(query,[id])
    console.log(response)
    res.json({
        response:response.rows
    })




})

app.get("/data",async(req,res)=>{
    const id=req.query.id;
     const query=`SELECT users.id,users.username, users.email,addresses.city,addresses.country,addresses.street,addresses.pincode
     FROM users JOIN addresses ON users.id=addresses.user_id
     WHERE users.id=$1`

     const response=await pgClient.query(query,[id])
     res.json({
        response:response.rows
     })
})

// app.post("/signin",async(req,res)=>{
//     const  email=req.body.email
//     const password=req.body.password

//     try{

//         const query=`
//         SELECT id,username,email,password
//         FROM users
//         WHERE  email =$1`;

//         const result =  await pgClient.query(query,[email])

//         if(result.rows.length === 0){
//             return res.status(404).json({
//                 message:"user not found"
//             })
//         }
     
//         const user=result.rows[0]

//         if(user.password !== password){
//             return res.status(401).json({
//                 message:"invalid password"
//             })
//         }

//         res.json({
//             message:"signin successful",
//             user:{
//                 id:user.id,
//                 username:user.username,
//                 email:user.email
//             }
//         })
//     }catch(e){ 
//         console.log(e)
//         res.status(500).json({
//             message: "Something went wrong"
//           });
//     }
// })


app.listen(3000,()=>{
    console.log("server runnung on port 3000")
})