function contentScroll () {  
	//Функция которая мотает элемент "Названия комнат и этажей"
	row__rooms2 = document.querySelectorAll(".schedule-row__room2");
	for(var i = 0; i < row__rooms2.length; i++) {
		row__rooms2[i].style.left = document.getElementById("content").scrollLeft + 'px';
		if(document.getElementById("content").scrollLeft > 181){
			row__rooms2[i].style.visibility = "visible";
		}else{
			row__rooms2[i].style.visibility = "hidden";
		}
	}
	floors = document.querySelectorAll(".floor");
	for(var i = 0; i < floors.length; i++) {
		floors[i].style.left = (document.getElementById("content").scrollLeft + 16) + 'px';
	}
}  
function getQueryParams () {
	//Получаем параметры поиска адресной строки
	var queries = window.location.search;
	if (!queries) {
		return '';
	}
	return queries.slice(1);
};
function renderDate(today) {
	//Инициализируем начало таймлайна в численном значении
	//Иниц текущую дату, время
	MM = today.getMonth();
	hh = ("0" + today.getHours()).slice(-2);
	mm = ("0" + today.getMinutes()).slice(-2);
	var monthNames = ["янв", "фев", "мар", "апр", "май", "июн",
		"июл", "авг", "сен", "окт", "ноя", "дек"];		
	var dayNames = ["Понедел", "Вторник","Среда","Четверг","Пятница","Суббота","Воскрес"];
	//Добавляем на страницу
	if (today.getDate() == start_of_scale.getDate() && today.getFullYear() == start_of_scale.getFullYear() && today.getMonth() == start_of_scale.getMonth()) {
		document.getElementById('font__date').innerHTML = today.getDate() + " " + monthNames[MM] + " · " + "Сегодня";	
	} else {
		document.getElementById('font__date').innerHTML = today.getDate() + " " + monthNames[MM] + " · " + dayNames[today.getDay()];	
	}
	document.getElementById('timeline-hand').childNodes[1].innerHTML = hh + ":" + mm;
}
var current_time, start_of_scale, monthNamesFull = ["января", "февраля", "марта", "апреля", "мая", "июня",
				"июля", "августа", "сентября", "октября", "ноября", "декабря"];
