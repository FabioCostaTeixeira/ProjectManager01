import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serve as Vercel Functions de api/ dentro do próprio `vite dev` — mesmo código
// que roda no deploy, sem precisar do `vercel dev` localmente.
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', (req, res) => {
        void (async () => {
          const [entity, id] = (req.url ?? '').split('?')[0].split('/').filter(Boolean)
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const raw = Buffer.concat(chunks).toString()
          const vreq = Object.assign(req, {
            query: { entity, id },
            body: raw ? JSON.parse(raw) : undefined,
          })
          const vres = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return vres
            },
            json(obj: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(obj))
              return vres
            },
          })
          // Rotas estáticas (ex. login.ts) têm precedência sobre as dinâmicas, como no Vercel.
          const modPath =
            entity === 'login' ? '/api/login.ts' : id ? '/api/[entity]/[id].ts' : '/api/[entity].ts'
          const mod = await server.ssrLoadModule(modPath)
          await mod.default(vreq, vres)
        })().catch((e) => {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro interno' }))
        })
      })
    },
  }
}

// server.host: true -> acessível na rede/Tailscale (ex: srv1:5173)
export default defineConfig(({ mode }) => {
  // Expõe .env (PGHOST/DATABASE_URL/...) pro código da API que roda no processo do Vite.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), localApi()],
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
  }
})
