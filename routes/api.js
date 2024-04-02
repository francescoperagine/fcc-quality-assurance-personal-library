/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');

const username = process.env.MONGO_USER;
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = process.env.MONGO_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/`;

mongoose.connect(uri,{ retryWrites: true, writeConcern: "majority", appName: cluster, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const titleNotPresent = 'missing required field title';

const bookSchema = new mongoose.Schema({
  title: String,
  comments: [String]
});

const Book = mongoose.model('Book', bookSchema);

function getBookDetailsById(bookid, res) {
  Book.findById(bookid, function(err, book) {
    if (err || !book) {
      return res.send('no book exists');
    }
    res.json(book);
  });
}

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      return Book.find({}, function(err, books){
        if(err){
          return res.send(err0);
        }
        if(!err && books){
          let response = books.map((book) => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length
            }
          });
          return res.json(response);
        }
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if(!title){
        return res.send(titleNotPresent);
      }
      Book.create({title: title}, function(err, book){
        if(!err && book){
          return res.json({_id: book._id, title: book.title});
        }
      });
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, function(err, books){
        if(err){
          return res.send(err);
        }
        if(!err && books){
          return res.send('complete delete successful');
        }
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      getBookDetailsById(bookid, res);
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if(!comment){
        return res.send('missing required field comment');
      }
      Book.updateOne({_id: bookid}, {$push: {comments: comment}}, function(err, book){
        if(err){
          return res.send('no book exists');
        }
        getBookDetailsById(bookid, res);
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      Book.deleteOne({_id: bookid}, function(err, deleteResult){
        if(err || deleteResult.deletedCount === 0){
          return res.send('no book exists');
        }
        return res.send('delete successful');
      });
    });
  
};
