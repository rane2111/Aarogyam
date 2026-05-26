import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://butgpkuqqxarjtndxjrn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGdwa3VxcXhhcmp0bmR4anJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0NDMsImV4cCI6MjA5MDk0MzQ0M30.mdK-4QLgaoyH5ChKVFiLYWoNU5IVbq8ieBuTV31VYaI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);