require('dotenv').load({ silent: true });

// environment variables
var APIURL = process.env.APIURL;
var USERNAME = process.env.USERNAME;
var PASSWORD =  process.env.PASSWORD;
if (!APIURL) {
  throw('Please set APIURL environment variable with the url of the IBM Graph instance');
}

if (!USERNAME || !PASSWORD) {
  throw('Please set USERNAME & PASSSWORD environment variables '
  + 'with the credentials of the IBM Graph instance');
}

// munge the URLs into pieces required by the library and by Nock
var url = require('url');
var parsed = url.parse(APIURL);
var PATH = parsed.pathname;
var STUB  = parsed.pathname.substr(0, (parsed.pathname.length - 2));
delete parsed.pathname;
var SERVER = url.format(parsed);

// sample response
var SAMPLE_RESPONSE = {
  requestId:'543f93b2-68e2-419b-9b5d-0b7e3289fd4f',
  status: {
    message:'',
    code:200,
    attributes: {}
  },
  result: {
    data: [{
      id:1,
      label: 'vertex',
      type: 'vertex',
      properties: {
        test:[{
          id: '1cruoc-1crx40-9zzlx',
          value: 'test'
        }],
        delete: [{
          id: '1crv2k-1crx40-a8qv9',
          value: 'delete'
        }]
      }
    }],
    meta: {}
  }
};

// load the GDS library and the http mocking library
var GDS    = require('../lib/client.js');
var nock   = require('nock');
var should = require('should');
var _      = require('underscore');
var uuid   = require('uuid');

describe('Vertices', function () {

  it('create vertex', function (done) {
    var mocks = nock(SERVER)
                .post(PATH + '/vertices')
                .reply(201, SAMPLE_RESPONSE);

    var g = new GDS({ url: APIURL, username: USERNAME, password: PASSWORD });

    g.vertices().create({}, function (err, data) {
      should(err).equal(null);
      data.should.be.an.Object;
      data.result.should.be.an.Object;
      data.result.data.should.be.an.Array;
      data.result.data[0].should.be.an.Object;
      mocks.done();
      done();
    });

  });

  it('get vertex', function (done) {
    var mocks = nock(SERVER)
                .post(PATH + '/vertices')
                .reply(201, SAMPLE_RESPONSE)
                .get(PATH + '/vertices/1')
                .reply(200, SAMPLE_RESPONSE);

    var g = new GDS({ url: APIURL, username: USERNAME, password: PASSWORD });

    g.vertices().create({ test: 'test' }, function (err, data) {
      g.vertices().get(data.result.data[0].id, function (err, data) {
        should(err).equal(null);
        data.should.be.an.Object;
        mocks.done();
        done();
      });
    });

  });

  it('delete vertex', function (done) {
    var mocks = nock(SERVER)
                .post(PATH + '/vertices')
                .reply(201, SAMPLE_RESPONSE)
                .get(PATH + '/vertices/1')
                .reply(200, SAMPLE_RESPONSE)
                .delete(PATH + '/vertices/1')
                .reply(200, [true]);

    var g = new GDS({ url: APIURL, username: USERNAME, password: PASSWORD });

    g.vertices().create({ test: 'test' }, function (err, data) {
      var id = data.result.data[0].id;
      g.vertices().get(id, function (err, data) {
        g.vertices().delete(id, function (err, data) {
          should(err).equal(null);
          data.should.be.an.Object;
          mocks.done();
          done();
        });
      });
    });

  });

  it('delete property vertex', function (done) {
    var mocks = nock(SERVER)
                .post(PATH + '/vertices')
                .reply(201, SAMPLE_RESPONSE)
                .get(PATH + '/vertices/1')
                .reply(200, SAMPLE_RESPONSE)
                .delete(PATH + '/vertices/1')
                .reply(200, [true]);

    var g = new GDS({ url: APIURL, username: USERNAME, password: PASSWORD });

    g.vertices().create({ test: 'test', delete: 'delete' }, function (err, data) {
      var id = data.result.data[0].id;
      g.vertices().get(id, function (err, data) {
        g.vertices().deleteProperty(id, {delete: 'delete'}, function (err, data) {
          should(err).equal(null);
          data.should.be.an.Object;
          mocks.done();
          done();
        });
      });
    });

  });
});
