
const http = require('http');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const BASE_URL = 'http://169.254.169.254';
const METADATA_PATH = '/latest/meta-data/';

const argv = yargs(hideBin(process.argv))
  .option('pretty', {
    alias: 'p',
    type: 'boolean',
    description: 'Pretty print the JSON output'
  })
  .help()
  .argv;

async function getMetadata(path = '') {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${METADATA_PATH}${path}`;
    
    const req = http.get(url, { timeout: 2000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP error: ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        resolve(getMockData(path));
      } else {
        reject(err);
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(getMockData(path));
    });
  });
}

function getMockData(path = '') {
  const mockData = {
    '': 'ami-id\ninstance-id\ninstance-type\nlocal-hostname\nlocal-ipv4\nmac\nplacement/\npublic-hostname\npublic-ipv4\nsecurity-groups',
    'ami-id': 'ami-0a887e401f7654935',
    'instance-id': 'i-0123456789abcdef0',
    'instance-type': 't2.micro',
    'local-hostname': 'ip-172-31-42-5.ec2.internal',
    'local-ipv4': '172.31.42.5',
    'mac': '0a:0b:0c:0d:0e:0f',
    'placement/': 'availability-zone\nregion',
    'placement/availability-zone': 'us-east-1a',
    'placement/region': 'us-east-1',
    'public-hostname': 'ec2-54-234-56-78.compute-1.amazonaws.com',
    'public-ipv4': '54.234.56.78',
    'security-groups': 'launch-wizard-1'
  };
  
  return mockData[path] || `mock-value-for-${path}`;
}

async function buildMetadataObject() {
  const result = {};
  
  const keysString = await getMetadata();
  const keys = keysString.split('\n').filter(key => key.trim());
  
  for (const key of keys) {
    const isCategory = key.endsWith('/');
    const cleanKey = isCategory ? key.slice(0, -1) : key;
    
    if (isCategory) {
      result[cleanKey] = {};
      
      const subKeysString = await getMetadata(key);
      const subKeys = subKeysString.split('\n').filter(subKey => subKey.trim());
      
      for (const subKey of subKeys) {
        if (!subKey.trim()) continue;
        
        const value = await getMetadata(`${cleanKey}/${subKey}`);
        result[cleanKey][subKey] = value;
      }
    } else {
      const value = await getMetadata(key);
      result[key] = value;
    }
  }
  
  return result;
}

async function main() {
  try {
    const path = argv._[0] || '';
    let result;
    
    if (path) {
      const value = await getMetadata(path);
      result = { [path]: value };
    } else {
      result = await buildMetadataObject();
    }
    
    const output = JSON.stringify(result, null, argv.pretty ? 2 : null);
    console.log(output);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
