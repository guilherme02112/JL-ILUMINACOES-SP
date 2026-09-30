# JL Iluminações SP — site

Site da JL Iluminações SP (R. Santa Ifigênia, 269 – Lj 25, São Paulo – SP): tudo em iluminação de LED.

## Arquivos

- `index.html` — o site (página única, sem dependências).
- `galeria.js` — conteúdo editável: itens de produtos, fotos da galeria e o hash da senha de edição.
- `fotos/` — imagens do site.
- `servidor.js` — servidor local para ver e **editar** o site.

## Ver e editar

```bash
node servidor.js
```

Abra http://localhost:8080, clique no menu **⋮** → **Editar fotos e produtos** e digite a senha.
No modo de edição dá para adicionar/remover/reordenar fotos e itens de produtos, trocar nomes e legendas,
e clicar em **Salvar no site** para gravar em `galeria.js` e `fotos/`. Depois é só fazer commit e push.

A senha pode ser trocada pelo menu **⋮** → **Mudar senha**.

> Hospedado como site estático (ex.: GitHub Pages), o site funciona normalmente para os visitantes,
> mas o botão "Salvar no site" só funciona com o `servidor.js` rodando no computador.
