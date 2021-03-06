'use strict';

import * as suman from 'suman';
const {Test} = suman.init(module);
import {Broker, Client} from '../../dist/main';

//@ts-ignore
Test.create(['Promise', function (b, it, inject, describe, before, $deps) {
  
  const {Promise} = b.ioc;
  const {chalk: colors} = $deps;

  console.log('suman child id:',process.env.SUMAN_CHILD_ID);

  const port = process.env.lmx_port ? parseInt(process.env.lmx_port) : (7000 + parseInt(process.env.SUMAN_CHILD_ID || '1'));
  const conf = Object.freeze({port});

  const handleEvents = function (v) {

    v.emitter.on('warning', w => {
      console.error('warning:', w);
    });

    v.emitter.on('error', w => {
      console.error('error:', w);
    });

    return v;
  };
  
  inject(() => {
    const brokerConf = Object.assign({}, conf, {noListen: process.env.lmx_broker_no_listen === 'yes'});
    return {
      broker: new Broker(brokerConf).ensure().then(handleEvents)
    }
  });

  
  before('get client', h => {
    return new Client(conf).ensure().then(function (client) {
      h.supply.client = handleEvents(client);
    });
  });
  
  describe('injected', function (b) {
    
    it.cb('locks/unlocks', t => {

      const c = t.supply.client;
      
      c.lock('a', {}, function (err, v) {
        
        if (err) {
          return t.fail(err);
        }
        
        setTimeout(function () {
          v.unlock(t.done);
        }, 1500);
        
      });
      
    });
    
    it.cb('locks/unlocks', t => {

      const c : Client = t.supply.client;
      
      c.lock('a', 1100,  (err, v) => {
        
        if (err) {
          return t.fail(err);
        }
        
        setTimeout(function () {
          c.unlock('a', v.lockUuid, t.done);
        }, 1000);
        
      });
      
    });
    
    it.cb('locks/unlocks', t => {

      const c = t.supply.client;
      
      c.lock('a', {}, function (err, v) {
        
        if (err) {
          return t.fail(err);
        }
        
        setTimeout(function () {
          c.unlock('a', v.id, t.done);
        }, 1000);
        
      });
    });
    
  });
  
}]);
