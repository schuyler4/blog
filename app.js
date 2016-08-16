const express = require('express')
const app = express()
const admin = express()
app.disable('x-powered-by');

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const secret = require('./secret.js')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blogdata', function(err) {
	if(err)console.err(err)
})
mongoose.Promise = global.Promise;

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

const blogPostSchema = mongoose.Schema({
	date: { type: Date, default: Date.now },
  title: String,
	upload: { data: Buffer, contentType: String },
	content: String,
	comments: [Comments]
})
let blogPost = mongoose.model('blogPost', blogPostSchema)

app.get('/', (req, res)=> {
	res.render('home')
});

app.get('/admin',(req, res)=> {
	blogPost.find(function(err, data) {
		res.render('addBlogPost',{data:data, title:data.title, id: data.id})
	})
})

app.post('/admin', function(req, res) {
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

let id;

app.get('/editBlogPost/:id', function(req, res) {
	id = req.params.id
	blogPost.findById(id, function(err, data) {
		res.render("editBlogPost",{content:data.content, title:data.title})
	})
})

app.post('/editBlogPost', function(req, res) {
	let query = {"_id":id}
	let update = {$set:{title: req.body.title, content: req.body.content}}
	blogPost.findOneAndUpdate(query, update, {new: true}, function(err, update) {
		if(err) {
			console.log(err);
		}
		else {
			res.redirect("/blogPost/" + id);
		}
	});
});

app.post('/deleteBlogPost', function(req, res) {
	blogPost.remove({ _id: req.body.id }, function(err) {
    if (!err) {
          console.log("succsesfully deleted")
    }
    else {
          console.log(err)
    }
	});
	res.redirect('/admin')
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
