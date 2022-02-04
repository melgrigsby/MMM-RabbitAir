//
// MMM-RabbitAir.js
// Node helper script
//
// By Melissa Grigsby, who is not a programmer
//

const NodeHelper = require('node_helper');
var connectToAws = require('node-rabbitair'); 

module.exports = NodeHelper.create({

  start() {
     console.log(`Starting module helper: ${this.name}`);
  },
 
  // Receive defaults from MMM-RabbitAir.js
  socketNotificationReceived(notification, payload) {
     console.log('RABBIT AIR RECEIVED CONFIG');
     if (notification === 'RABBITAIR_CONFIG') {
         console.log(`NOTIFICATION RECEIVED FROM ${this.name}`);
         this.getSensorData(payload);
     }
   },

  // Get sensor data
  getSensorData(payload) {
    stuff = connectToAws(payload.username, payload.password);
    console.log(this.stuff);
    this.sendSocketNotification('SENSOR_DATA', stuff);
    console.log('RABBIT AIR DATA SENT AS SOCKET NOTIFICATION');
  }

});
