// Magic Mirror module:
// MMM-RabbitAir.js
//
// By Melissa Grigsby, who is not a programmer


Module.register('MMM-RabbitAir',{
	defaults: {
    		username: '',
    		password: '',
  	},

	sensors: {},

  	start: function() {
    		Log.info(`Starting module: ${this.name}`);
    		this.sendSocketNotification('RABBITAIR_CONFIG', this.config);
    		Log.info(`${this.name} SENT RABBITAIR_CONFIG`);
  	},

  	getStyles: function() {
   		return ['font-awesome.css'];
  	},

  	socketNotificationReceived(notification, payload) {
    		if (notification === 'SENSOR_DATA') {
      			let sensorData = payload;
			this.sensors[sensorData[0]] = sensorData[1];
			this.updateDom();
		}
	},
  
  	// DOM wrapper
  	getDom: function()  {
    		var wrapper = document.createElement('div');
    
		Object.entries(this.sensors).forEach((entry) => {
			let table = document.createElement('table');
			table.style.margin = '20px 5px';
                	table.style.textAlign = 'left';
			wrapper.appendChild(table);
			
			const [key, value] = entry;
			Object.entries(value).forEach((childEntry) => {
				var newrow = document.createElement('tr');
				const [key, value] = childEntry;
	
				var attributeTitle = document.createElement('td');
				attributeTitle.innerHTML = key;
				attributeTitle.className = 'xsmall bright';
				newrow.appendChild(attributeTitle);

				var attributeData = document.createElement('td');

				attributeData.className = 'xsmall';
					
       				if (Array.isArray(value)) {
                                        var listAttributes = document.createElement('ul');
                                        for (i = 0; i < value.length; i++) {
                                                var listItem = document.createElement('li');
                                                listItem.innerHTML = value[i];
                                                listAttributes.appendChild(listItem);
                                        };
					attributeData.appendChild(listAttributes);
                                } else {
					attributeData.innerHTML = value;
				}
				
				newrow.appendChild(attributeData);

				table.appendChild(newrow);
			});
		});
    		return wrapper;
  	}
});
