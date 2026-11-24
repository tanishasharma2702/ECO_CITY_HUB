import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('example.com')
  );
};

// Real Supabase Client if configured
export const realSupabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =============================================================================
// Local Offline Mock Supabase Client (Zero-Configuration Fallback)
// Ensures the app works 100% out-of-the-box before user inputs custom keys
// =============================================================================

class MockSupabaseClient {
  constructor() {
    this.authListeners = new Set();
    this.initDefaultData();
  }

  initDefaultData() {
    // Clean any legacy fake user profiles from local mock storage
    try {
      const existingUsers = JSON.parse(localStorage.getItem('ecocity_mock_users') || '[]');
      const sanitized = existingUsers.filter(u => u.id !== 'usr-demo-001' && u.email !== 'citizen@ecocityhub.org');
      localStorage.setItem('ecocity_mock_users', JSON.stringify(sanitized));

      const existingSession = JSON.parse(localStorage.getItem('ecocity_mock_session') || 'null');
      if (existingSession?.user?.id === 'usr-demo-001') {
        localStorage.removeItem('ecocity_mock_session');
      }
    } catch {
      localStorage.setItem('ecocity_mock_users', JSON.stringify([]));
    }
  }

  auth = {
    signUp: async ({ email, password, options }) => {
      const users = JSON.parse(localStorage.getItem('ecocity_mock_users') || '[]');
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return { data: { user: null, session: null }, error: { message: 'User already exists with this email address' } };
      }

      const newUser = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        email,
        password,
        user_metadata: options?.data || {}
      };
      users.push(newUser);
      localStorage.setItem('ecocity_mock_users', JSON.stringify(users));

      const session = { access_token: 'mock-token-' + Date.now(), user: newUser };
      localStorage.setItem('ecocity_mock_session', JSON.stringify(session));

      // Trigger listeners
      this.notifyAuthChange('SIGNED_IN', session);
      return { data: { user: newUser, session }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      const users = JSON.parse(localStorage.getItem('ecocity_mock_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials. Please check your email and password.' } };
      }

      const session = { access_token: 'mock-token-' + Date.now(), user };
      localStorage.setItem('ecocity_mock_session', JSON.stringify(session));
      this.notifyAuthChange('SIGNED_IN', session);
      return { data: { user, session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('ecocity_mock_session');
      this.notifyAuthChange('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const session = JSON.parse(localStorage.getItem('ecocity_mock_session') || 'null');
      return { data: { session }, error: null };
    },

    getUser: async () => {
      const session = JSON.parse(localStorage.getItem('ecocity_mock_session') || 'null');
      return { data: { user: session?.user || null }, error: null };
    },

    resetPasswordForEmail: async (email) => {
      return { data: {}, error: null };
    },

    updateUser: async (attributes) => {
      const session = JSON.parse(localStorage.getItem('ecocity_mock_session') || 'null');
      if (!session?.user) return { error: { message: 'No authenticated user' } };

      const users = JSON.parse(localStorage.getItem('ecocity_mock_users') || '[]');
      const idx = users.findIndex(u => u.id === session.user.id);
      if (idx !== -1) {
        users[idx].user_metadata = { ...users[idx].user_metadata, ...attributes.data };
        session.user = users[idx];
        localStorage.setItem('ecocity_mock_users', JSON.stringify(users));
        localStorage.setItem('ecocity_mock_session', JSON.stringify(session));
        this.notifyAuthChange('USER_UPDATED', session);
      }
      return { data: { user: session.user }, error: null };
    },

    onAuthStateChange: (callback) => {
      const listener = (event, session) => callback(event, session);
      this.authListeners.add(listener);
      return {
        data: {
          subscription: {
            unsubscribe: () => this.authListeners.delete(listener)
          }
        }
      };
    }
  };

  notifyAuthChange(event, session) {
    this.authListeners.forEach(cb => cb(event, session));
  }

  from(tableName) {
    return new MockQueryBuilder(tableName);
  }

  storage = {
    from: (bucketName) => ({
      upload: async (path, file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            resolve({ data: { path, publicUrl: dataUrl }, error: null });
          };
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl: (path) => {
        return { data: { publicUrl: path } };
      }
    })
  };
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.storageKey = `ecocity_table_${table}`;
    this.filters = [];
    this.orderConfig = null;
    this.limitCount = null;
  }

  getItems() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  saveItems(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  select(columns = '*') {
    return this;
  }

  eq(column, value) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  async then(resolve, reject) {
    try {
      let items = this.getItems();
      for (const filter of this.filters) {
        items = items.filter(filter);
      }
      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        items.sort((a, b) => {
          const valA = a[column];
          const valB = b[column];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }
      if (this.limitCount !== null) {
        items = items.slice(0, this.limitCount);
      }
      resolve({ data: items, error: null });
    } catch (err) {
      resolve({ data: null, error: err });
    }
  }

  async insert(data) {
    const items = this.getItems();
    const rows = Array.isArray(data) ? data : [data];
    const inserted = rows.map(r => ({
      id: r.id || 'id-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...r
    }));
    items.unshift(...inserted);
    this.saveItems(items);
    return { data: inserted, error: null };
  }

  async update(updates) {
    const items = this.getItems();
    let updatedCount = 0;
    const newItems = items.map(item => {
      const match = this.filters.every(filter => filter(item));
      if (match) {
        updatedCount++;
        return { ...item, ...updates, updated_at: new Date().toISOString() };
      }
      return item;
    });
    this.saveItems(newItems);
    return { data: newItems, error: null };
  }

  async delete() {
    const items = this.getItems();
    const remaining = items.filter(item => !this.filters.every(filter => filter(item)));
    this.saveItems(remaining);
    return { data: remaining, error: null };
  }
}

export const mockSupabase = new MockSupabaseClient();

// Default export uses real Supabase if configured, otherwise mockSupabase
export const supabase = realSupabase || mockSupabase;
