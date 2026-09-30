// Servidor local para ver e editar o site: node servidor.js  →  http://localhost:8080
// Além de mostrar o site, permite que o botão "Salvar no site" (modo de edição)
// grave as alterações direto na pasta: fotos novas em fotos/ e o conteúdo em galeria.js.
const http = require("http"), fs = require("fs"), path = require("path");
const PASTA = __dirname, FOTOS = path.join(PASTA, "fotos");
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

function salvarSite(site) {
  if (!site || !Array.isArray(site.fotos) || !Array.isArray(site.categorias)) throw new Error("Conteúdo inválido");
  // Fotos adicionadas pelo navegador chegam como data:image/...;base64 — viram arquivos em fotos/
  const gravadas = new Map();
  let n = 0;
  const paraArquivo = src => {
    const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(src || "");
    if (!m) return src;
    if (gravadas.has(src)) return gravadas.get(src);
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    let nome;
    do { nome = `nova-${Date.now()}-${++n}.${ext}`; } while (fs.existsSync(path.join(FOTOS, nome)));
    fs.writeFileSync(path.join(FOTOS, nome), Buffer.from(m[2], "base64"));
    gravadas.set(src, "fotos/" + nome);
    return "fotos/" + nome;
  };
  // A senha só muda pelo /senha (que confere a senha atual); aqui mantém a que já está gravada
  try { site.senhaHash = lerSite().senhaHash; } catch (e) {}
  site.fotos.forEach(f => f.src = paraArquivo(f.src));
  site.categorias.forEach(c => c.capa = paraArquivo(c.capa));
  gravarSite(site, "Gerado pelo botão \"Salvar no site\"");
  return site;
}

// Lê o galeria.js atual (formato gerado por este servidor: window.SITE = {...};)
function lerSite() {
  const txt = fs.readFileSync(path.join(PASTA, "galeria.js"), "utf8");
  const inicio = txt.indexOf("{"), fim = txt.lastIndexOf("}");
  return JSON.parse(txt.slice(inicio, fim + 1));
}
function gravarSite(site, obs) {
  fs.writeFileSync(path.join(PASTA, "galeria.js"),
    "// Conteúdo editável do site (categorias de produtos e fotos da galeria).\n" +
    "// " + obs + " em " + new Date().toLocaleString("pt-BR") + ".\n" +
    "window.SITE = " + JSON.stringify(site, null, 2) + ";\n");
}
function lerCorpo(req, fn) {
  const partes = []; let tam = 0;
  req.on("data", c => { tam += c.length; if (tam > 100e6) req.destroy(); else partes.push(c); });
  req.on("end", () => fn(Buffer.concat(partes).toString("utf8")));
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  // Troca só a senha, sem mexer no resto do site. Exige a senha atual.
  if (url === "/senha" && req.method === "POST") {
    return lerCorpo(req, corpo => {
      try {
        const { atualHash, novaHash } = JSON.parse(corpo);
        if (!/^[0-9a-f]{64}$/.test(novaHash || "")) throw new Error("Senha nova inválida");
        const site = lerSite();
        if (atualHash !== site.senhaHash) return res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }).end("Senha atual incorreta");
        site.senhaHash = novaHash;
        gravarSite(site, "Senha alterada");
        console.log("Senha alterada");
        res.writeHead(204).end();
      } catch (e) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end(e.message);
      }
    });
  }

  if (url === "/salvar") {
    if (req.method === "GET") return res.writeHead(204).end();   // o site usa isso para saber se pode salvar
    if (req.method !== "POST") return res.writeHead(405).end();
    lerCorpo(req, corpo => {
      try {
        const site = salvarSite(JSON.parse(corpo));
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(site));
        console.log("Site salvo:", site.fotos.length, "fotos");
      } catch (e) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end(e.message);
      }
    });
    return;
  }

  const p = path.join(PASTA, url === "/" ? "/index.html" : url);
  if (!p.startsWith(PASTA)) return res.writeHead(403).end();
  fs.readFile(p, (err, dados) => {
    if (err) return res.writeHead(404).end("Não encontrado");
    res.writeHead(200, { "Content-Type": tipos[path.extname(p).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" }).end(dados);
  });
}).listen(8080, "127.0.0.1", () => console.log("Site em http://localhost:8080"));
