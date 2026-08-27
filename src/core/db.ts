import type { User } from './store';

export interface MuralPhoto {
  id: string;
  userId: string;
  userName: string;
  photoBase64: string;
  timestamp: number;
}

const DB_NAME = 'TechWeekDB';
const STORE_USERS = 'users';
const STORE_MURAL = 'mural_photos';
const DB_VERSION = 2; // Mudamos para 2 para o navegador criar a nova tabela!

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
      // Criando a gaveta separada para o Mural
      if (!db.objectStoreNames.contains(STORE_MURAL)) {
        db.createObjectStore(STORE_MURAL, { keyPath: 'id' });
      }
    };
  });
};

// --- FUNÇÕES DE USUÁRIO ---
export const saveUserDB = async (user: User): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readwrite');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.put(user);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllUsersDB = async (): Promise<User[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readonly');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteUserDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readwrite');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- FUNÇÕES DO MURAL ---
export const saveMuralPhotoDB = async (photo: MuralPhoto): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_MURAL, 'readwrite');
    const store = transaction.objectStore(STORE_MURAL);
    const request = store.put(photo);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllMuralPhotosDB = async (): Promise<MuralPhoto[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_MURAL, 'readonly');
    const store = transaction.objectStore(STORE_MURAL);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// CORREÇÃO: Função de deletar foto do mural padronizada com o resto do código
export const deleteMuralPhotoDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_MURAL, 'readwrite');
    const store = transaction.objectStore(STORE_MURAL);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};