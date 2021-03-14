const {format}= require('timeago.js');


const helpers = {}

helpers.timeago = (timestamp) => {
   return format(timestamp);
};


helpers.time = (timestamp) => {
   const date = new Date(timestamp);
   return date.getDate() + "/"+ (date.getMonth() +1 ) + "/" + date.getFullYear() + " - " +date.toLocaleTimeString();
};

module.exports = helpers;