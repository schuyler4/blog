const express = require('express')
const app = express()
const admin = express()

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const secret = require('./secret.js')

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blogdata')

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open')
})

mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("the connection is open")
})

const Schema = mongoose.Schema
const blogPostSchema = mongoose.Schema({
		date: { type: Date, default: Date.now },
    title: String,
		content: String,
})

let blogPost = mongoose.model('blogPost', blogPostSchema)

app.get('/', (req, res)=> {
	res.render('home')
})

app.get('/addPost',(req, res)=> {
	res.render('addBlogPost')
})

app.post('/addPost', (req, res)=> {
	let testPost = new blogPost({
		title:"blogPostTitle",
		content:"test content"
	})

	testPost.save(function(err) {
		if(err) {
			console.log(err)
		}
		else {
			console.log(testPost)
		}
	})
})

app.post('/', (req, res)=> {
	console.log("panda")
})

app.use('/admin', admin)

admin.get('/', (req,res)=> {
	console.log(admin.mountpath)
	res.render('addBlogPost')
})

admin.post('/addBlogPost', (req, res)=> {
	let post = new blogPost({
		title: "testPost",
		content: "this is test post content"
})

	post.save((err, post)=> {
		if(err) {
			console.error(err);
		}
		else {
			console.dir(post)
		}
	})
})

let allBlogPosts = db.blogposts.find().toArray()

for(i in allBlogPosts) {
	console.log(blogPosts[i])
	app.get('/' + 'blogPost' + i, (req, res)=> {
		for(i in blogPosts) {
			res.send(blogPosts[i])
		}
	})
}

app.get('/blogPostList', (req, res)=> {
	res.render('allBlogPosts.hbs')
})

app.listen(3000, function () {
  console.log('listening on port 3000!');
});
