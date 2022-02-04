// Magic Mirror module:
// MMM-RabbitAir.js
//
// By Melissa Grigsby, who is not a programmer


Module.register('MMM-RabbitAir',{
  defaults: {
    username: 'bgrigsby2004@gmail.com',
    password: 'hCj8BO6817G0',
  },

  start() {
    Log.info(`Starting module: ${this.name}`);
    this.sendSocketNotification('RABBITAIR_CONFIG', this.config);
    Log.info(`${this.name} SENT RABBITAIR_CONFIG`);
    sensorData = {}; 
  },

  getStyles: function() {
   return ['font-awesome.css'];
  },

  // Populate list of devices received from node_helper
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'SENSOR_DATA') {
      Log.info(`${this.name} RECEIVED SENSOR DATA`);
      this.sensorData = payload
      })
    }
    this.updateDom();
  },
  
  // DOM wrapper
  getDom()  {
    var wrapper = document.createElement('div');
    
    let table = document.createElement('table');
    wrapper.appendChild(table);
    
    let row = document.createElement('tr');
    let cell = documenet.createElement('td');
    let sensors = document.createElement('span');
    sensors.textContent = JSON.stringify(this.sensorData);
    cell.appendChild(sensors);
    row.appendChild(cell);
    table.appendChild(row);

    return wrapper;
  }
});
