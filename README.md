# Break the Login – Atacarea și securizarea autentificării (proiect #2)

Proiect eduational in cadrul cursului **Dezvoltarea Aplicațiilor Software Securizate** - *Facultatea de Matematică și Informatică
Universitatea din București*

## Quick Start

### Start app-v1
```bash
cd app-v1
docker-compose up -d
```
### Start app-v2
```bash
cd app-v2
docker-compose up -d
```
### Stop Docker
```bash
docker-compose down
```

Access Frontend: http://localhost:8080

### Reset Databse

```bash
docker-compose down -v
docker-compose up -d --build
```

## Architectura

- **Backend**: Node.js + Express (port 3000)
- **Database**: PostgreSQL (port 5432)
- **Frontend**: Vue.js 3 CDN + Bootstrap 5

## Docs

- [Proiect 2 - Break the Login – Atacarea și securizarea autentificării](docs/Proiect%202%20-%20Break%20the%20Login%20–%20Atacarea%20și%20securizarea%20autentificării.pdf)
- [Barem de verificare](docs/Barem%20de%20verificare.pdf)
- [Raport](https://docs.google.com/document/d/1HXJwSbPC3QxuU2d-GLpKPktD961gwb8Oswau-sSceWw/edit?usp=sharing)
- [Video]()
