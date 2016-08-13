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

const Schema = mongoose.Schema

var Comments = new Schema({
	name: String,
	body: String,
	date: Date
});

const blogPostSchema = mongoose.Schema({
		date: { type: Date, default: Date.now },
    title: String,
		img: { data: Buffer, contentType: String },
		content: String,
		comments: [Comments]
})
let blogPost = mongoose.model('blogPost', blogPostSchema)

app.get('/', (req, res)=> {
	res.render('home')
})

app.get('/admin',(req, res)=> {
	res.render('addBlogPost')
})

app.post('/admin', (req, res)=> {
	let Post = new blogPost({
		title:req.body.title,
		content:req.body.blogContent
	})

	Post.save(function(err) {
		if(err) {
			console.log(err)
		}
		else {
			console.log(Post)
		}
	})
	res.redirect('/')
})

let id

app.get('/blogPost/:id', function(req, res){

	id = req.params.id

	blogPost.findById(id, function(err, post) {
		res.render('blogPost',{content:post.content, title:post.title,
			date:post.date,comments:post.comments, commentName:post.comments.name,
			commentBody:post.comments.body})
	})
})

app.post('/blogPost', function(req, res) {
	console.log(id)
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
		console.log(data)
		res.render('allBlogPosts',{data:data, title:data.title, id: data.id})
	})
})

app.listen(3000, function () {
  console.log('listening on port 3000!');
})
