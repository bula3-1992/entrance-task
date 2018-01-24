function getQueryParams () {
	//Получаем параметры поиска адресной строки
	var queries = window.location.search;
	if (!queries) {
		return '';
	}
	return queries.slice(1);
};
var ev, current_time, listUsers, monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля",
					"августа", "сентября", "октября", "ноября", "декабря"];
					
document.addEventListener('DOMContentLoaded', function(event) {	
	//Узнаем текущую дату, параметры адрес. строки, инициализируем прочие переменные
	current_time = new Date();
	queries = getQueryParams();
	contentArea = document.getElementById('form-container');
	listUsers = new Array();
	if(queries.slice(0,3) == 'new'){
		renderNewInput(null, contentArea);
	} else {
		id = parseInt(queries);
		httpPostAsync("{event(id: " + id + "){id, title,  dateStart,  dateEnd,  users {id,  login,  avatarUrl},  room{id,  title}}}", renderInput, contentArea);	
	}
})

//Посылаем асинхронный запрос на сервер GraphQL - тянем данные
function httpPostAsync(request, callback, elementToRender) {
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			//В случае успеха передаем полученный ответ в нужную функцию
			callback(myArr, elementToRender);
		}
	};	
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.send(JSON.stringify({query: request}));	
}

//Формируем контент
function renderNewInput(data, elementToRender){	
	//Если создается новая запись
	contentArea.childNodes[1].innerHTML = 'Новая встреча';
	var htmlToRender = '				<form id="event_form" class="editor__form" method="post" action="/graphql">\
				<div class="form__title">\
					<p>Тема</p>\
					<span id="input__clear" onclick="hideClear(this);">&nbsp;</span>\
					<input id="element_title" name="element_title" class="input__title" maxlength="255" placeholder="О чём будете говорить?" type="text" onchange="checkClear(this)"> \
				</div>	\
				<div class="form__date">\
					<p>Дата и время</p>\
					<span id="calendar_icon">&nbsp;</span>';
	if(parseInt(queries.slice(6,8)) > 0 && parseInt(queries.slice(9,11)) > 0 && queries.slice(12,16) != ''){
		htmlToRender += '				<input id="element_date" name="element_date" class="input__date" value="' + parseInt(queries.slice(6,8)) + ' ' + monthNames[parseInt(queries.slice(9,11))-1] + ', ' + queries.slice(12,16) + '" type="text"> ';
	} else {
		htmlToRender += '				<input id="element_date" name="element_date" class="input__date" value="' + current_time.getDate() + ' ' + monthNames[current_time.getMonth()] + ', ' + current_time.getFullYear() + '" type="text"> ';
	}			
	htmlToRender += '				</div>	\
				<div class="form__time">\
					<input id="element_timeStart" name="element_timeStart" class="input__time" value="';
	if(queries.slice(17,22) != ''){
		htmlToRender += queries.slice(17,22);
	} 
	htmlToRender += '" type="text" onchange="changeRecomendations();";>\
				</div>	\
				<p style="display: inline-block; width: 22px; text-align: center;">—</p> \
				<div class="form__time">\
					<input id="element_timeEnd" name="element_timeEnd" class="input__time" value="';
	if(queries.slice(23,28)!= ''){
		htmlToRender += queries.slice(23,28);
	} 
	htmlToRender += '" type="text" onchange="changeRecomendations();";>\
				</div>	\
				<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
				<div class="form__users">\
					<p>Участники</p>\
					<input id="element_users" name="element_users" class="input__users" maxlength="255" placeholder="Например, Тор Одинович" type="text"> \
					<div id="form__contacts">\
					</div> \
					<div id="list_users">\
					</div> \
				</div> \
				<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
				<div class="form__rooms">\
					<p>Рекомендованные переговорки</p>\
					<div id="radio" class="radio__rooms">\
					</div>\
				</div>\
			</form>\
			<span id="footer__errormessage">Ошибка</span>\
			<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
			<div id="footer" style="text-align: center;">\
				<a class="footer__link" href="#" onclick="submit_create()" style="width: 238px;">Создать встречу</a>\
			</div>';	
	elementToRender.innerHTML += htmlToRender;
	element_users = document.getElementById('form__contacts');
	$('#form__contacts').slimScroll({height: '102px',width: '328px'});
	httpPostAsync("{users{ id, login, homeFloor, avatarUrl}}", renderContacts, element_users);
	changeRecomendations();
	$("#element_timeStart").mask("99:99");
	$("#element_timeEnd").mask("99:99");
	checkClear(document.getElementById('element_title'));
}
function changeRecomendations(){
	//Функция обновления рекомендаций подходящей переговорки, только для "Новой встречи" 
	//вызывается 1 раз при загрузке и каждый раз при смене времени
	element_rooms = document.getElementById('radio');
	document.getElementById('radio').parentElement.childNodes[1].innerHTML="Рекомендованные переговорки";	
	httpPostAsync("{members: users(containsId: []) {login, homeFloor, avatarUrl},\
				  events {id, title, members: users {login}, dateStart, dateEnd, room {id}},\
				  rooms {id, title, capacity, floor},\
				  persons: users {login, homeFloor, avatarUrl}}", renderRooms, element_rooms);		
}
function renderInput(data, elementToRender){	
	//Если происходит редактирование уже имеющейся записи встречи
	contentArea.childNodes[1].innerHTML = 'Редактирование встречи';
	for (var key in data){
		ev=data[key].event;
	}
	if(ev){
		dayWithZero = ev.dateStart.slice(8,10);
		monthWithZero = ev.dateStart.slice(5,7);
		var htmlToRender = '				<form id="event_form" class="editor__form" method="post" action="/graphql">\
					<div class="form__title">\
						<p>Тема</p>\
						<span id="input__clear" onclick="hideClear(this);">&nbsp;</span>\
						<input id="element_title" name="element_title" class="input__title" maxlength="255" placeholder="О чём будете говорить?" type="text" onchange="checkClear(this)" value="' + ev.title + '"> \
					</div>	\
					<div class="form__date">\
						<p>Дата и время</p>\
						<span id="calendar_icon">&nbsp;</span>\
						<input id="element_date" name="element_date" class="input__date" value="' + parseInt(dayWithZero) + ' ' + monthNames[parseInt(monthWithZero)-1] + ', ' + ev.dateStart.slice(0,4) + '" type="text"> \
					</div>	\
					<div class="form__time">\
						<p>Начало</p>\
						<input id="element_timeStart" name="element_timeStart" class="input__time" value="' + ev.dateStart.slice(11, 16) + '" type="text">\
					</div>	\
					<p style="display: inline-block; width: 22px; text-align: center;">—</p> \
					<div class="form__time">\
						<p>Конец</p>\
						<input id="element_timeEnd" name="element_timeEnd" class="input__time" value="' + ev.dateEnd.slice(11, 16) + '" type="text"> \
					</div>	\
					<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
					<div class="form__users">\
						<p>Участники</p>\
						<input id="element_users" name="element_users" class="input__users" maxlength="255" placeholder="Например, Тор Одинович" type="text"> \
						<div id="form__contacts">\
						</div> \
						<div id="list_users">\
						</div> \
					</div> \
					<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
					<div class="form__rooms">\
						<p>Рекомендованные переговорки</p>\
						<div id="radio" class="radio__rooms">\
						</div>\
					</div>\
				</form>\
				<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
				<a class="footer__removelink" href="#" onclick="showPopup2()">Удалить встречу</a>\
				<span id="footer__errormessage">Ошибка</span>\
				<div style="background: #E9ECEF; height: 8px; margin: 20px -16px 0 -16px;">\</div> \
				<div id="footer">\
					<a class="footer__link" href="/mobile/">Отмена</a>\
					<a class="footer__link blue" href="#" onclick="submit_edit()"><span class="white">Сохранить</span></a>\
				</div>';
		elementToRender.innerHTML += htmlToRender;
		element_users = document.getElementById('form__contacts');
		$('#form__contacts').slimScroll({height: '102px',width: '328px'});
		httpPostAsync("{users{ id, login, homeFloor, avatarUrl}}", renderContacts, element_users);
		element_rooms = document.getElementById('radio');
		httpPostAsync("{rooms{ id, title, capacity, floor}}", renderRooms, element_rooms);	
		$("#element_timeStart").mask("99:99");
		$("#element_timeEnd").mask("99:99");
		checkClear(document.getElementById('element_title'));
	}
}
function renderContacts(data, elementToRender){
	//Формируем контент - список всех пользователей для выпадающего списка пользователей
	for (var key in data){
		users=data[key].users;
	}
	var divToRender = '';	
	for (var key in users){
		divToRender += '							<a href="#" class="contact" value="' + users[key].id + '" onmousedown="addUser(this)"><span class="avatar2" style="background-image:url(' + users[key].avatarUrl + ')">.</span><span class="login2">' + users[key].login + '</span> · <span class="homeFloor">' + users[key].homeFloor + ' этаж</span></a>\n';
	}
	elementToRender.innerHTML += divToRender;
	$(document).ready(function(){
		$("#element_users").on("keyup", function() {
			var value = $(this).val().toLowerCase();
			$("#form__contacts a").filter(function() {
				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
			});
		});
	});	
	if(ev){
		//Если страница - "Редактирование встречи", определяем каких пользователей нужно вывести на экран
		contacts = document.querySelectorAll(".contact");
		for(var i = 0; i < contacts.length; i++) {
			temp = contacts[i].getAttribute("value");
			for(var j = 0; j < ev.users.length; j++) {
				if(temp == ev.users[j].id){
					addUser(contacts[i]);
				}
			}
		}
	}
}
function renderRooms(data, elementToRender){
	//Формируем контент - Список переговорок
	for (var key in data){
		if(data[key].members){
			members=data[key].members;
		}
		if(data[key].events){
			events=data[key].events;
		}
		if(data[key].rooms){
			rooms=data[key].rooms;
		}
		if(data[key].persons){
			persons=data[key].persons;
		}
	}	
	if(!ev){//Если "Создание новой встречи"
		phrase = '{ "dateStart": "' + parseDate() + 'T' + document.getElementById("element_timeStart").value + ':00.000Z", \
			"dateEnd": "' + parseDate() + 'T' + document.getElementById("element_timeEnd").value + ':00.000Z" }';//данные о времени встречи
		var date = JSON.parse(phrase);
		//Получаем рекомендации подходящих переговорок
		var recommendation = getRecommendation(date, members, events, rooms, persons);
		var divToRender = '';	
		for (var i = 0; i < recommendation.length; i++) {
			divToRender+='					<input type="radio" name="list" value="' + recommendation[i].room.id + '" id="list[' + i + ']" onclick="document.getElementById(\'radio\').parentElement.childNodes[1].innerHTML=\'Ваша переговорка\'">\
							<label id="label-' + i + '" for="list[' + i + ']" onclick="hideLabels(this)"><span style="font-family: HelveticaNeue-Bold; margin-right: 12px;">' + recommendation[i].dateStart.slice(11,16) + '—' + recommendation[i].dateEnd.slice(11,16) + '</span><span style="font-family: HelveticaNeue;">' + recommendation[i].room.title + ' · ' + recommendation[i].room.floor + ' этаж</span></label>';
		}
		divToRender+='					<span id="button__uncheck" onclick="uncheck()">&nbsp;</span>';
		elementToRender.innerHTML = divToRender;
		
		//Часть кода, которая отвечает за то, чтобы выбрать пользовательскую переговорку в качестве текущей,
		//срабатывает 1 раз при загрузке страницы
		if(queries.slice(4,5) != ''){
			roomId = queries.slice(4,5);	
			queries = '';
			list_inputs = document.getElementsByName("list");
			for (i = 0; i < list_inputs.length; i++) {
				if (list_inputs[i].getAttribute("value") == roomId) {
					list_inputs[i].checked = true;
					id = list_inputs[i].getAttribute("id").slice(5,-1);
					hideLabels(document.getElementById('label-' + id));
					document.getElementById('radio').parentElement.childNodes[1].innerHTML="Ваша переговорка";	
				}
			}   
		}
	}else{
		//Если "Редактирование встречи"
		var divToRender = '';	
		for (i = 0; i < rooms.length; i++){
			divToRender+='					<input type="radio" name="list" value="' + rooms[i].id + '" id="list[' + i + ']" onclick="document.getElementById(\'radio\').parentElement.childNodes[1].innerHTML=\'Ваша переговорка\'">\
							<label id="label-' + i + '" for="list[' + i + ']" onclick="hideLabels(this)"><span style="font-family: HelveticaNeue;">' + rooms[i].title + ' · ' + rooms[i].floor + ' этаж</span></label>';
		}
		divToRender+='					<span id="button__uncheck" onclick="uncheck()">&nbsp;</span>';
		elementToRender.innerHTML = divToRender;
		roomId = ev.room.id;		
		list_inputs = document.getElementsByName("list");
		for (i = 0; i < list_inputs.length; i++) {
			if (list_inputs[i].getAttribute("value") == roomId) {
				list_inputs[i].checked = true;
				id = list_inputs[i].getAttribute("id").slice(5,-1);
				hideLabels(document.getElementById('label-' + id));
				document.getElementById('radio').parentElement.childNodes[1].innerHTML="Ваша переговорка";	
			}
		}   
	}
}
function checkClear(el) {  
	if(el.value != ''){
		document.getElementById('input__clear').style.visibility = "visible";
	}
	else{
		document.getElementById('input__clear').style.visibility = "hidden";
	}
}  

