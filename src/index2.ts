import  {Client}  from 'pg'
import  express from "express"

const  app=express()
app.use(express.json());

const  pgClient=new Client("postgresql://neondb_owner:npg_ZTbrR1Gmk4gd@ep-delicate-silence-b4zy1761-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

pgClient.connect()
.then(()=>{
    console.log("connected sussecfly")
}).catch(()=>{
    console.log("connection failed")
})

app.post("/signup",async(req,res)=>{
    const username=req.body.username
    const  email =req.body.email
    const password=req.body.password


     try{
        const query=`INSERT INTO users (username,email,password) values($1,$2,$3)
          RETURNING id`

          const  response= await pgClient.query(query,[username,email,password])

          const user_id = response.rows[0].id;

          res.json(
            {
                message:"sussefully",
                reponse:response.rows
            }
          )
     }catch(error){
       console.log(error)
       res.status(500).json({
        message: "Something went wrong"
    });
     }
})

app.post("/signin",async(req,res)=>{


 
    const  email =req.body.email
    const password=req.body.password

     
    try{
        const  query=`SELECT username,password,password
           From users
           WHERE email=$1
     `;

     const response=await pgClient.query(query,[email])

     if (response.rows.length ===0){
  
        res.status(500).json({
            message:"user not found"
        })
     }

     const  user=response.rows[0]


     if( user.password !== password)
{
      res.status(500).json({
        message:"invalid password"
      })
}

res.status(200).json({
    message:"sign in sussfull",
    user:{
                        id:user.id,
                      username:user.username,
                        email:user.email
                  }
})
    }catch(error){
        console.log(error)
        res.json({
            message :"something went  wrong"
        })
    }
})

app.post("/add",async(req,res)=>{

     const title=req.body.title
     const  description=req.body.description
     const done=req.body.done

try{

    const query=`INSERT INTO todo(title,description,done)values($1,$2,$3)`

    const response=await pgClient.query(query,[title,description,done])

    res.status(200).json({
        message:"todo added sussefuly",
        todo:response.rows[0]
    })

}
catch(error){
console.log(error)
res.status(500).json({
    message: "Something went wrong"
});
}


})


app.delete("\delete",async (req,res)=>{

})

app.post("/signup",async(req,res)=>{

})
app.listen(8000,()=>{
    console.log("the server is  runung on port 8000")
}) 