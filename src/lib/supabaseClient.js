import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrzhvlckczlrhbihysye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyemh2bGNrY3pscmhiaWh5c3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDc4OTQsImV4cCI6MjA2NDQ4Mzg5NH0.bpH82NiTQMR94MwdEoFphPl2CTm0FC1lHd21NBsBxoY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);