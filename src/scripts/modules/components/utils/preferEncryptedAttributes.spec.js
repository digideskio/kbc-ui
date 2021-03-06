var assert = require('assert');
var preferEncryptedAttributes = require('./preferEncryptedAttributes');

describe('preferEncryptedAttributes', function() {
  describe('#preferEncryptedAttributes()', function() {
    it('should return scalar when scalar', function() {
      assert.equal('test', preferEncryptedAttributes('test'));
    });

    it('should return only encrypted key', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key1': 'val1',
        '#key1': 'val2'
      }), {
        '#key1': 'val2'
      });
    });

    it('should return only encrypted key in array', function() {
      assert.deepEqual(preferEncryptedAttributes([
        {
          'key1': 'val1',
          '#key1': 'val2'
        }
      ]), [
        {
          '#key1': 'val2'
        }
      ]);
    });

    it('should return only encrypted key in nested object', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key2': {
          'key1': 'val1',
          '#key1': 'val2'
        }
      }), {
        'key2': {
          '#key1': 'val2'
        }
      });
    });

    it('should return only encrypted key in array nested', function() {
      assert.deepEqual(preferEncryptedAttributes([
        {
          'key2': {
            'key1': 'val1',
            '#key1': 'val2'
          }
        }
      ]), [
        {
          'key2': {
            '#key1': 'val2'
          }
        }
      ]);
    });

    it('should replace by plain value if encrypted key is empty string', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key1': 'val2',
        '#key1': ''
      }), {
        '#key1': 'val2'
      });
    });

    it('should replace by plain value if encrypted key is null', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key1': 'val2',
        '#key1': null
      }), {
        '#key1': 'val2'
      });
    });

    // multiple
    it('should return only encrypted keys', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key1': 'val1',
        '#key1': 'val2',
        'key2': 'val3',
        '#key2': 'val4'
      }), {
        '#key1': 'val2',
        '#key2': 'val4'
      });
    });

    // multiple nested
    it('should return only encrypted key in nested object', function() {
      assert.deepEqual(preferEncryptedAttributes({
        'key2': {
          'key1': 'val1',
          '#key1': 'val2'
        },
        'key3': 'val3',
        '#key3': 'val4',
        'key4': {
          'key5': 'val5',
          '#key5': 'val6'
        },
        'key5': {
          'key5': 'val5',
          '#key5': 'val6'
        },
        '#key5': 'val7'
      }), {
        'key2': {
          '#key1': 'val2'
        },
        '#key3': 'val4',
        'key4': {
          '#key5': 'val6'
        },
        '#key5': 'val7'
      });
    });
  });
});
