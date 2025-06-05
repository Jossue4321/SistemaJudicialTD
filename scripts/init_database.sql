-- Crear tablas para el sistema judicial accesible

-- Tabla de usuarios (extendiendo la tabla auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  disability_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas legales frecuentes
CREATE TABLE IF NOT EXISTS public.legal_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  frequency INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas realizadas por usuarios
CREATE TABLE IF NOT EXISTS public.user_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de abogados
CREATE TABLE IF NOT EXISTS public.lawyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  available BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  consultation_type TEXT NOT NULL,
  needs_lsp BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'system', 'chat')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear políticas de seguridad RLS (Row Level Security)

-- Políticas para usuarios
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para preguntas legales
ALTER TABLE public.legal_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier usuario puede ver preguntas legales"
  ON public.legal_questions FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para preguntas de usuarios
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias preguntas"
  ON public.user_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias preguntas"
  ON public.user_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para abogados
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier usuario puede ver abogados"
  ON public.lawyers FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para citas
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias citas"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias citas"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias citas"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para notificaciones
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