function hideClear(el){	
	el.style.visibility = "hidden";
	document.getElementById('element_title').value = '';
}
function uncheck(){	
	$("input:radio").removeAttr("checked");
	list_inputs = document.getElementsByName("list");
	for (i = 0; i < list_inputs.length; i++) {
		document.getElementById('label-' + i).style.display = "";
	}  
	document.getElementById('radio').parentElement.childNodes[1].innerHTML="Рекомендованные переговорки";	
}
function hideLabels(el){
	list_inputs = document.getElementsByName("list");
	for (i = 0; i < list_inputs.length; i++) {
		if (el.getAttribute("id").slice(6) != i) {
			document.getElementById('label-' + i).style.display = "none";
		}
	}   
}
function addUser(el){	
	id = el.getAttribute('value');
	exist = false;
	for(var i=0; i < listUsers.length; i++){
		if(listUsers[i] == id){
			exist = true;
		}
	}
	if(!exist){
		listUsers[listUsers.length] = id;
		var divToRender = '<div class="list_user" id="user-' + id + '">' +  el.childNodes[0].outerHTML +  el.childNodes[1].outerHTML + '<a class="button__userdelete" href="#" onclick="deleteUser(this)">X</a></div>';
		document.getElementById('list_users').innerHTML += divToRender;
	}
}
function deleteUser(el){	
	id = el.parentElement.getAttribute('id').slice(5);
	exist = false;
	for(var i=0; i < listUsers.length; i++){
		if(listUsers[i] == id){
			listUsers.splice(i, 1);
		}
	}
	el.parentElement.remove();
}
function submit_create(){	
	//Запрос и отработка ответа на создание встречи
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	var mutation = 'mutation{createEvent(\
		input:\
			{title: "' + document.getElementById("element_title").value + '", \
			dateStart: "' + parseDate() + 'T' + document.getElementById("element_timeStart").value + ':00.000Z" , \
			dateEnd: "' + parseDate() + 'T' + document.getElementById("element_timeEnd").value + ':00.000Z" }, \
		usersIds:[';
	for(var i = 0; i < listUsers.length; i++){
		mutation += listUsers[i]
		if(i != listUsers.length-1){
			mutation += ',';
		}
	}	
	mutation += '],';
	
	if(document.querySelector('input[name=list]:checked')){
		mutation += '	roomId:' + document.querySelector('input[name=list]:checked').value + ') {';
	}else{	  
		showError("Выберите переговорку");
		return;
	}
	mutation += '	id\
	}}';
	xhr.send(JSON.stringify({query: mutation}));
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				createEvent=data[key].createEvent;
			}
			if(createEvent){
				location.replace('/mobile/success?c_' + createEvent.id);
			}else{
				showError("Ошибка");
			}
		}
		if (this.readyState == 4 && this.status == 400) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
		if (this.readyState == 4 && this.status == 500) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
	};		
}
function showError(ermessage){
	document.getElementById("footer__errormessage").innerHTML = ermessage;
	document.getElementById("footer__errormessage").style.visibility = "visible";
	setTimeout('document.getElementById("footer__errormessage").style.visibility = "hidden";', 3000);
}
function showPopup2(){
	document.getElementById("popup2").style.visibility = "visible";
	document.getElementById("bg").style.visibility = "visible"	
}
function closePopup2(){
	document.getElementById("popup2").style.visibility = "hidden";
	document.getElementById("bg").style.visibility = "hidden"	
}
function submit_delete(){	
	//Запрос и отработка ответа на удаление встречи
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	var mutation = 'mutation{\
	  removeEvent(id: ' + ev.id + ') {\
		id\
	  }\
	}';
	xhr.send(JSON.stringify({query: mutation}));
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			if(errors){
				showError("Ошибка");
			}else{
				location.replace('/mobile/success?d');
			}
		}
		if (this.readyState == 4 && this.status == 400) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
		if (this.readyState == 4 && this.status == 500) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
	};		
}

