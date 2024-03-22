import fs from 'fs';
import csv from 'csv-parser';

const isOffboard = (process.argv.pop().toLowerCase() === 'offboard');
const title = `Orkes Bulk User O${isOffboard ? 'ff' : 'n'}boarding`;
const bar = '='.repeat(title.length);
console.log([bar, title, bar].join('\n'));

const ORKES_URI = process.env.ORKES_URI;
const ORKES_TOKEN = process.env.ORKES_TOKEN;

if (!ORKES_URI || !ORKES_TOKEN) {
  console.error('Please set these environment variables:')
  if (!ORKES_URI) {
    console.error('ORKES_URI = cluster uri e.g. https://my-company.orkesconductor.io/api');
  }
  if (!ORKES_TOKEN) {
    console.error('ORKES_TOKEN = Press "Copy Token" near bottom of left navigation in Orkes UI');
  }
  process.exit(1);
}

const file = 'users.csv';
console.log(`Reading CSV input from: ${file}`);

const saveUser = (action, user) => {
  const config = {
    method: action,
    headers: {
      'X-Authorization': ORKES_TOKEN,
      'Content-Type': 'application/json',
    },
  };
  let verb = 'deleted';
  if (action === 'PUT') {
    config.body = JSON.stringify(user);
    verb = 'saved';
  }
  fetch(`${ORKES_URI}/users/${user.id}`, config)
    .then((r) => r.ok ? r.json() : Promise.reject(r))
    .then(() => console.log(`User ${verb}: ${user.name} (${user.id})`))
    .catch((error) => {
      console.error(`Error for ${user.name} (${user.id}):`)
      if (typeof error.json === 'function') {
        error.json()
          .then(jsonError => console.error(jsonError))
          .catch(error => console.error(error.statusText));
      } else {
        console.error(error);
      }
    });
};

const processSplit = (arr) => arr.split(',')
  .map((item) => item.trim())
  .filter((item) => item.length > 0);

const validRoles = [ 'ADMIN', 'USER', 'METADATA_MANAGER', 'WORKFLOW_MANAGER', 'USER_READ_ONLY' ];
const data = [];

const validateId = (id) => {
  const trimId = id.trim();
  if (id.indexOf('@') === -1) {
    console.error(`ID ${trimId} is not a valid email`);
    process.exit(1);
  }
  return trimId;
};

const validateRole = (role) => {
  const upperRole = role.toUpperCase();
  if (validRoles.indexOf(upperRole) === -1) {
    console.error(`Role ${upperRole} is not a valid role`);
    process.exit(1);
  }
  return upperRole;
};

const main = () => {
  const processedData = data.map((user) => ({
    ...user,
    id: validateId(user.id),
    roles: processSplit(user.roles).map((role) => validateRole(role)),
    groups: processSplit(user.groups),
  }));

  console.log(`CSV file successfully processed: ${processedData.length} rows read\n`);

  const action = isOffboard ? 'DELETE' : 'PUT';
  processedData.forEach((entry) => saveUser(action, entry));
};

fs.createReadStream(file)
  .pipe(csv())
  .on('data', (row) => data.push(row))
  .on('end', main)
  .on('error', (err) => {
    console.error('Error occurred while reading the CSV file:', err);
  });
