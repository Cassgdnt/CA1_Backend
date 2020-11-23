// those const allows to use express, mongodb
const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require("mongodb");

// This const allows to connect to mongoDB database, and you have to change the Url by yours. You can find it on mongodb.
const url= "mongodb+srv://admin:admin@ca1movie.aq9gr.mongodb.net/movies?retryWrites=true&w=majority";

const client = new MongoClient(url, { useUnifiedTopology: true });
 
 // Movies is the name of the database i will be using
 const dbName = "movies";
 
// body-parser is simplyfying the request 
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false}))

let db, movieDB;

run().catch(console.dir);

//This is where we start coding the CRUD operations
app.get('/', (req, res) => { 
    res.send('Hello world')
})

//This operation read the database, and display one of the movie. 
app.get('/movie', (req, res) => {
    console.log('You are in the movie route');
    
    async function findMovie() {
        const foundMovie = await  movieDB.findOne({name:"name1"})
        res.json(foundMovie)
    };
    findMovie();
})

//This function is to post a new movie in the database
//On postman you set all the value, and choose the post request.
//A new movie will be created.
app.post('/movie', (req, res) =>{
    console.log('I have received a post request in the /movie route');
    //create a new movie 
    let movie = new Movie(req.body.name, req.body.realisator, req.body.actor, req.body.year, req.body.seen)
    //insert it to the database
    movieDB.insertOne(movie)
    res.sendStatus(200)
})


// This function is to update a movie from the database. 
//To update you have to go on postman, select the ID, and then modify the information you want to update. 
app.put('/movie', (req, res) => {
    console.log(' movie router for update ');
    //First you find the movie you want to update
    async function findMovie() {
        try{
        const foundMovie = await  movieDB.findOne({"_id": ObjectId(req.body.id)})
        //if the movie is found edit it and send a message to the user
        if(foundMovie !== null){
            // if we are able to find a movie, we can edit it
            let movie = new Movie(
                            foundMovie.name, 
                            foundMovie.realisator,  
                            foundMovie.actor, 
                            foundMovie.year,
                            foundMovie.seen)
            movie.name = req.body.name;
            try{
            const updateResult = await movieDB.updateOne(
                                                {"_id": ObjectId(req.body.id)}, 
                                                {$set:movie})
            } catch(err){
                console.log(err.stack)
            }
            res.send("The movie was updated");
       
      
        
        } else {
              //if the movie is not found send a message to the user saying that this entry doe not exist
            res.send("The movie was not updated");
        }}catch(err){
            res.send("Object id is invalid")
        }
    };
    foundMovie();

})
// This function is to delete a movie from the database
//Again on postman, you just have to put the id and choose the delete request
app.delete('/movie', (req, res) =>{

    console.log('movie router to delete one movie');

    console.log(req.body.id)

    movieDB.deleteOne({"_id": ObjectId(req.body.id)})
    //First you find the movie and then you delete it
    async function findMovie() {
        const foundMovie = await  movieDB.findOne({"_id": ObjectId(req.body.id)})
        if(foundMovie !== null){
            // if we are able to find the movie, it means that it has not been deleted 
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    };
    findMovie();
})

//code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        
        //connect to movies database 
        db = client.db(dbName);

        //get reference to our movie collection
        movieDB = db.collection("movie");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
         console.log(err.stack);
    }
}

// creation of the movie class by using a constructor
class Movie {
    constructor(name, realisator, actor, year, seen =false){
        this.name = name;
        this.realisator = realisator;
        this.actor = actor;
        this.year = year;
        this.seen = seen;
    }

    printValues(){
        console.log(this.name, this.realisator, this.actor, this.year,this.seen);
    }
}