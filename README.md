# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql
* mobile-detect
для тестов:
* chai
* chai-http
* mocha

## Запуск
```
npm i
npm run dev
```
Для сброса данных в базе:
```
npm run reset-db
```
Для запуска UNIT-тестов, при выключенном сервере:
```
npm test
```

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Решение + комментарии

1. models/index.js  			7:19 	- null,null заменить на 'sqlite:mydb.sqlite3' для запуска
2. index.js  					14:17 	- Ошибка в слове graphql, было g вместо q
3. typeDefs.js  				8:22 	- Удалить лишний код "type UserRooms"
								14:5	- Добавить avatarUrl:String
4. graphql/resolvers/query.js  	20:33 	- Удалить неправильный код "offset:1" из функции findAll()
								8:35	- Удалить лишний код "arguments" из функции findAll(), в последствии необходимый функционал будет реализован в запросе EventsByRoom()
5. graphql/resolvers/index.js	14:9	- Добавить кл. слово return
								17:9	- То же самое
6. graphql/resolvers/mutation.js		- Полный рефакторинг, т.е. изменение логики, а именно:
	В типах данных типа Input меняем все обязательные поля на необязательные - убираем знак ! (typeDefs.js)
	Добавляем проверку null полей в функциях Create файла mutation.js, например:
		if (!user) {
			throw new Error(`Couldn't find user with id ${id}`);
		}
	Добавляем ещё проверку в функциях Update, Remove, например:
		if (!user) {
			throw new Error(`Couldn't find user with id ${id}`);
		}
	Несмотря на данные изменения, ПО все равно не защищено от записи null значений в ненулевые поля (login и т.д.) потому, что:
	а) неизвестна необходимость такой проверки
	б) нет защиты на уровне СУБД
	Также ПО не защищено от записи несуществующих внешних ключей в поля ForeignKey (event.room, event.users),
	причина опять в том, что неизвестна постановка задачи для backend части ПО.
	В моем решении минимальные проверки реализованы на уровне frontend.	
										- Найдена ошибка, функция changeEventRoom работала неверно:
											"return event.setRoom(id)" вместо "return event.setRoom(roomId)"
										- Добавлена функция addUserToEvent()										
7. models/index.js						- Чтобы работало UNIT-тестирование изменены строки в конце:
	var server = app.listen(3000, () => console.log('Express app listening on localhost:3000'));
	module.exports = server;





