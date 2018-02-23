var User   = require('../models/user');
var Video  = require('../models/video');
var jwt    = require('jsonwebtoken');
var config = require('../../config');
var fs     = require('fs');

var superSecret = config.secret;

module.exports = function(app, express) {
   var apiRouter = express.Router();

   apiRouter.post('/login', function(req, res) {
      User.findOne({email: req.body.email}, 'name email lastName username password', function (err, user) {
         if(err)
            res.send(err);

         if(!user) {
            res.json({
               success: false,
               message: 'Autenticación fallida. Usuario no encontrado.'
            });
         } else if(user) {
            var validatePwd = user.comparePassword(req.body.password);
            if(!validatePwd) {
               res.json({
                  success: false,
                  message: 'Contraseña incorrecta.'
               });
            } else {
               var token = jwt.sign({
                  name: user.name,
                  username: user.username
               }, superSecret, {
                  expiresIn: "20h"
               });

               res.json({
                  success: true,
                  messagee: 'Autenticación exitosa.',
                  user: user,
                  token: token
               });
            }
         }
      });
   });

   apiRouter.use(function(req, res, next) {
      var token = req.headers['x-access-token'];

      if(token) {
         jwt.verify(token, superSecret, function (err, decoded) {
            if(err) {
               return res.status(403).send({
                  success: false,
                  message: 'Token no valido.'
               });
            } else {
               req.decoded = decoded;
               next();
            }
         });
      } else {
         return res.status(403).send({
            success: false,
            message: 'No token provided.'
         });
      }
   });

   apiRouter.get('/', function(req, res) {
      res.json({ message: 'hooray! welcome to our api!' });
   });

   apiRouter.route('/video/moderator')
   .get(function (req, res) {
      Video.find({approved: false, status: 'pending'}).then(function (videos) {
         var aux = JSON.parse(JSON.stringify(videos));
         for (var i = 0; i < videos.length; i++) {
            aux[i].video = fs.readFileSync('videos/' + videos[i].name);
         }
         res.json({success: true, videos: aux});
      }, function (err) {
         res.json({success: false, error: err});
      });
   });

   apiRouter.route('/video/:video_id')
   .put(function (req, res) {
      Video.findById(req.params.video_id, function (err, video) {
         if (err) {
            res.send({success: false, err: err});
         }

         if (req.body.approved) {
            video.approved = req.body.approved;
         }
         if (req.body.status) {
            video.status = req.body.status;
         }
         video.save(function(err) {
            if (err) {
               return res.send({success: false, err: err});
            }
            res.json({success: true, message: 'Video updated'});
         });
      });
   })
   .delete(function (req, res) {
      Video.remove({
         _id: req.params.video_id
      }, function (err) {
         if (err) {
            return res.send({success: false, err: err});
         }
         res.json({success: true, message: 'Video eliminado exitosamente.'});
      });
   });

   apiRouter.route('/users')
   .post(function(req, res) {
      var user      = new User();
      user.name     = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;
      user.email    = req.body.email;
      user.lastName = req.body.lastName;
      user.role     = req.body.role;

      user.save(function(err) {
         if(err){
            if (err.code == 11000)
               return res.json({sucess: false, message: 'A user with that username already exists.'});
            else
               return res.send(err);
         }

         res.json({message: 'User created.'});
      });
   })
   .get(function(req, res) {
      User.find(function(err, users) {
         if(err)
            res.send(err);

         res.json(users);
      });
   });

   apiRouter.route('/users/:user_id')
   .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
         if(err)
            res.send(err);

         res.json(user);
      })
   })
   .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
         if (err)
            res.send({success: false, err: err});

         if(req.body.name)
            user.name = req.body.name;
         if(req.body.username)
            user.username = req.body.username;
         if(req.body.password)
            user.password = req.body.password;
         if(req.body.email)
            user.email = req.body.email;
         if(req.body.role)
            user.role = req.body.role;

         user.save(function(err) {
            if (err) {
               return res.send({success: false, err: err});
            }
            res.json({success: true, message: 'User updated'});
         });
      });
   })
   .delete(function(req, res) {
      User.remove({
         _id: req.params.user_id
      }, function(err, user) {
         if(err)
            return res.send(err);
         res.json({message: 'Successfully deleted', user: user});
      });
   });

   return apiRouter;
}