function submit_edit(){	
	//Запрос и отработка ответа на изменение встречи
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/graphql");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	var mutation = 'mutation{\
	  updateEvent(id: ' + ev.id + ',\
	    input:\
			{title: "' + document.getElementById("element_title").value + '", \
			dateStart: "' + parseDate() + 'T' + document.getElementById("element_timeStart").value + ':00.000Z" , \
			dateEnd: "' + parseDate() + 'T' + document.getElementById("element_timeEnd").value + ':00.000Z" }) {\
		id\
	  },';	  
	for(var i = 0; i < listUsers.length; i++) {
		idToAdd = listUsers[i];
		exist = false;
		for(var j = 0; j < ev.users.length; j++) {
			if(idToAdd == ev.users[j].id){
				exist = true;
			}
		}
		if(!exist){
			mutation += '  add' + i + ': addUserToEvent(id: ' + ev.id + ', userId: ' + idToAdd + ') {id},';
		}
	}
	for(var i = 0; i < ev.users.length; i++) {
		idToDelete = ev.users[i].id;
		exist = false;
		for(var j = 0; j < listUsers.length; j++) {
			if(idToDelete == listUsers[i]){
				exist = true;
			}
		}
		if(!exist){
			mutation += '  delete' + i + ': removeUserFromEvent(id: ' + ev.id + ', userId: ' + idToDelete + ') {id},';
		}
	}  
	if(document.querySelector('input[name=list]:checked')){
		mutation += '  changeEventRoom(id: ' + ev.id + ', roomId:' + document.querySelector('input[name=list]:checked').value + ') {';
	}else{	  
		showError("Выберите переговорку");
		return;
	}
	mutation += '  	id\
	  }\
	}';
	xhr.send(JSON.stringify({query: mutation}));
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				updateEvent=data[key].updateEvent;
				changeEventRoom=data[key].changeEventRoom;
			}
			if(updateEvent && changeEventRoom){
				location.replace('/mobile/success?e_' + ev.id);
			}else{
				showError("Ошибка");
			}
		}
		if (this.readyState == 4 && this.status == 400) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
		if (this.readyState == 4 && this.status == 500) {
			var data = JSON.parse(this.responseText);
			for (var key in data){
				errors=data[key].errors;
			}
			showError("Ошибка");
		}
	};		
}

function parseDate(){
	//Распознавание введенной даты
	date = parseInt(document.getElementById("element_date").value);
	for(var i = 0; i < monthNames.length; i++){
		if(document.getElementById("element_date").value.indexOf(monthNames[i]) + 1)
			month = i+1;
	}	
	year = parseInt(document.getElementById("element_date").value.slice(-4));
	return year + '-' + ("0" + month).slice(-2) + '-' + ("0" + date).slice(-2);
}


