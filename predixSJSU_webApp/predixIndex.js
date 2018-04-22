var express = require('express');
var app = express();
var axios = require('axios');
    var request = require("request");


app.get('/predixdata' , function(req , res){
	console.log("Mangesh Checksession: ");


var options = { method: 'GET',

  url: 'https://624eff02-dbb1-4c6c-90bc-fa85a29e5fa8.predix-uaa.run.aws-usw02-pr.ice.predix.io/oauth/token',

  qs: { grant_type: 'client_credentials' },

  headers: { Authorization: 'Basic aWMucHJvZC5ncGF0bC5kZXZlbG9wOmRlRlF1dGJMZ1BLcEg2azY=' } };

  request(options, function (error, response, body) {

	  if (error) throw new Error(error);

	  setTimeout(function(){
		  var token = JSON.parse(body);
	  var temp = 'Bearer ' + token.access_token;
	  console.log(temp);

	  var options1 = { method: 'GET',
					   url: 'https://ic-metadata-service-sdhack.run.aws-usw02-pr.ice.predix.io/v2/metadata/assets/1f2a7193-7b7b-4dfe-97cc-9988d19f5f1c',
					   headers: { 'Predix-Zone-Id': 'SD-IE-TRAFFIC', 'Authorization':temp } 
					 };

	request(options1, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);
	  res.send(body);

	})
	  }, 3000);
	  
  });
});


app.listen(5000, () => {
	console.log('Started on port 5000');
});