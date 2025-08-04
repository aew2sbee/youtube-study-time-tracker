import { JSONFilePreset } from 'lowdb/node';
import { StudyTimeUser } from '@/types/youtube';

interface DatabaseSchema {
  users: Map<string, StudyTimeUser>;
  lastSaved: string;
}

class StudyTimeDatabase {
  private db: unknown = null;
  private dbPath = './data/study-time.json';

  async initialize() {
    if (this.db) return this.db;

    const defaultData: DatabaseSchema = {
      users: new Map(),
      lastSaved: new Date().toISOString(),
    };

    this.db = await JSONFilePreset(this.dbPath, defaultData);
    return this.db;
  }

  async saveUsers(users: Map<string, StudyTimeUser>) {
    await this.initialize();
    
    // Convert Map to plain object for JSON serialization
    const usersObject = Object.fromEntries(users);
    
    this.db.data.users = usersObject;
    this.db.data.lastSaved = new Date().toISOString();
    
    await this.db.write();
  }

  async loadUsers(): Promise<Map<string, StudyTimeUser>> {
    await this.initialize();
    
    // Convert plain object back to Map
    const usersObject = this.db.data.users || {};
    return new Map(Object.entries(usersObject));
  }

  async getLastSaved(): Promise<Date | null> {
    await this.initialize();
    
    const lastSaved = this.db.data.lastSaved;
    return lastSaved ? new Date(lastSaved) : null;
  }
}

export const studyTimeDb = new StudyTimeDatabase();