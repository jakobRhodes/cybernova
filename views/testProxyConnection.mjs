'use strict';
require('dotenv').config({ silent: true });
import {HttpsProxyAgent} from 'https-proxy-agent';

var url = require('url');
var HttpsProxyAgent = require('https-proxy-agent');
var request = require('request');

var testEndpoint = 'https://ip.quotaguard.com';
var proxy = process.env.QUOTAGUARDSHIELD_URL;
var agent = new HttpsProxyAgent(proxy);
var options = {
  uri: url.parse(testEndpoint),
  agent
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('body: ', body);
  } else {
    console.log('error: ', error);
  }
}

request(options, callback);