//3 функции календаря
function nextDay() {
	current_time = new Date(current_time.getTime() + 86400000);//День++
	renderDate(current_time);	
	//Перерисовываем основное содержимое
	contentArea = document.getElementById('content-area');
	httpPostAsync("{rooms {id, title, floor, capacity}}", renderRooms, contentArea);
	hide_tooltip();
	render_calendar();
}
function previousDay() {
	current_time = new Date(current_time.getTime() - 86400000);
	renderDate(current_time);	
	contentArea = document.getElementById('content-area');
	httpPostAsync("{rooms {id, title, floor, capacity}}", renderRooms, contentArea);
	hide_tooltip();
	render_calendar();
}
function changeData(date,month,year){
	current_time.setDate(date);
	current_time.setMonth(month);
	current_time.setYear(year);
	renderDate(current_time);	
	contentArea = document.getElementById('content-area');
	httpPostAsync("{rooms {id, title, floor, capacity}}", renderRooms, contentArea);
	hide_tooltip();
	render_calendar();
}
//window.onload = function (e) {  
//Подгружаем содержимое страницы
document.addEventListener('DOMContentLoaded', function(event) {	
	queries = getQueryParams();
	//Находим, был ли "успех" - специальный атрибут в адресной строке
	if(queries.slice(0,1) == 'e' || queries.slice(0,1) == 'c'){		
		if(queries.slice(0,1) == 'e'){
			document.getElementById('popup2__message').innerHTML="Встреча сохранена!<br><span id=\"mini_message\"></span>";
		}
		if(queries.slice(0,1) == 'c'){
			document.getElementById('popup2__message').innerHTML="Встреча создана!<br><span id=\"mini_message\"></span>";
		}
		mini_message = document.getElementById('mini_message');
		id = queries.slice(2);
		if(id != ''){
			httpPostAsync("{event(id: " + id + "){dateStart,  dateEnd,  room{ title, floor}}}", renderMiniMessage, mini_message);
		}
		showPopup2();
	}	
	current_time = new Date();//Тек время
	start_of_scale = new Date();//Начало временной шкалы - 08:00
	start_of_scale.setHours(8);
	start_of_scale.setMinutes(0);
	render_calendar();
	renderDate(current_time);
	contentArea = document.getElementById('content-area');//Блок в который записывается основное содержимое страницы
	//Функция получения массива встреч, переговорок и т.д.
	httpPostAsync("{rooms {id, title, floor, capacity}}", renderRooms, contentArea);
})
// Посылаем 'POST' запрос на получение данных из БД и выполняем callback функцию с параметром elementToRender
function httpPostAsync(request, callback, elementToRender) {
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			callback(myArr, elementToRender);
		}
	};	
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.send(JSON.stringify({query: request}));	
}
/*
  Шаблон для расписания, т.е. комнат (переговорок).
*/
function renderRooms(data, elementToRender){
	for (var key in data){
		rooms=data[key].rooms;
	}
	//Сортируем по этажам
	rooms.sort(function(a,b){
		return parseInt(a.floor) - parseInt(b.floor);
	});
	var htmlToRender = '<div  id="timeline-hand2" class="schedule-scale schedule-scale-blue"></div>\
					<ul style="margin-left: 181px;">\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						<li class="timeline-topinfo"><div class="schedule-scale"></div></li>\
						</li>\
					</ul>	\
					<ul>';
	var floor = null;
	p_top = new Array();
	p_top_sum = 136;//Суммируем и запоминаем высоту для каждой переговорки - это нам пригодится
	for (var key in rooms){
		if(rooms[key].floor !== floor){
			floor = rooms[key].floor;
			htmlToRender += '				<li class="schedule-row">';
			htmlToRender += '					<div class="schedule-row__room schedule-row__floor"><span class="floor">' + rooms[key].floor + ' этаж</span></div> \n';						
			htmlToRender += '				</li> \n';
			p_top_sum += 37;
		} 
		p_top_sum += 60;
		p_top[rooms[key].id] = p_top_sum;
		htmlToRender += '				<li class="schedule-row">';
		htmlToRender += '					<div class="schedule-row__room"><span id="title-' + rooms[key].id + '" class="title">' + rooms[key].title + '</span><span class="capacity">' + rooms[key].capacity + ' человек</span></div> \n';						
		htmlToRender += '					<div class="schedule-row__timeline"> \n';
		htmlToRender += '						<ul id="schedule-events-roomId-' + rooms[key].id + '"> \n';
		htmlToRender += '						</ul> \n';		
		htmlToRender += '					</div> \n';	
		htmlToRender += '					<div class="schedule-row__room2">' + rooms[key].title + '</div> \n';						
		htmlToRender += '				</li> \n';
	}
	htmlToRender += '			</ul>';
	elementToRender.innerHTML = htmlToRender;
	len_now=current_time-start_of_scale;
	//Устанавливаем синюю стрелку времени в нужную позицию
	points_of_scale = document.querySelectorAll("#timeline-hand-value");//Заголовки Часов на полосе времени
	if((current_time - start_of_scale) > 0 && (current_time - start_of_scale) < 54000000){
		//Синий ползунок шкалы времени - текущее время
		document.getElementById('timeline-hand').style.left = (parseInt(len_now/54545) + 181) + 'px';
		document.getElementById('timeline-hand2').style.left = (parseInt(len_now/54545) + 189.5) + 'px';
		for(var i = 0; i < points_of_scale.length; i++) {	//окрашиваем в серый пройденное время
			temp = points_of_scale[i].innerHTML;
			if(parseInt(temp) <= current_time.getHours()){
				points_of_scale[i].style.color = "#858E98";
			}
		}
	}else{
		document.getElementById('timeline-hand').style.left = '-100px';
		document.getElementById('timeline-hand2').style.left = '-100px';
		if(current_time < start_of_scale){
			for(var i = 0; i < points_of_scale.length; i++) {	
				points_of_scale[i].style.color = "#858E98";
			}
		}else{
			for(var i = 0; i < points_of_scale.length; i++) {	
				points_of_scale[i].style.color = "#252525";
			}
		}
	}
	//Для каждой переговорки отдельно подгружаем список встреч
	for (var key in rooms){
		schedule_events_roomId = document.getElementById('schedule-events-roomId-' + rooms[key].id);
		httpPostAsync("{eventsByRoom(roomId: " + rooms[key].id + "){id, title, dateStart, dateEnd, users {login, avatarUrl}, room {title}}}", renderEvents, schedule_events_roomId);
	}
}
//Шаблон для встреч
function renderEvents(data, elementToRender){
	for (var key in data){
		events=data[key].eventsByRoom;
	}
	idD = elementToRender.getAttribute('id');
	roomId = idD.slice(23,idD.length);
	//Предустанавливаем кнопки для создания новой встречи на таймлайне промежутками в 1ч.
	phrase = '{ "hour08": {"dateStart":"08:00","dateEnd":"09:00"},\
		"hour09": {"dateStart":"09:00","dateEnd":"10:00"},\
		"hour10": {"dateStart":"10:00","dateEnd":"11:00"},\
		"hour11": {"dateStart":"11:00","dateEnd":"12:00"},\
		"hour12": {"dateStart":"12:00","dateEnd":"13:00"},\
		"hour13": {"dateStart":"13:00","dateEnd":"14:00"},\
		"hour14": {"dateStart":"14:00","dateEnd":"15:00"},\
		"hour15": {"dateStart":"15:00","dateEnd":"16:00"},\
		"hour16": {"dateStart":"16:00","dateEnd":"17:00"},\
		"hour17": {"dateStart":"17:00","dateEnd":"18:00"},\
		"hour18": {"dateStart":"18:00","dateEnd":"19:00"},\
		"hour19": {"dateStart":"19:00","dateEnd":"20:00"},\
		"hour20": {"dateStart":"20:00","dateEnd":"21:00"},\
		"hour21": {"dateStart":"21:00","dateEnd":"22:00"},\
		"hour22": {"dateStart":"22:00","dateEnd":"23:00"}\
	}';
	var mask = JSON.parse(phrase);
	var divToRender = '';	
	if((current_time - start_of_scale) > 0){
		for (var key in events){
			//Смотрим, если текущая дата
			if(events[key].dateStart.slice(0, 4) == current_time.getFullYear()
			&& parseInt(events[key].dateStart.slice(5, 7)) == (current_time.getMonth() + 1)
				&& parseInt(events[key].dateStart.slice(8, 10)) == current_time.getDate()){
				//Откидываем ненужные кнопки "Создать встречу"
				dateStart = events[key].dateStart.slice(11, 16);
				if(parseInt(dateStart.slice(0, 2)) < 8){
					dateStart = "08:00";
				}				
				dateEnd = events[key].dateEnd.slice(11, 16);	
				if(parseInt(dateEnd.slice(0, 2)) > 22){
					dateEnd = "22:59";
				}	
				for(var i = parseInt(dateStart.slice(0, 2)) + 1 ; i < parseInt(dateEnd.slice(0, 2)) ; i++){						
					eval('delete mask.hour' + ("0" + i).slice(-2));
				}
				var myvar1,myvar2;
				if(parseInt(dateStart.slice(3, 5)) < 10){	
					eval('delete mask.hour' + dateStart.slice(0, 2));
				}else{
					myvar1 = eval('mask.hour' + dateStart.slice(0, 2));					
					myvar1.dateEnd = dateStart;					
				}
				if(parseInt(dateEnd.slice(3, 5)) > 50){	
					eval('delete mask.hour' + dateEnd.slice(0, 2));
				}else{
					myvar2 = eval('mask.hour' + dateEnd.slice(0, 2));					
					myvar2.dateStart = dateEnd;	
				}
				if(dateStart.slice(0, 2) == dateEnd.slice(0, 2)){
					eval('delete mask.hour' + dateStart.slice(0, 2));
				}
			}
		}			
		if((current_time - start_of_scale) < 86400000){
			//Подрезаем кнопку которая пересекается со стрелкой Текущего времени (синяя)
			today = new Date(current_time.getTime() + 300000);
			hh = ("0" + today.getHours()).slice(-2);
			mm = ("0" + today.getMinutes()).slice(-2);
			currentTime = hh + ":" + mm;
			if(currentTime.slice(0, 2) >= 8 && currentTime.slice(0, 2) < 23){
				var myvar = eval('mask.hour' + currentTime.slice(0, 2));
				if(myvar){
					if(currentTime.slice(3, 5) > myvar.dateStart.slice(3, 5)){
						myvar.dateStart = currentTime;	
					}
				}
			}
		}
	}
	for (var key in events){
		//Смотрим, если текущая дата	
		if(events[key].dateStart.slice(0, 4) == current_time.getFullYear()
			&& parseInt(events[key].dateStart.slice(5, 7)) == (current_time.getMonth() + 1)
				&& parseInt(events[key].dateStart.slice(8, 10)) == current_time.getDate()){
			//Выводим встречу на таймлайн
			dateStart = events[key].dateStart.slice(11, 16);
			dateEnd = events[key].dateEnd.slice(11, 16);
			divToRender += '						<li class="single-event" data-start="' + dateStart + '" data-end="' + dateEnd + '" id="event-' + events[key].id + '" onmouseover="highlight_on(this)" onmouseout="highlight_off(this)" onmousedown="highlight_click(this)"> \n';						
			divToRender += '							<a href="#" class="single-event-name"> \n';
			divToRender += '								' + events[key].title + ' \n';
			divToRender += '							</a> \n';
			divToRender += '						</li> \n';
		}
	}	
	for (var myvar in mask){	
		//Выводим кнопки "Создать .."	
		//Тут можно было соптимизировать, но пусть так..
		if((current_time - start_of_scale) > 0){	
			if((current_time - start_of_scale) < 86400000){
				//Сегодняшний день
				if(mask[myvar].dateStart.slice(0, 2) > document.getElementById('timeline-hand').childNodes[1].innerHTML.slice(0, 2)){
					//Будущее время
					divToRender += '						<li class="single-event-empty" data-start="' + mask[myvar].dateStart + '" data-end="' + mask[myvar].dateEnd + '" id="event-new-' + roomId + '" onmouseover="highlight_on(this)" onmouseout="highlight_off(this)" onmousedown="highlight_click(this)"> \n';						
					divToRender += '							<a href="/mobile/event?new-' + roomId + '-' + ("0" + current_time.getDate()).slice(-2) + '-' + ("0" + (current_time.getMonth()+1)).slice(-2) + '-' + current_time.getFullYear() + '-' + mask[myvar].dateStart + '-' + mask[myvar].dateEnd + '"> \n';
					divToRender += '								+ \n';
					divToRender += '							</a> \n';
					divToRender += '						</li> \n';
				}
				else if(mask[myvar].dateStart.slice(0, 2) == document.getElementById('timeline-hand').childNodes[1].innerHTML.slice(0, 2)
					&& document.getElementById('timeline-hand').childNodes[1].innerHTML.slice(3, 5) < 50){
					//Текущий час - выводим только если промежуток для кнопки больше 10 минут
					divToRender += '						<li class="single-event-empty" data-start="' + mask[myvar].dateStart + '" data-end="' + mask[myvar].dateEnd + '" id="event-new-' + roomId + '" onmouseover="highlight_on(this)" onmouseout="highlight_off(this)" onmousedown="highlight_click(this)"> \n';						
					divToRender += '							<a href="/mobile/event?new-' + roomId + '-' + ("0" + current_time.getDate()).slice(-2) + '-' + ("0" + (current_time.getMonth()+1)).slice(-2) + '-' + current_time.getFullYear() + '-' + mask[myvar].dateStart + '-' + mask[myvar].dateEnd + '"> \n';
					divToRender += '								+ \n';
					divToRender += '							</a> \n';
					divToRender += '						</li> \n';
				}
			}
			else{
				//Завтрашний день
				divToRender += '						<li class="single-event-empty" data-start="' + mask[myvar].dateStart + '" data-end="' + mask[myvar].dateEnd + '" id="event-new-' + roomId + '" onmouseover="highlight_on(this)" onmouseout="highlight_off(this)" onmousedown="highlight_click(this)"> \n';						
				divToRender += '							<a href="/mobile/event?new-' + roomId + '-' + ("0" + current_time.getDate()).slice(-2) + '-' + ("0" + (current_time.getMonth()+1)).slice(-2) + '-' + current_time.getFullYear() + '-' + mask[myvar].dateStart + '-' + mask[myvar].dateEnd + '"> \n';
				divToRender += '								+ \n';
				divToRender += '							</a> \n';
				divToRender += '						</li> \n';
			}
		}
	}
	elementToRender.innerHTML = divToRender;	
	//Настраиваем CSS стиль: длина, отступ слева. Необходимые данные берутся из атрибутов блока dateStart и dateEnd
	for (var key in events){
		eventToRender = document.getElementById('event-' + events[key].id);
		if(eventToRender){
			var data_start, data_end;
			temp = eventToRender.getAttribute('data-start');
			data_start = new Date(start_of_scale);
			data_start.setHours(temp.slice(0,2));
			data_start.setMinutes(temp.slice(3,5));
			len=data_start-start_of_scale;
			p_left = parseInt(len/54540+33);
			eventToRender.style.left = p_left + 'px';		
			temp = eventToRender.getAttribute('data-end');
			data_end = new Date(start_of_scale);		
			data_end.setHours(temp.slice(0,2));
			data_end.setMinutes(temp.slice(3,5));
			len=data_end-data_start;
			width = parseInt(len/54540);
			eventToRender.style.width = width + 'px';						
			textToRender = 'tooltip(this,\'<a class="button__editevent" href="/mobile/event?' + events[key].id + '">/</a><span class="event-title">' + events[key].title + '</span><br><span class="event-description">';
			dayWithZero = events[key].dateStart.slice(8,10);
			monthWithZero = events[key].dateStart.slice(5,7);
			textToRender += parseInt(dayWithZero) + ' ' + monthNamesFull[parseInt(monthWithZero)-1] + ', ' + eventToRender.getAttribute('data-start') + '—' + eventToRender.getAttribute('data-end') + '  ·  ' + events[key].room.title + '</span>';
			if(events[key].users.length > 0){
				textToRender += '<br><div class="users"><span class="avatar" style="background-image:url(' + events[key].users[0].avatarUrl + ')">.</span><span class="login" >' + events[key].users[0].login + '</span>';
				if(events[key].users.length > 1){
					len = events[key].users.length -1;
					if(len % 10 > 4 || len % 100 == 11 || len % 100 == 12 || len % 100 == 13 || len % 100 == 14){
						textToRender += '<span class="login" style="color: #858E98"> и ' + len + ' участников</span>';		
					}else if(len % 10 == 1){
							textToRender += '<span class="login" style="color: #858E98"> и ' + len + ' участник</span>';		
						}else{
							textToRender += '<span class="login" style="color: #858E98"> и ' + len + ' участника</span>';								
						}	
										
				}
				textToRender += '</div>';
			}
			textToRender += '\', ' + (p_left + width/2)  + ', ' + p_top[roomId] + ')';
			eventToRender.childNodes[1].setAttribute('onclick', textToRender);
		}
	}
	//Так же поступаем для кнопок "Создать встречу" на таймлайне
	freeSlotsToRender = document.querySelectorAll('#event-new-' + roomId);
	for(var i = 0; i < freeSlotsToRender.length; i++) {
		var data_start, data_end;
		temp = freeSlotsToRender[i].getAttribute('data-start');
		data_start = new Date(start_of_scale);
		data_start.setHours(temp.slice(0,2));
		data_start.setMinutes(temp.slice(3,5));
		len=data_start-start_of_scale;
		p_left = parseInt(len/54540+33);
		freeSlotsToRender[i].style.left = p_left + 'px';		
		temp = freeSlotsToRender[i].getAttribute('data-end');
		data_end = new Date(start_of_scale);		
		data_end.setHours(temp.slice(0,2));
		data_end.setMinutes(temp.slice(3,5));
		len=data_end-data_start;
		width = parseInt(len/54540);
		freeSlotsToRender[i].style.width = width + 'px';	
	}
	//Проверяем доступность переговорки
	//Если есть хоть одна кнопка "Создать встречу" - название комнаты будет светиться черным, иначе серым, т.е. недоступно
	row = elementToRender.parentElement.parentElement;
	s = row.querySelectorAll(".single-event-empty");
	if(s.length == 0){
		if(row.childNodes[1].childNodes[0] && row.childNodes[1].childNodes[1]){
			row.childNodes[1].childNodes[0].setAttribute("class","title a_grey");
			row.childNodes[1].childNodes[1].setAttribute("class","capacity a_grey");
		}
		if(row.childNodes[5]){
			row.childNodes[5].setAttribute("class","schedule-row__room2 a_grey");
		}
	}
}
//Шаблон для удовлетворительного сообщения
function renderMiniMessage(data, elementToRender){
	for (var key in data){
		ev=data[key].event;
	}
	textToRender = '';
	textToRender += parseInt(ev.dateStart.slice(8,10)) + ' ' + monthNamesFull[parseInt(ev.dateStart.slice(5,7)) - 1] + ', ' + ev.dateStart.slice(11, 16) + '—' + ev.dateEnd.slice(11, 16)+ '<br>';
	textToRender += ev.room.title + ' · ' + ev.room.floor +' этаж';
	elementToRender.innerHTML = textToRender;
}
//Тултип с информацией о переговорке
function tooltip(el,txt,x,y) {
	tipobj=document.getElementById('popup');
	tipobj.childNodes[1].innerHTML = txt;
	tipobj.style.visibility="visible";
	tipobj.childNodes[3].style.left=(x + 173 - document.getElementById("content").scrollLeft) + "px";
	tipobj.style.top=y + "px";
}
function hide_tooltip() {
	document.getElementById('popup').style.visibility='hidden';
}
//Календарь
function render_calendar(){
	calendar('calendar', current_time.getFullYear(), current_time.getMonth());
}
function calendar(id, year, month) {
	var Dlast = new Date(year,month+1,0).getDate(),
		D = new Date(year,month,Dlast),
		DNlast = new Date(D.getFullYear(),D.getMonth(),Dlast).getDay(),
		DNfirst = new Date(D.getFullYear(),D.getMonth(),1).getDay(),
		calendar = '<tr>',
		month=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
	if (DNfirst != 0) {
	  for(var  i = 1; i < DNfirst; i++) calendar += '<td>';
	}else{
	  for(var  i = 0; i < 6; i++) calendar += '<td>';
	}
	for(var  i = 1; i <= Dlast; i++) {
	  if (i == current_time.getDate() && D.getFullYear() == current_time.getFullYear() && D.getMonth() == current_time.getMonth()) {
		calendar += '<td class="today">' + i;
	  }else{
		calendar += '<td><span onclick="changeData(' + i + ',' + D.getMonth() + ',' + D.getFullYear() + ');hide_calendar()">' + i + '</span>';
	  }
	  if (new Date(D.getFullYear(),D.getMonth(),i).getDay() == 0) {
		calendar += '<tr>';
	  }
	}
	for(var  i = DNlast; i < 7; i++) calendar += '<td> ';
	document.querySelector('#'+id+' tbody').innerHTML = calendar;
	document.querySelector('#'+id+' thead td:nth-child(1)').innerHTML = month[D.getMonth()] +' '+ D.getFullYear();
	document.querySelector('#'+id+' thead td:nth-child(2)').dataset.month = D.getMonth();
	document.querySelector('#'+id+' thead td:nth-child(2)').dataset.year = D.getFullYear();
	if (document.querySelectorAll('#'+id+' tbody tr').length < 6) {  // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
		document.querySelector('#'+id+' tbody').innerHTML += '<tr><td> <td> <td> <td> <td> <td> <td> ';
	}
}
function show_calendar() {	
	hide_tooltip();
	document.getElementById('button-calendar').setAttribute('onclick', 'hide_calendar(this)');	
	document.getElementById('calendar-wrapper').style.visibility='visible';
}
function hide_calendar() {
	document.getElementById('button-calendar').setAttribute('onclick', "show_calendar(this)");	
	document.getElementById('calendar-wrapper').style.visibility='hidden';
}
function highlight_on(el){
	id = el.parentElement.getAttribute('id').slice(23);
	document.getElementById('title-' + id).style.color='#0070E0';
	document.getElementById('title-' + id).style.fontFamily='HelveticaNeue-Bold';
}
function highlight_off(el){	
	id = el.parentElement.getAttribute('id').slice(23);
	document.getElementById('title-' + id).style.color='';
	document.getElementById('title-' + id).style.fontFamily='';
}
function highlight_click(el){	
	id = el.parentElement.getAttribute('id').slice(23);
	document.getElementById('title-' + id).style.color='#1D54FE';
	document.getElementById('title-' + id).style.fontFamily='HelveticaNeue-Bold';
}
function closePopup2(){
	document.getElementById("popup2").style.visibility = "hidden";
	document.getElementById("bg").style.visibility = "hidden"	
}
function showPopup2(){
	document.getElementById("popup2").style.visibility = "visible";
	document.getElementById("bg").style.visibility = "visible"	
}






