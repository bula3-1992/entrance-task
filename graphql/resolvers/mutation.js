const { models } = require('../../models');

module.exports = {
  // User
  createUser (root, { input }, context) {
	if (!input.login) {
		throw new Error(`Couldn't create user. Field "login" is required`);
	}
    return models.User.create(input);
  },

  updateUser (root, { id, input }, context) {
	
    return models.User.findById(id)
            .then(user => {
				if (!user) {
					throw new Error(`Couldn't find user with id ${id}`);
				}
				return user.update(input);
            });
  },

  removeUser (root, { id }, context) {
    return models.User.findById(id)
            .then(user => {
				if (!user) {
					throw new Error(`Couldn't find user with id ${id}`);
				}
				user.destroy()
			});
  },

  // Room
  createRoom (root, { input }, context) {
	if (!input.title || !input.capacity || !input.floor) {
		throw new Error(`Couldn't create room. Fields "title", "capacity" and "floor" is required`);
	}
    return models.Room.create(input);
  },

  updateRoom (root, { id, input }, context) {
    return models.Room.findById(id)
            .then(room => {
				if (!room) {
					throw new Error(`Couldn't find room with id ${id}`);
				}
				return room.update(input);
            });
  },

  removeRoom (root, { id }, context) {
    return models.Room.findById(id)
            .then(room => {
				if (!room) {
					throw new Error(`Couldn't find room with id ${id}`);
				}
				room.destroy()
			});
  },

  // Event
  createEvent (root, { input, usersIds, roomId }, context) {
	if (!input.title || !input.dateStart || !input.dateEnd) {
		throw new Error(`Couldn't create room. Fields "title", "dateStart" and "dateEnd" is required`);
	}  
    return models.Event.create(input)
            .then(event => {
              event.setRoom(roomId);

              return event.setUsers(usersIds)
                    .then(() => event);
            });
  },

  updateEvent (root, { id, input }, context) {
    return models.Event.findById(id)
            .then(event => {
				if (!event) {
					throw new Error(`Couldn't find event with id ${id}`);
				}
				return event.update(input);
            });
  },

  removeUserFromEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              event.removeUser(userId);
              return event;
            });
  },  
  
  addUserToEvent(root, {id, userId}, context){
	  return models.Event.findById(id)
            .then(event => {
              return event.addUser(userId)
                    .then(() => event);
            });
  },

  changeEventRoom (root, { id, roomId }, context) {
    return models.Event.findById(id)
            .then(event => {
              return event.setRoom(roomId)
                    .then(() => event);
            });
  },

  removeEvent (root, { id }, context) {
    return models.Event.findById(id)
            .then(event => {
				if (!event) {
					throw new Error(`Couldn't find event with id ${id}`);
				}
				event.destroy()
			});
  }
};
