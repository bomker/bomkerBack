var Video  = require('../models/video');
var multer = require('multer');
var fs     = require('fs');

var storageVid = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'videos/');
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '.webm');
   }
});
var upload  = multer({storage: storageVid});

module.exports = function (app, express) {
   var apiRouter = express.Router();

   apiRouter.route('/video/create')
   .post(upload.single('video'), function (req, res) {
      var video = new Video();
      video.name = req.file.filename;
      video.path = 'videos/' + req.file.filename
      video.save(function (err) {
         if (err) {
            return res.json({message: 'No se pudo crear el video.', success: false, error: err});
         }
         res.json({success: true, message: 'Video guardado exitosamente.'});
      });
   });

   apiRouter.route('/video/getAll')
   .get(function (req, res) {
      Video.find().then(function (videos) {
         var aux = JSON.parse(JSON.stringify(videos));
         for (var i = 0; i < videos.length; i++) {
            aux[i].video = fs.readFileSync('videos/' + videos[i].name);
         }
         res.json({success: true, videos: aux});
      }, function (err) {
         res.json({success: false, error: err});
      });
   });

   apiRouter.route('/video/beamusicstar')
   .get(function (req, res) {
      Video.find({approved: true, status: 'active'}).then(function (videos) {
         var aux = JSON.parse(JSON.stringify(videos));
         for (var i = 0; i < videos.length; i++) {
            aux[i].video = fs.readFileSync('videos/' + videos[i].name);
         }
         res.json({success: true, videos: aux});
      }, function (err) {
         res.json({success: false, error: err});
      });
   });

   return apiRouter;
}
