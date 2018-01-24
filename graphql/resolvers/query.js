const { models } = require('../../models');

module.exports = {
event (root, { id }) {
    return models.Event.findById(id);
  },
  events (root, args, context) {
    return models.Event.findAll({}, context)
  },
  eventsByRoom (root, args, context) {
    return models.Event.findAll({where: { roomId: args.roomId}}, context)
  },
user (root, { id }) {
    return models.User.findById(id);
  },
  users (root, args, context) {
	  if(args.containsId){
		return models.User.findAll({where: { id: args.containsId}}, context);		  
	  }else{
		return models.User.findAll({}, context);
	  }
  },
room (root, { id }) {
    return models.Room.findById(id);
  },
  rooms (root, args, context) {
    return models.Room.findAll({}, context);
  }
};
