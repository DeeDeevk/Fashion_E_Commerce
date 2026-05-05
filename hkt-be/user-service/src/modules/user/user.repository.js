import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/users.json');

async function loadUsers() {
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

async function saveUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function findById(id) {
  const users = await loadUsers();
  const userData = users.find((user) => String(user.id) === String(id));
  return userData ? new User(userData) : null;
}

export async function findByUsername(username) {
  const users = await loadUsers();
  const userData = users.find((user) => user.username === username);
  return userData ? new User(userData) : null;
}

export async function findByEmail(email) {
  const users = await loadUsers();
  const userData = users.find((user) => user.email === email);
  return userData ? new User(userData) : null;
}

export async function create(userData) {
  const users = await loadUsers();
  const newUser = {
    id: `user-${Date.now()}`,
    ...userData
  };
  users.push(newUser);
  await saveUsers(users);
  return new User(newUser);
}

export async function updateById(id, updates) {
  const users = await loadUsers();
  const index = users.findIndex((user) => String(user.id) === String(id));
  if (index < 0) {
    return null;
  }

  users[index] = {
    ...users[index],
    ...updates,
    id: users[index].id // prevent ID overwrite
  };

  await saveUsers(users);
  return new User(users[index]);
}
