import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[Supabase] Initializing client...');
console.log('[Supabase] URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[Supabase] Service Key:', supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'MISSING');

// En entornos Edge, evitar lanzar error en la carga del módulo para que rutas
// que no requieren Supabase funcionen. Se crea el cliente solo si existen las
// variables, de lo contrario se exporta `undefined` y las rutas que lo usen
// fallarán explícitamente cuando intenten acceder.
export const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
  : (undefined as any);

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          legal_name: string;
          tax_id: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          country: string;
          logo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      branches: {
        Row: {
          id: string;
          company_id: string;
          code: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['branches']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['branches']['Insert']>;
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string;
          permissions: string[];
          company_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          phone: string;
          role_id: string;
          company_id: string;
          branch_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      auth_sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auth_sessions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['auth_sessions']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          detailed_description: string;
          category: string;
          unit: string;
          stock: number;
          min_stock: number;
          cost: number;
          price: number;
          company_id: string;
          branch_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          code: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          credit_limit: number;
          company_id: string;
          branch_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          sale_number: string;
          date: string;
          customer_id: string | null;
          customer_name: string;
          customer_document: string;
          customer_phone: string;
          customer_email: string;
          items: {
            productId: string;
            productCode: string;
            productName: string;
            quantity: number;
            unit: string;
            unitPrice: number;
            discount: number;
            subtotal: number;
          }[];
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          payment_method: string;
          payment_type: 'cash' | 'credit';
          status: 'completed' | 'cancelled';
          notes: string;
          company_id: string;
          branch_id: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          date: string;
          valid_until: string;
          customer_name: string;
          customer_document: string;
          customer_phone: string;
          customer_email: string;
          items: {
            productId: string;
            productCode: string;
            productName: string;
            quantity: number;
            unit: string;
            unitPrice: number;
            discount: number;
            subtotal: number;
          }[];
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          status: 'pending' | 'approved' | 'rejected' | 'expired';
          notes: string;
          company_id: string;
          branch_id: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
      };
      credit_transactions: {
        Row: {
          id: string;
          customer_id: string;
          type: 'sale' | 'payment';
          sale_id: string | null;
          amount: number;
          balance: number;
          description: string;
          date: string;
          company_id: string;
          branch_id: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['credit_transactions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['credit_transactions']['Insert']>;
      };
    };
  };
};
