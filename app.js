const express = require('express')
const app = express()
const admin = express()
const fs = require('fs')
app.disable('x-powered-by');

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


const secret = require('./secret.js')

const mongoose = require('mongoose');
let collection
mongoose.connect('mongodb://localhost/blogdata', function(err) {
	if(err)console.err(err)
})
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open')
})

mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err)
})

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
	console.log("the connection is open")
})

const Schema = mongoose.Schema;
var Comments = new Schema({
	name: String,
	body: String,
	date: Date
});

const Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;
let gfs;
db.once("open", function() {
	gfs = Grid(db.db)
});
const blogPostSchema = mongoose.Schema({
	date: { type: Date, default: Date.now },
  title: String,
	upload: { data: Buffer, contentType: String },
	content: String,
	comments: [Comments]
})
let blogPost = mongoose.model('blogPost', blogPostSchema)

const homePageSchema = mongoose.Schema({
	title: String,
	content: String
})

let homePageInfo = mongoose.model('homePageInfo', homePageSchema)

const imageSchema = mongoose.Schema({
	img:{ data: Buffer, contentType: String }
})
const Image = mongoose.model('Image', imageSchema)

const multer = require('multer')

var upload = multer({dest: "./uploads"});


app.get('/', (req, res)=> {
	 homePageInfo.findOne({'title':'Aboutme'}, function(err, data) {
		console.log(data)
		res.render('home',{data:data.content})
	});
});

app.get('/admin',(req, res)=> {
	homePageInfo.findOne({'title':'Aboutme'}, function(err, data) {
		res.render('addBlogPost',{data:data.content})
	})
})

app.post('/admin', function(req, res) {
	console.log("posting text")
	let Post = new blogPost({
		title:req.body.title,
		content:req.body.blogContent//,
	});
	Post.save(function(err) {
		if(err) {
			console.log(err)
		}
		else {
			console.log(Post)
		}
	});
	res.redirect('/')
});
let homePageAdded = false

if(!homePageAdded) {
	app.post('/addHomePage', function(req, res) {
		var homePage = new homePageInfo({
			title: "Aboutme",
			content: req.body.aboutMe
		})
		homePage.save(function (err) {
			if (!err) console.log('Success!');
		})
		res.redirect('/')
		homePageAdded = true
	});
}
else {
	app.put('url', function(req, res) {

        // use our bear model to find the bear we want
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err)
                res.send(err);

            bear.name = req.body.name;  // update the bears info

            // save the bear
            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Bear updated!' });
            });

        });
    });
}

/*app.post('/editBlogPost', function(req, res) {
	let query = {"_id":id}
	let updateTitle = {$set:{title: req.body.title, content: req.body.content}
	blogPost.findOneAndUpdate(query, update, {new: true}, function(err, update) {
		if(err) {
			console.log(err)
		}
		else {
			res.redirect("/blogPost/"id)
		}
	})
})*/


let id;

app.get('/editBlogPost/:id', function(req, res) {
	id = req.params.id
	blogPost.findById(id, function(err, data) {
		res.render("editBlogPost",{content:data.content, title:data.title})
	})
})

app.post('/deleteBlogPost', function(req, res) {

})

app.get('/blogPost/:id', function(req, res){
	id = req.params.id

	blogPost.findById(id, function(err, post) {
		res.render('blogPost',{content:post.content, title:post.title,
			date:post.date,comments:post.comments, commentName:post.comments.name,
			commentBody:post.comments.body})
	})
})

app.post('/blogPost', function(req, res) {
	blogPost.findById(id, function(err, post) {
		post.comments.push({ name: req.body.name, body: req.body.body });

		post.save(function (err) {
			if (!err) console.log('Success!');
		})
		res.redirect('/blogPost/' + id);
	});
});

app.get('/blogPostList', (req, res)=> {
	blogPost.find(function(err, data) {
		res.render('allBlogPosts',{data:data, title:data.title, id: data.id})
	})
})

app.listen(3000, function () {
  console.log('listening on port 3000!');
})
