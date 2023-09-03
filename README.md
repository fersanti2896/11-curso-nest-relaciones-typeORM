# TypeORM - Postgres

En este repositorio se ven las relaciones, autenticación, autorización y websocket, además de: 

- Uso de `TypeORM`.
- Uso de `Postgres`.
- Creación de `CRUD`.
- Uso de `Constrains`.
- Validaciones.
- Búsquedas.
- Creación de Paginaciones.
- Uso de `DTOs`.
- Uso de `Entities`.
- Uso de `Decoradores` de `TypeORM` para entidades.
- Uso de Métodos `BeforeInsert`, `BeforeUpdate`.

## Teslo API
1. Instalar las dependencias de `node_modules` con el comando:
```
npm install
```
2. Renombrar el archivo `.env.template` a `.env`.
3. Definir las variables de entorno.
4. Levantar la base de datos con `Docker`:
```
docker-compose up -d
``` 
5. Levantar el proyecto en entorno de desarrollo: 
```
npm run start:dev
``` 