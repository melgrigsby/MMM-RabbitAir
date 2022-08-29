const NodeHelper = require('node_helper');
const axios = require('axios');
const FormData = require('form-data');
var awsIot = require('aws-iot-device-sdk');
var moment = require('moment');

module.exports = NodeHelper.create({

	start: function () {
		console.log(this.name + ": Starting node helper");
    		this.loaded = false;
	},
 
	socketNotificationReceived: async function(notification, payload) {
        	var self = this;
		var config = payload;
        	console.log(self.name + ' Notification received: ' + notification + ' ' + payload);
	        if (notification === 'RABBITAIR_CONFIG') {
        		var config = payload;
            		console.log(self.name + ' RABBITAIR_CONFIG: ' + config);
               		await this.getRabbitairData(config.username, config.password)
                        	.then(res => {
                                	console.log('RabbitAir devices retrieved');
	                        });
            		self.loaded = true;
        	};
    	},

 	getRabbitairData: async function(username, password) {
		let myToken;
		await this.login(username, password)
			.then(res => {
				myToken = res;
			})

		let myDevices = {};
		await this.retrieveDevices(myToken)
			.then(res => {
				myDevices = res;
			})

		this.startClient(myDevices);
	},

	login: async function(username, password) {
		const LOGIN_URL = 'https://ota.rabbitair.com/restapi/null/users/login_by_pass';      
		let body;
      		const form_data = new FormData();
      		form_data.append('email', username);
      		form_data.append('password', password);
      		await axios.post(LOGIN_URL, form_data, { headers: form_data.getHeaders() })
        		.then(res => {
           		body = res.data;
        	})
      		return body.token;
	},

	retrieveDevices: async function(token) {
  
  		let location_list;
  		let device_list = [];
  		let awsAccessKeyId;
  		let awsSecretAccessKey;
  		let awsSessionToken;
  
  		const deviceUrl = 'https://ota.rabbitair.com/restapi/'+token+'/users/location_list';
  		const awsUrl = 'https://ota.rabbitair.com/restapi/'+token+'/users/update_aws_token';

  		await axios.post(deviceUrl)
    			.then(res => {
       				for (i = 0; i < res.data.locations.length; i++) {
         				device_list.push(res.data.locations[i].units[0])
       				}
     			})
  
  		await axios.post(awsUrl)
    			.then(res => {
       				awsAccessKeyId = res.data.AccessKeyId;
       				awsSecretAccessKey = res.data.SecretAccessKey;
       				awsSessionToken = res.data.SessionToken;
    			})
		this.sendSocketNotification('RABBITAIR_DEVICES', device_list);  
		return {
    			accessKeyId: awsAccessKeyId,
    			secretAccessKey: awsSecretAccessKey,
    			sessionToken: awsSessionToken,
    			devices: device_list
  			};
	},

	startClient: function(deviceJSON) {
		var self = this;
		var thingShadows = awsIot.thingShadow({
           		host: 'au32ip2ri54us-ats.iot.us-east-1.amazonaws.com',
                	protocol: 'wss',
                	accessKeyId: deviceJSON.accessKeyId,
                	secretKey: deviceJSON.secretAccessKey,
                	sessionToken: deviceJSON.sessionToken,
                	region: 'us-east-1',
                	clientID: 'node-rabbitair'
        	});
	
		let subscribeTopics = [];
        	let publishTopics = [];
	
		for (i = 0; i < deviceJSON.devices.length; i++) {
			subscribeTopics.push('$aws/things/'+deviceJSON.devices[i].thing_name+'/shadow/update/documents'); 
        	        publishTopics.push('$aws/things/'+deviceJSON.devices[i].thing_name+'/shadow/update');        
		};

		thingShadows.on('connect', function() {
                	for (i = 0; i < subscribeTopics.length; i++) {
                        	thingShadows.subscribe(subscribeTopics[i]);
                        	console.log('Subscribed to '+subscribeTopics[i]);
                	}

                	const initialMessage = {
                        	"state": {
                                	"desired": {
                                		"con_state": 1
                                	}
                        	}
                	};
  
                	for (i = 0; i < publishTopics.length; i++) {
                        	thingShadows.publish(publishTopics[i], JSON.stringify(initialMessage));
                        	console.log('Published to initial message to '+publishTopics[i]);
                	};
        	});

	       	let previousSettings = {};

        	thingShadows.on('message', function(topic, payload) {
                	payloadData = JSON.parse(payload.toString());
                	deviceSettings = payloadData.current.state.reported;
                	triggerSettings = {
                        	moodlight: deviceSettings.moodlight,
                        	quality: deviceSettings.quality,
                        	pm_sensor: deviceSettings.pm_sensor,
                        	gas: deviceSettings.gas
                	};
 			if (JSON.stringify(triggerSettings) !== JSON.stringify(previousSettings)) {   
                        	console.log('Updated settings received from '+topic);
                        	previousSettings = triggerSettings;
                		self.formatMessage(topic, deviceSettings, deviceJSON.devices);
			}
        	});

 		thingShadows.on('error', function(error) {
                	console.log('error', error);
        	});
	
	},

	formatMessage: function(topic, payload, devices) {

	      	// Extract thing_name from topic
      		const prefix = 'things/';
      		const suffix = '/shadow';
      		const thingName = topic.split(prefix)[1].split(suffix)[0];

		let locationName;
      		let data = {};

      		// Match AWS thing name with Rabbit Air device name
		for (i = 0; i < devices.length; i++) {
        		if (thingName === devices[i].thing_name) {
          			locationName = devices[i].location_name;
        		};
      		};

     		if (payload.quality === 1) {
        		quality = "Poor";
     		};
     		if (payload.quality === 2) {
        		quality = "OK";
     		};
     		if (payload.quality === 3) {
        		quality = "Good";
     		};
     		if (payload.quality === 4) {
        		quality = "Excellent";
     		};

     		let particles = [];
     		particles.push("PM 1.0 density is "+payload.pm_sensor[0]+" ug/m3");
     		particles.push("PM 2.5 density is "+payload.pm_sensor[1]+" ug/m3");
     		particles.push("PM 10 density is "+payload.pm_sensor[2]+" ug/m3");

     		let odor;
     		if (payload.gas === 1) {
       			odor = "Excellent";
     		};
     		if (payload.gas === 2) {
       			odor = "Good";
     		};
     		if (payload.gas === 3) {
       			odor = "OK";
     		};
     		if (payload.gas === 4) {
       			odor = "Poor";
     		};

    		filterLifetime = moment.duration(payload.filter_life, "minutes");
    		filterMessage = "Replace filter in "+moment(filterLifetime.asDays())+" days";

		data = [];
		data.push(locationName);
		data.push( {
			"Location": locationName,
       			"Air Quality": quality,
       			"PM": particles,
       			"Odor": odor,
       			"Filter": filterMessage
			}
		);
    		this.sendSocketNotification('SENSOR_DATA', data);
	}

});
