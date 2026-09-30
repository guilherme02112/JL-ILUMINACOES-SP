// Configuração do Supabase (Settings → API no painel do Supabase).
// A URL e a chave "anon/publishable" são públicas por natureza: quem protege os dados são as regras (RLS) do supabase.sql.
// Deixe url vazia para usar o modo antigo (galeria.js + servidor.js).
window.SUPABASE = {
  url: "",            // ex.: "https://abcdefgh.supabase.co"
  chave: "",          // chave anon / publishable
  emailEditor: "editor@jl-iluminacoes.site",   // usuário criado em Authentication → Users (a senha é definida lá)
  bucket: "fotos",
};
