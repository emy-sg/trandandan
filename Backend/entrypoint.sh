#!/bin/bash

npm install .
npx prisma migrate dev --name init --preview-feature
npm run build
npm run start:$MODE