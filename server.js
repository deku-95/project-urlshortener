require('dotenv').config();
const express = require('express');
const fs = require('fs');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require("body-parser");
var urlmodule = require('valid-url');

const app = express();

app.use(cors());

app.use((err, req, res, next) => {
  res.locals.error = err;
  const status = err.status || 500;
  res.status(status);
  res.render('error');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// add json file
const mongoDB = process.env['ATLAS_URI']


// Basic Configuration
const port = process.env.PORT || 3000;


///////////////////////////////////////////////////////
//Set up default mongoose connection

mongoose
  .connect(
    mongoDB, { useNewUrlParser: true }, err => {
      if (err) throw err;
      console.log('Connected to MongoDB!!!')
    });

autoIncrement.initialize(mongoose.connection);


/// DATABASE ////



const schema = new Schema({
  url: String
})

schema.plugin(autoIncrement.plugin, 'url');


var Url = mongoose.model('Url', schema);







app.use('/public', express.static(`${process.cwd()}/public`));





app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json());






app.post('/api/shorturl', (req, res) => {
  var query = req.body.url;
  console.log('New URL: ' + query);
  const hostname = query.replace(/https?:\/\//, "");
  validateURL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

  if (validateURL.test(query) === false) {
    console.log("error on domain")
    return res.json(
      { error: 'invalid url' }
    )
      ;
  }

  Url.findOne({ url: query }, function(err, storedURL) {
    if (err) {
      return (err)
    } else {


      if (storedURL) {
        return res.json({
          original_url: storedURL.url, short_url: storedURL._id
        })
          ;



      }


      else {

        const newURL = new Url({
          url: query
        });



        return newURL.save().then(storedURL => {
          return res.json({
            original_url: storedURL.url, short_url: storedURL._id
          })
        })
      }
    }


  }
  )
});



app.get('/api/shorturl/:id', function(req, res, next) {
  var id = req.params.id;
  Url.findOne({ _id: id }).then(m => {
    return res.redirect(m.url)
  }

  )
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
