# 🚀 Guia de Deployment - Vercel

## Pré-requisitos
1. Conta Vercel: https://vercel.com/signup
2. Conta GitHub conectada

## Passo a Passo

### 1. Conectar Repositório no Vercel
```bash
# Acesse: https://vercel.com/new
# Clique em "Import Git Repository"
# Selecione: mariaceliaalves660-creator/studioceliahair
```

### 2. Configurar Variáveis de Ambiente
Na dashboard do Vercel, adicione em **Settings > Environment Variables**:

```
VITE_GEMINI_API_KEY = AIzaSyBu4xzYJp9Anlz22c1PAmX4ZI1XMbgENfg
VITE_SUPABASE_URL = https://uozutfpkmhkxzdrljyzf.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvenV0ZnBrbWhreHpkcmxqeXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODg3OTksImV4cCI6MjA4MDM2NDc5OX0.Iesv4GFEIiGcxQAPDoz1M7gP9WFKqb3ElUhjW3uB9nA
```

### 3. Deploy
- Clique em "Deploy"
- Vercel fará o build e deploy automaticamente
- Seu site estará em: `https://seu-projeto.vercel.app`

### 4. Deploy Automático
Toda vez que você fizer push no GitHub (branch main), Vercel fará deploy automático!

## Domínio Customizado
1. Vá para **Settings > Domains**
2. Clique em "Add Domain"
3. Aponte seu domínio para Vercel

## Monitoramento
- **Analytics**: Dashboard > Analytics
- **Performance**: Vercel Edge Network (automático)
- **Logs**: Deployments > Logs

## Custos
- **Plano Hobby**: $0 (servidor compartilhado)
- **Plano Pro**: $20/mês (recomendado para produção)

## Próximos Passos
1. ✅ Código está pronto
2. ⏳ Você: Criar conta Vercel
3. ⏳ Você: Importar repositório
4. ⏳ Você: Adicionar env vars
5. ⏳ Você: Deploy! 🎉
