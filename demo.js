
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const gridFSstorage = require('multer-gridfs-storage');
const grid = require('gridfs-stream');
const override = require('method-override');

//init express server
const demo = express();



demo.use(bodyParser.json());
demo.use(override('_method'))
demo.set('view engine', 'ejs');

//MONGO CONNECTION
const mongoURI = 'mongodb+srv://pkavounas:pkavounas@demodb-vhfuu.mongodb.net/test?retryWrites=true&w=majority';

const connect = mongoose.createConnection(mongoURI);

//GRIDFS
let gfs;
connect.once('open', () => {
    gfs = grid(connect.db, mongoose.mongo);
    gfs.collection('uploads');
})


//STORAGE
const storage = new gridFSstorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });










//load index.ejs
  demo.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('index', { files: false });
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('index', { files: files });
      }
    });
  });

//Uploads file to mongoDB
demo.post('/upload', upload.single('file'), (req, res) => {
    // res.json({file: req.file});
    res.redirect('/');

});


//Display all files in JSON
demo.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if(!files || files.length === 0){
      return res.status(404).json({
        err: 'No files'
      });

    }
    return res.json(files);
  });
});

//Display single file in JSON using given filename in url
demo.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    
    return res.json(file);
  });
});

//display image by filename request
demo.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});


//delete from DB
demo.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});



const port = 2000;

demo.listen(port, () => console.log(`Server running on port ${port}`))