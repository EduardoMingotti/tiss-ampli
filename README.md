# Cardiosync Repasses - V1

PWA estática para GitHub Pages conectada diretamente ao Supabase com `supabase-js`.

## Estrutura
- `index.html`: interface com Painel, Importações, Configurações e Fechamento.
- `assets/app.js`: autenticação, leitura do XML, consultas e exportação CSV.
- `config.js`: URL e chave publicável do Supabase.
- `sql/schema.sql`: banco, índices, view financeira, dados iniciais e RLS.
- `data/tuss-22.json`: catálogo TUSS 22 para busca local.
- `.github/workflows/deploy.yml`: publicação automática no GitHub Pages.

## Configuração rápida
1. Execute `sql/schema.sql` no SQL Editor do Supabase.
2. Em Authentication > Users, crie o usuário que acessará o sistema.
3. No botão Connect do projeto, copie Project URL e Publishable key.
4. Cole os dois valores em `config.js`. Nunca use `sb_secret_` ou `service_role`.
5. Publique todos os arquivos no repositório.
6. Em Settings > Pages, selecione GitHub Actions.

## Observação funcional
Esta entrega é uma V1 navegável e conectável. A importação lê cada `guiaHonorarios` e registra o primeiro `procedimentoRealizado` daquela guia. Antes de produção, valide com XMLs reais se uma guia pode conter vários procedimentos ou múltiplos profissionais dentro do mesmo item; nesse caso, amplie o parser mantendo a mesma estrutura de banco.
