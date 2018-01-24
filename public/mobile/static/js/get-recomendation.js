/**
 * @typedef {Object} Person
 * @property {String} login Идентификатор сотрудника.
 * @property {Number} floor "Домашний" этаж сотрудника.
 * @property {String} avatar Ссылка на аватар.
 */

/**
 * @typedef {Object} Room
 * @property {Number} id Идентификатор переговорки.
 * @property {String} title Название переговорки.
 * @property {Number} capacity Вместимость (количество человек).
 * @property {Number} floor Этаж, на котором расположена переговорка.
 */

/**
 * @typedef {Object} EventDate
 * @property {Number} start Timestamp начала встречи.
 * @property {Number} end Timestamp окончания встречи.
 */

/**
 * @typedef {Object} Event
 * @property {String} id Идентификатор встречи.
 * @property {String} title Название встречи.
 * @property {String[]} members Логины участников встречи.
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {Number} room Идентификатор переговорки.
 */

/**
 * @typedef {Object} RoomsSwap
 * @property {string} event Идентификатор встречи.
 * @property {String} room Новый идентификатор переговорки.
 */ 

/**
 * @typedef {Object} Recommendation
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {String} room Идентификатор переговорки.
 * @property {RoomsSwap[]} [swap] Необходимые замены переговорк для реализации рекомендации.
 */

/**
 * @param {EventDate} date Дата планируемой встречи.
 * @param {Person[]} members Участники планируемой встречи.
 * @param {Event[]} events Список все встреч.
 * @param {Room[]} rooms Список всех переговорок.
 * @param {Person[]} persons Список всех сотрудников.
 * @returns {Recommendation[]}
 */
function getRecommendation(date, members, events, rooms, persons) {	
	var dateStart = new Date(date.dateStart.slice(0, 19));
	var dateEnd = new Date(date.dateEnd.slice(0, 19));
	if(dateStart.isValid() && dateEnd.isValid()){
		var forbiddenRooms = new Array();
		//Листаем Список все встреч
		for (var i = 0; i < events.length; i++) {
			var eventDateStart = new Date(events[i].dateStart.slice(0, 19));
			var eventDateEnd = new Date(events[i].dateEnd.slice(0, 19));
			if(dateStart > eventDateEnd || dateEnd < eventDateStart){
				//event не пересекается с временем
			}else{
				forbiddenRooms[forbiddenRooms.length] = events[i].room.id;
			}
		}
		//Переменная output
		phrase = '{"recommendation": [';	
		for (var i = rooms.length -1 ; i >=0 ; i--) {
			if(forbiddenRooms.contains(rooms[i].id)){
				rooms.splice(i,1);//Удаляем ненужные комнаты из списока всех переговорок
			}
		}
		for (var i = 0; i < rooms.length ; i++) {		
			phrase += '{ "dateStart": "' + date.dateStart + '", "dateEnd": "' + date.dateEnd + '",\
			"room":	{"id": ' + rooms[i].id + ', "title": "' + rooms[i].title + '", "capacity": ' + rooms[i].capacity + ', "floor": ' + rooms[i].floor + '}}';
			if(i != rooms.length - 1){
				phrase += ',';
			}
		}
		phrase += ']}';
		var data = JSON.parse(phrase);
		return data.recommendation;
	}else{
		return defaults(date, rooms);	
	}
}
function defaults(date, rooms){
	phrase = '{"recommendation": [';	
	for (var i = 0; i < rooms.length; i++) {
		phrase += '{ "dateStart": "' + date.dateStart + '", "dateEnd": "' + date.dateEnd + '",\
		"room":	{"id": ' + rooms[i].id + ', "title": "' + rooms[i].title + '", "capacity": ' + rooms[i].capacity + ', "floor": ' + rooms[i].floor + '}}';
		if(i != rooms.length - 1){
			phrase += ',';
		}
	}
	phrase += ']}';
	var data = JSON.parse(phrase);
	return data.recommendation;
}

Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};  

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}



