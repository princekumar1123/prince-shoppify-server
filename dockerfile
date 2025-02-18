# this is for normal node app run without nodemon

# FROM node:latest

# WORKDIR /

# COPY package*.json ./

# RUN npm install nodemon

# RUN npm install

# COPY . .

# EXPOSE 9000

# CMD ["nodemon","server.js"]











# this is for run the app with nodemon

FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD ["npx", "nodemon", "server.js"]
