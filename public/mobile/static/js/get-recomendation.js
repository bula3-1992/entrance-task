/**
 * @typedef {Object} Person
 * @property {String} login ������������� ����������.
 * @property {Number} floor "��������" ���� ����������.
 * @property {String} avatar ������ �� ������.
 */

/**
 * @typedef {Object} Room
 * @property {Number} id ������������� �����������.
 * @property {String} title �������� �����������.
 * @property {Number} capacity ����������� (���������� �������).
 * @property {Number} floor ����, �� ������� ����������� �����������.
 */

/**
 * @typedef {Object} EventDate
 * @property {Number} start Timestamp ������ �������.
 * @property {Number} end Timestamp ��������� �������.
 */

/**
 * @typedef {Object} Event
 * @property {String} id ������������� �������.
 * @property {String} title �������� �������.
 * @property {String[]} members ������ ���������� �������.
 * @property {EventDate} date ���� � ����� ���������� �������.
 * @property {Number} room ������������� �����������.
 */

/**
 * @typedef {Object} RoomsSwap
 * @property {string} event ������������� �������.
 * @property {String} room ����� ������������� �����������.
 */ 

/**
 * @typedef {Object} Recommendation
 * @property {EventDate} date ���� � ����� ���������� �������.
 * @property {String} room ������������� �����������.
 * @property {RoomsSwap[]} [swap] ����������� ������ ���������� ��� ���������� ������������.
 */

/**
 * @param {EventDate} date ���� ����������� �������.
 * @param {Person[]} members ��������� ����������� �������.
 * @param {Event[]} events ������ ��� ������.
 * @param {Room[]} rooms ������ ���� �����������.
 * @param {Person[]} persons ������ ���� �����������.
 * @returns {Recommendation[]}
 */
function getRecommendation(date, members, events, rooms, persons) {	
	var dateStart = new Date(date.dateStart.slice(0, 19));
	var dateEnd = new Date(date.dateEnd.slice(0, 19));
	if(dateStart.isValid() && dateEnd.isValid()){
		var forbiddenRooms = new Array();
		//������� ������ ��� ������
		for (var i = 0; i < events.length; i++) {
			var eventDateStart = new Date(events[i].dateStart.slice(0, 19));
			var eventDateEnd = new Date(events[i].dateEnd.slice(0, 19));
			if(dateStart > eventDateEnd || dateEnd < eventDateStart){
				//event �� ������������ � ��������
			}else{
				forbiddenRooms[forbiddenRooms.length] = events[i].room.id;
			}
		}
		//���������� output
		phrase = '{"recommendation": [';	
		for (var i = rooms.length -1 ; i >=0 ; i--) {
			if(forbiddenRooms.contains(rooms[i].id)){
				rooms.splice(i,1);//������� �������� ������� �� ������� ���� �����������
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



