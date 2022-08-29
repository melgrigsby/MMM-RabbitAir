# MMM-RabbitAir
This is a [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror) module that will display air quality data from [RabbitAir](https://www.rabbitair.com/) air purifiers.

## Dependencies
* [AWS IoT SDK for Javascript](https://github.com/aws/aws-iot-device-sdk-js)
* [axios](https://www.npmjs.com/package/axios)
* [form-data](https://www.npmjs.com/package/form-data)
* [moment](https://www.npmjs.com/package/moment)

## Installation
1. Navigate to `~/MagicMirror/modules` and clone this repository:

   `git clone https://github.com/melgrigsby/MMM-RabbitAir.git`

2. Install modules with `npm install`.
3. Edit your MagicMirror's config.js file to include the following:

   ```javascript
    {
          disabled: false,
          module: 'MMM-RabbitAir',
          header: 'RabbitAir Status',
          position: 'bottom_left',
          config: {
                 username: 'your_rabbitair_username',
                 password: 'your_rabbitair_password'
          }
    }
    ```

## Screenshot
<img width="395" alt="Screen Shot 2022-05-18 at 8 09 19 PM" src="https://user-images.githubusercontent.com/44874904/169176708-48bc8bd9-d239-453f-87c5-374b969c28d1.png">

<sub>**Disclaimer:** I am not a programmer, so this is not the most polished piece of code.  But if you'd like to improve upon it, pull requests would be welcomed. :)</sub>
