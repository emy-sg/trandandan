FROM node:latest

WORKDIR /backend

COPY entrypoint.sh /
COPY package.json ./
COPY prisma/schema.prisma /

RUN apt-get -y update

RUN npm install -g npm@latest
RUN npm install -g npm-check-updates
RUN npm install -g @nestjs/cli
RUN npm update
# RUN npm i

# RUN npm install
# RUN npx prisma migrate dev --name init --preview-feature

# debugging
# RUN apt-get -y install curl vim 

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]