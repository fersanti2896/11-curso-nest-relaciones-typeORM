# Relaciones con TypeORM

En este repositorio se ven las relaciones, autenticación, autorización y websocket, además de: 

- Relaciones de: 
    - De uno a muchos. 
    - Muchos a uno.
- Uso de `Query Runner`.
- Uso de `Query Builder`.
- Uso de Transacciones.
- `Commits` y `Rollbacks`.
- Renombrar tablas.
- Creación de semilla `SEED`.
- Aplanación de resultados.

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