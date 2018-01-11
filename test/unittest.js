let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index.js');
let should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
  var id;
  it('1 Create user {login:testobar}', (done) => {
	chai.request(server)
		.post('/graphql')
		.set('content-type', 'application/json')
		.send({ 'query' : 
        'mutation my{ \
          createUser(input: { \
            login: \"testobar\"\
          } ){ \
            id\
          } \
        }'
      })
		.end((err,res) => {
			let data = res.body.data;
			id = data.createUser.id;
			should.exist(id);
			done();
	   })
  });
  it('2 Query user from previous test', (done) => {
	chai.request(server)
		.post('/graphql')
		.set('content-type', 'application/json')
		.send({ 'query' : 
        '{ \
          user(id:' + id + ') { \
            login\
          } \
        }'
      })
		.end((err,res) => {
			let data = res.body.data;
			let login = data.user.login;
			login.should.be.to.equal('testobar');
			done();
	   })
  });
  it('3 Rename test user', (done) => {
	chai.request(server)
		.post('/graphql')
		.set('content-type', 'application/json')
		.send({ 'query' : 
        'mutation my{ \
          updateUser(id: ' + id + ', input: { \
            login: \"testobarRenamed\"\
          } ){ \
			login\
          } \
        }'
      })
		.end((err,res) => {
			let data = res.body.data;
			let login = data.updateUser.login;
			login.should.be.to.equal('testobarRenamed');
			done();
	   })
  });
  it('4 Delete test user', (done) => {
	chai.request(server)
		.post('/graphql')
		.set('content-type', 'application/json')
		.send({ 'query' : 
        'mutation my{ \
          removeUser(id: ' + id + '){ \
			id\
          } \
        }'
      })
		.end((err,res) => {
			let data = res.body.data;
			let removeUser = data.removeUser;
			should.not.exist(removeUser);
			done();
	   })
  });
});