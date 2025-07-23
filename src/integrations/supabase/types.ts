export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weight_measurements: {
        Row: {
          id: string;
          user_id: string | null;
          peso_kg: number;
          gordura_corporal_percent: number | null;
          massa_muscular_kg: number | null;
          agua_corporal_percent: number | null;
          osso_kg: number | null;
          metabolismo_basal_kcal: number | null;
          idade_metabolica: number | null;
          imc: number | null;
          measurement_date: string | null;
          created_at: string | null;
          device_type: string | null;
          notes: string | null;
          gordura_visceral: number | null;
          risco_metabolico: string | null;
          circunferencia_abdominal_cm: number | null;
          circunferencia_braco_cm: number | null;
          circunferencia_perna_cm: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          peso_kg: number;
          gordura_corporal_percent?: number | null;
          massa_muscular_kg?: number | null;
          agua_corporal_percent?: number | null;
          osso_kg?: number | null;
          metabolismo_basal_kcal?: number | null;
          idade_metabolica?: number | null;
          imc?: number | null;
          measurement_date?: string | null;
          created_at?: string | null;
          device_type?: string | null;
          notes?: string | null;
          gordura_visceral?: number | null;
          risco_metabolico?: string | null;
          circunferencia_abdominal_cm?: number | null;
          circunferencia_braco_cm?: number | null;
          circunferencia_perna_cm?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          peso_kg?: number;
          gordura_corporal_percent?: number | null;
          massa_muscular_kg?: number | null;
          agua_corporal_percent?: number | null;
          osso_kg?: number | null;
          metabolismo_basal_kcal?: number | null;
          idade_metabolica?: number | null;
          imc?: number | null;
          measurement_date?: string | null;
          created_at?: string | null;
          device_type?: string | null;
          notes?: string | null;
          gordura_visceral?: number | null;
          risco_metabolico?: string | null;
          circunferencia_abdominal_cm?: number | null;
          circunferencia_braco_cm?: number | null;
          circunferencia_perna_cm?: number | null;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string | null;
          peso_meta_kg: number | null;
          gordura_corporal_meta_percent: number | null;
          imc_meta: number | null;
          data_inicio: string | null;
          data_fim: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          peso_meta_kg?: number | null;
          gordura_corporal_meta_percent?: number | null;
          imc_meta?: number | null;
          data_inicio?: string | null;
          data_fim?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          peso_meta_kg?: number | null;
          gordura_corporal_meta_percent?: number | null;
          imc_meta?: number | null;
          data_inicio?: string | null;
          data_fim?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      user_physical_data: {
        Row: {
          id: string;
          user_id: string | null;
          altura_cm: number;
          idade: number;
          sexo: string;
          nivel_atividade: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          altura_cm: number;
          idade: number;
          sexo: string;
          nivel_atividade?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          altura_cm?: number;
          idade?: number;
          sexo?: string;
          nivel_atividade?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: string;
          content: any;
          target_saboteurs: string[] | null;
          difficulty: string;
          estimated_time: number | null;
          materials_needed: string[] | null;
          follow_up_questions: string[] | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type?: string;
          content: any;
          target_saboteurs?: string[] | null;
          difficulty?: string;
          estimated_time?: number | null;
          materials_needed?: string[] | null;
          follow_up_questions?: string[] | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          content?: any;
          target_saboteurs?: string[] | null;
          difficulty?: string;
          estimated_time?: number | null;
          materials_needed?: string[] | null;
          follow_up_questions?: string[] | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          status: string;
          assigned_at: string;
          started_at: string | null;
          completed_at: string | null;
          due_date: string | null;
          progress: number;
          feedback: any | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          status?: string;
          assigned_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          due_date?: string | null;
          progress?: number;
          feedback?: any | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          status?: string;
          assigned_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          due_date?: string | null;
          progress?: number;
          feedback?: any | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never



export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Tipos para o sistema de sessões
export interface Session {
  id: string;
  title: string;
  description?: string;
  type: 'saboteur_work' | 'coaching' | 'assessment' | 'reflection';
  content: SessionContent;
  target_saboteurs?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time?: number;
  materials_needed?: string[];
  follow_up_questions?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SessionContent {
  sections: SessionSection[];
}

export interface SessionSection {
  title: string;
  activities: string[];
  description?: string;
}

export interface UserSession {
  id: string;
  session_id: string;
  user_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped';
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  progress: number;
  feedback?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  session?: Session; // Relacionamento com a sessão
}

export interface SessionFormData {
  title: string;
  description: string;
  type: 'saboteur_work' | 'coaching' | 'assessment' | 'reflection';
  content: SessionContent;
  target_saboteurs: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number;
  materials_needed: string[];
  follow_up_questions: string[];
}

export interface SendSessionData {
  sessionId: string;
  userIds: string[];
  dueDate?: string;
  customMessage?: string;
}
