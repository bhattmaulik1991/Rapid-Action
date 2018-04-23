var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var axios = require('axios');
var request = require("request");
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://predix:predix@ds251819.mlab.com:51819/predix_mlab_db';
var database;
var nodemailer = require('nodemailer');
app.use(bodyparser.json());

MongoClient.connect(MONGO_URL, (err, db) => {  
	  
	  if (err) {
	    console.log("Db connection error",err);
	  }
	  else {
	  	console.log("db connected");
	  	database = db;
	  }
})

app.post('/login' , function(req , res){
	var collection = database.collection('predix_admin');
    collection.find({username : req.body.username, password : req.body.password}).toArray(function(err , result){
        if(result[0]){
            res.status(200).send();
        }else{
            res.status(401).send();
        }
     })
});

app.post('/register' , function(req , res){
  var collection = database.collection('predix_admin');
    collection.insertOne({username : req.body.username, email : req.body.email, password : req.body.password}, function(err , result){
        if(result){
            res.status(200).send("Success");
        }else{
            res.status(401).send();
        }
     })
});

app.post('/traffic', function(req, res){


	var locationId = req.param("locationId");
    var errors;
    
    var getLocation={locationUid: locationId};
    console.log("Query is:"+JSON.stringify(getLocation));
    var data = {
        vehicleCount:""
    };

        database.collection("predix_traffic").find(getLocation).toArray(function(err, results) {
            if (err) throw err;
			var vCount = 0;
			var i = 0;
            if(results.length>0){
                 while(i<results.length) {
					vCount = vCount + results[i].measures.counter_direction_vehicleCount;					  
					i++;
				}           
                data = {
						vehicleCount: vCount
					};
            }			
            else {
                errors = "Unable to fetch details.";
                res.status(400).json(errors);
            }
            console.log("results : ",JSON.stringify(results));
			console.log("data : ",JSON.stringify(results));
			res.send(data);
        })
 })


app.post('/pedestrian', function(req, res){


	var locationId = "9f61e092";
    var errors;
    
    var getLocation={locationUid: locationId};
    console.log("Query is:"+JSON.stringify(getLocation));
    var data = {
        pedestrianCount:""
    };

        database.collection("predix_ped").find(getLocation).toArray(function(err, results) {
            if (err) throw err;
			var vCount = 0;
			var i = 0;
            if(results.length>0){
                 while(i<results.length) {
					vCount = vCount + results[i].measures.pedestrianCount;					  
					i++;
				}           
                data = {
						pedestrianCount: vCount
					};
            }			
            else {
                errors = "Unable to fetch details.";
                res.status(400).json(errors);
            }
            console.log("results : ",JSON.stringify(results));
			console.log("data : ",JSON.stringify(results));
			res.send(data);
        })
 })


app.get('/predixdata' , function(req , res){
	console.log("Mangesh Checksession: ");


var options = { method: 'GET',

  url: 'https://624eff02-dbb1-4c6c-90bc-fa85a29e5fa8.predix-uaa.run.aws-usw02-pr.ice.predix.io/oauth/token',

  qs: { grant_type: 'client_credentials' },

  headers: { Authorization: 'Basic aWMucHJvZC5ncGF0bC5kZXZlbG9wOmRlRlF1dGJMZ1BLcEg2azY=' } };

  request(options, function (error, response, body) {

	  if (error) throw new Error(error);

	  var token = JSON.parse(body);
	  var temp = 'Bearer '+ token.access_token;
	  console.log('token: ' +"'"+temp+"'" );

	  var options1 = { method: 'GET',
					   url: 'https://ic-metadata-service-sdhack.run.aws-usw02-pr.ice.predix.io/v2/metadata/assets/522de83f-e524-4f76-80f0-463d3815b7a4',
					   headers: { 'Predix-Zone-Id': 'SD-IE-TRAFFIC', 'Authorization': temp} 
					 };

		console.log(options1.headers);

	request(options1, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);
	  res.send(body);

	});
  });
});

app.post('/sendmail' , function(req , res){

	console.log("sending email");

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'hello.sample.world@gmail.com',
      pass: 'predixsjsu'
    }
  });

  var db = database.collection('predix_user');

  db.find().toArray(function(err, result){

  	var emails = [];

  	result.forEach(function(i){
  		emails.push(i.email);
  	})

	  var mailOptions = {
	    from: 'hello.sample.world@gmail.com',
	    to: emails,
	    subject: req.body.notificationheader,
	    text: req.body.notoficationbody
	  };

	  transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	    res.send(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	    res.send(info.response);
	  }
	  });

  });


})

app.get('/userreports', function(req, res){
  var db = database.collection('predix_user_report');
  db.find().toArray(function(err, result){
  	if(err){
  		console.log(err);
  	}
  	else
  	{
  		res.send(result);	
  	}
  })
})

app.get('/incidents', function(req, res){
  var db = database.collection('predix_user_report');

  var inc = req.param("severity");

  db.find({'severity':inc}).toArray(function(err, result){

  	if(err){
  		console.log(err);
  	}
  	else
  	{
  		res.send(result);	
  	}
  })
})

app.post('/incidents', function(req, res){
  var db = database.collection('predix_user_report');
  db.insertOne({username:req.body.username,message:req.body.message,latlang:req.body.latlang,severity:req.body.severity,Timestamp:req.body.Timestamp} , function(err , response){
      if(err){
          console.log(err);                               
      }else{
          console.log("incident added added ");
          res.send("Added");
      }
  })
})

app.listen(5000, () => {
	console.log('Started on port 5000');
});