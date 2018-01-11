window.onscroll = function (e) {  
	document.getElementById('scrollable_header1').style.left = '-' + window.pageXOffset + 'px';
	document.getElementById('scrollable_header2').style.left = '-' + window.pageXOffset + 'px';
}  
//window.onload = function (e) {  
document.addEventListener('DOMContentLoaded', function(event) {
	var single_events, start_of_scale, point_of_scale;
	//Инициализируем начало таймлайна в численном значении
	start_of_scale = new Date('1970-01-01T08:00:00Z');
	//Иниц текущую дату, время
	today = new Date();
	dd = today.getDate();
	MM = today.getMonth();
	hh = ("0" + today.getHours()).slice(-2);
	mm = ("0" + today.getMinutes()).slice(-2);
	var monthNames = ["янв", "фев", "мар", "апр", "май", "июн",
		"июл", "авг", "сен", "окт", "ноя", "дек"];
	//Добавляем на страницу
	current_time = document.getElementById('font__date').innerHTML = dd + " " + monthNames[MM] + " · " + "Сегодня";	
	current_time = document.getElementById('timeline-hand').childNodes[1].innerHTML = hh + ":" + mm;
	data_start = new Date('1970-01-01T' + current_time + ':00Z');
	len_now=data_start-start_of_scale;
	//Устанавливаем синюю стрелку в нужную позицию
	document.getElementById('timeline-hand').style.left = (len_now > -1800000 ? parseInt(len_now/54545) : -33) + 'px';
	//Значения шкалы времени - окрашиваем в серый пропущенное время
	points_of_scale = document.querySelectorAll("#timeline-hand-value");
	for(var i = 0; i < points_of_scale.length; i++) {
		temp = points_of_scale[i].innerHTML;
		if(parseInt(temp) <= parseInt(current_time)){
			points_of_scale[i].style.color = "#858E98"
		}
	}
	//Вводим массив для комнат, а также переговорок и т.д.
	contentArea = document.getElementById('content-area');
	httpPostAsync("{rooms {id, title, floor, capacity}}", renderRooms, contentArea);
})
// Посылаем 'POST' запрос на получение данных из БД и выполняем callback функцию с параметром elementToRender
function httpPostAsync(request, callback, elementToRender) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.onload = function () {
		callback(xhr.response, elementToRender);
	}
	xhr.send(JSON.stringify({query: request}));	
}
/*
  Шаблон для расписания.
*/
function renderRooms(data, elementToRender){
	for (var key in data){
		rooms=data[key].rooms;
	}
	rooms.sort(function(a,b){
		return parseInt(a.floor) - parseInt(b.floor);
	});
	var htmlToRender = '			<ul>';
	var floor = null;
	for (var key in rooms){
		if(rooms[key].floor !== floor){
			floor = rooms[key].floor;
			htmlToRender += '				<li class="schedule-row">';
			htmlToRender += '					<div class="schedule-row__room schedule-row__floor"><span class="floor">' + rooms[key].floor + ' этаж</span></div> \n';						
			htmlToRender += '				</li> \n';
		} 
		htmlToRender += '				<li class="schedule-row">';
		htmlToRender += '					<div class="schedule-row__room"><span class="title">' + rooms[key].title + '</span><span class="capacity">' + rooms[key].capacity + ' человек</span></div> \n';						
		htmlToRender += '					<div class="schedule-row__timeline"> \n';
		htmlToRender += '						<ul id="schedule-events-roomId-' + rooms[key].id + '"> \n';
		htmlToRender += '						</ul> \n';
		htmlToRender += '					</div> \n';	
		htmlToRender += '				</li> \n';
	}
	htmlToRender += '			</ul>';
	elementToRender.innerHTML += htmlToRender;
	for (var key in rooms){
		schedule_events_roomId = document.getElementById('schedule-events-roomId-' + rooms[key].id);
		httpPostAsync("{eventsByRoom(roomId: " + rooms[key].id + "){id, title, dateStart, dateEnd, users {login, avatarUrl}}}", renderEvents, schedule_events_roomId);
	}
}
//Шаблон для переговорок
function renderEvents(data, elementToRender){
	for (var key in data){
		events=data[key].eventsByRoom;
	}
	var divToRender = '';	
	for (var key in events){
		divToRender += '						<li class="single-event" data-start="' + events[key].dateStart.slice(11, 16) + '" data-end="' + events[key].dateEnd.slice(11, 16) + '" id="event-' + events[key].id + '"> \n';						
		divToRender += '							<a href="#0" class="single-event-name"> \n';
		divToRender += '								' + events[key].title + ' \n';
		divToRender += '							</a> \n';
		divToRender += '						</li> \n';
	}
	elementToRender.innerHTML += divToRender;	
	//Настраиваем CSS стиль
	start_of_scale = new Date('1970-01-01T08:00:00Z');
	for (var key in events){
		eventToRender = document.getElementById('event-' + events[key].id);
		var data_start, data_end;
		temp = eventToRender.getAttribute('data-start');
		data_start = new Date('1970-01-01T' + temp + ':00Z');
		len=data_start-start_of_scale;
		eventToRender.style.left = parseInt(len/54545+33) + 'px';		
		temp = eventToRender.getAttribute('data-end');
		data_end = new Date('1970-01-01T' + temp + ':00Z');
		len=data_end-data_start;
		eventToRender.style.width = parseInt(len/54545) + 'px';
	}
}