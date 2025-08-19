# Nest Core
REST API with NestJS framework and postgreSQL database

## [Nest-Core](https://github.com/HasanNugroho/nest-core.git)

## Getting Started

### Requirements

- Node.js (v18+)
- PostgreSQL
- (Optional) Docker & Docker Compose

### Install & Run

Download this project:

```shell script
git clone https://github.com/HasanNugroho/nest-core.git
```

### Manual Installation

Install dependencies

```shell script
npm install
```

Copy environment variables

```shell script
cp .env.example .env
```

```shell script
# Application Configuration
NODE_ENV=development
APP_NAME=MyApp
APP_DESC=Broilerplate for Nestjs
VERSION=1.0.0
PORT=3000

# PostgreSQL Database Configuration
DB_USER=dbUser
DB_PASS=dbPass
DB_NAME=test
DB_PORT=5432
DB_HOST=localhost

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=redispass

# JWT Security Configuration
JWT_SECRET_KEY=Rah4$14
JWT_EXPIRED='2h'
JWT_REFRESH_TOKEN_EXPIRED='2d'
```

Before running this project, make sure to configure your environment variables by copying .env.example and updating it with your own values.

#### Run the App

```shell script
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# running on default port 3000
```

### Run with Docker (Recomended)

```shell script
docker-compose up -d
```

### API Documentation

This project uses **Swagger** for API documentation. you can access the documentation at: **[http://localhost:3000/api](http://localhost:3000/api)**

## Structures

```
nest-core
├── docker-compose.yml
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app.module.ts
│   ├── common
│   │   ├── constant.ts
│   │   ├── decorator
│   │   │   ├── public.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── user.decorator.ts
│   │   ├── dto
│   │   │   ├── page-meta.dto.ts
│   │   │   ├── page-option.dto.ts
│   │   │   └── response.dto.ts
│   │   ├── enum
│   │   │   └── core.enum.ts
│   │   └── filter
│   │       └── http-exception.filter.ts
│   ├── config
│   │   ├── config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   ├── data
│   │   ├── default-roles.json
│   │   └── role-permissions.json
│   ├── main.ts
│   ├── migrations
│   │   └── 1755622487388-init.ts
│   ├── modules
│   │   └── module
│   │       ├── dto
│   │       │   └── module.dto.ts
│   │       ├── entity
│   │       │   └── module.entity.ts
│   │       ├── repository
│   │       │   └── module.repository.ts
│   │       ├── module.controller.ts
│   │       ├── module.module.ts
│   │       └── module.service.ts
│   ├── seed
│   │   └── role.seed.ts
│   └── service
│       └── logger
│           ├── logger.module.ts
│           └── logger.service.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

```

## Architecture

This project follows a modular NestJS architecture with clear separation of concerns:
  - Service `src/service/`: Contains reusable business logic utilities and helpers, like the logger module for centralized logging.
  - Module `src/module/`: Each domain (e.g., account, role) has its own module containing entities, controllers, services, repositories, DTOs, and guards. This ensures modularity and encapsulation of features.
  - Entity `src/module/*/entity/`: Defines database models with TypeORM decorators. Represents tables and their relationships.
  - Repository `src/module/*/repository/`: Handles database access and queries using TypeORM repositories.
  - Controller `src/module/*/*.controller.ts`: Handles incoming HTTP requests, routes, and responses for a specific module.
  - DTO `src/module/*/dto/`: Defines Data Transfer Objects for type-safe input/output validation.
  - Guard `src/module/*/guard/`: Implements route-level access control, like authentication and role-based permissions.
  - Common `src/common/`: Contains shared utilities, decorators, enums, DTOs, and exception filters used across modules.
  - Config `src/config/`: Configuration files for environment, database, and Redis settings.
  - Data `src/data/`: JSON seed data like default roles and permissions for initializing the database.
  - Migrations `src/migrations/`: Database migration scripts for schema changes managed by TypeORM.
  - Seed `src/seed/`: Scripts to populate the database with initial data (e.g., roles, permissions).
  - Main `src/main.ts`: Application bootstrap file to start the NestJS server or application context.

This structure helps maintain modularity, scalability, and easier code management, making it straightforward to add new features, manage domains separately, and enforce separation of concerns.

## Credits

- **[NestJS](https://nestjs.com/)** - A framework server-side applications.
- **[TypeORM](https://typeorm.io/)** - An ORM for TypeScript and JavaScript.
- **[Swagger](https://swagger.io/)** - A tool API documentation.
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database system.

## Copyright

Copyright (c) 2025 Burhan Nurhasan Nugroho.