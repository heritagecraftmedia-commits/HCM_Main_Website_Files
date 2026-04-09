import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function makeEntity(tableName) {
  return {
    async list(orderBy = '-created_date', limit = 50) {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    async filter(filters = {}, orderBy = '-created_date', limit = 50) {
      const ascending = !orderBy.startsWith('-');
      const column = orderBy.replace('-', '');
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(column, { ascending })
        .limit(limit);
      if (error) throw error;
      return data;
    }
  };
}

export const db = {
  entities: {
    Lead: makeEntity('leads'),
    BusinessInsight: makeEntity('business_insights'),
    GeneratedContent: makeEntity('generated_content'),
    DailyNote: makeEntity('daily_notes'),
    ActionLog: makeEntity('action_log'),
    Connector: makeEntity('connectors'),
    Workflow: makeEntity('workflows'),
  }
};
