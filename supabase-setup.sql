-- Tarjetas con Corazón - Database Setup
-- Execute this SQL in your Supabase SQL Editor

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  sender_name text NOT NULL,
  recipient_name text NOT NULL,
  message text NOT NULL,
  audio_url text,
  theme text DEFAULT 'valentine' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  delivery_date timestamptz
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Policy for reading cards by code (public access needed for QR)
CREATE POLICY "Anyone can view cards by code"
  ON cards FOR SELECT
  USING (true);

-- Policy for creating cards (public service)
CREATE POLICY "Anyone can create cards"
  ON cards FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-audios', 'card-audios', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading audio files
CREATE POLICY "Anyone can upload audio files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'card-audios');

-- Policy for reading audio files
CREATE POLICY "Anyone can view audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-audios');
