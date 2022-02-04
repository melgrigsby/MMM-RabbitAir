//
// MMM-RabbitAir.js
// Node helper script
//
// By Melissa Grigsby, who is not a programmer
//

const NodeHelper = require('node_helper');
const RabbitAir = require('node-rabbitair'); 

module.exports = NodeHelper.create({

  start() {
     console.log(`Starting module helper: ${this.name}`);
  },
 
  // Receive defaults from MMM-RabbitAir.js
  socketNotificationReceived(notification, payload) {
     if (notification === 'RABBITAIR_CONFIG') {
         console.log(`NOTIFICATION RECEIVED FROM ${this.name}`);
         this.getSensorData(payload);
     }
   },

  // Get sensor data
  getSensorData(payload) {
    stuff = RabbitAir.connectToAWS(payload.username, payload.password)
    console.log(stuff);
    this.sendSocketNotification('SENSOR_DATA', stuff);
  }

  // Use node-alarm-dot-com module to login to Alarm.com and pull a list
  // of all sensors and their attributes, then send it back to MMM-Frontpoint.js
  //getDevices(payload) {
  //  this.config = payload;
  //  const nodeADC = require('node-alarm-dot-com'); 
  //  nodeADC
  //    .login(this.config.username, this.config.password, this.config.mfaCookie)
  //    .then(res => nodeADC.getCurrentState(res.systems[0], res))
  //    .then(res => {
  //       const mySensors = res.sensors
  //       this.sendSocketNotification('ADC_DEVICES', mySensors)
  //       console.log(`ADC_DEVICES SENT TO ${this.name}`)
  //    })
  //    .catch(err => {
  //       console.error(err)
  //    })
  //}

});
