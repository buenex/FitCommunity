# GymRat

App web estático em `www/`, API Express em `api/`, worker consumidor RabbitMQ em `worker/`, PostgreSQL e RabbitMQ via Docker.

## Subir tudo (Docker)

Na raiz do projeto:

```bash
docker compose up --build
```

- Site: [http://localhost:8080](http://localhost:8080)
- API (via nginx): `http://localhost:8080/api/...`
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672) (usuário `gymrat`, senha `gymrat`)
- PostgreSQL: `localhost:5432` (usuário `gymrat`, senha `gymrat`, base `gymrat`)

Defina `JWT_SECRET` no ambiente em produção (veja `docker-compose.yml`).

## Desenvolvimento local (sem Docker)

1. PostgreSQL e RabbitMQ rodando localmente.
2. `cd api && copy .env.example .env` (crie `.env` com `DATABASE_URL`, `RABBITMQ_URL`, `JWT_SECRET`, `PORT`).
3. `npm run dev` na pasta `api`.
4. Sirva `www/` com um servidor estático apontando `/api` para o Express (ou ajuste `API_BASE` em `www/js/api.js`).

## Arquitetura da API

- `routes/` — roteadores Express
- `controllers/` — HTTP (validação leve, respostas)
- `services/` — regras de negócio e orquestração
- `repositories/` — SQL / acesso ao PostgreSQL
- `messaging/` — publicação RabbitMQ (eventos `notification.created`, `checkin.created`)

O `worker/` consome a fila `gymrat.worker` e grava auditoria em `message_deliveries`.
