import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/addresses.json');

async function loadAddresses() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function saveAddresses(addresses) {
  await fs.writeFile(DATA_FILE, JSON.stringify(addresses, null, 2), 'utf-8');
}

export async function findByAccountId(accountId) {
  const addresses = await loadAddresses();
  // Ensure we compare strings or numbers correctly (JWT id might be string)
  return addresses.filter((addr) => String(addr.accountId) === String(accountId));
}

export async function create(addressData) {
  const addresses = await loadAddresses();
  const newAddress = {
    id: Date.now(), // simple ID generation
    ...addressData
  };
  addresses.push(newAddress);
  await saveAddresses(addresses);
  return newAddress;
}

export async function update(id, updates) {
  const addresses = await loadAddresses();
  const index = addresses.findIndex((addr) => String(addr.id) === String(id));
  
  if (index < 0) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  addresses[index] = {
    ...addresses[index],
    ...updates,
    id: addresses[index].id // prevent ID overwrite
  };

  await saveAddresses(addresses);
  return addresses[index];
}

export async function remove(id) {
  const addresses = await loadAddresses();
  const filtered = addresses.filter((addr) => String(addr.id) !== String(id));
  
  if (addresses.length === filtered.length) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
  }
  
  await saveAddresses(filtered);
  return true;
}
