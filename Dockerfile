FROM node

COPY app.js ./app/app.js
COPY package.json ./app/package.json
COPY index.html ./app/index.html
COPY js ./app/js/
COPY css ./app/css/
COPY map-markers ./app/map-markers/
COPY gulpfile.js ./app/gulpfile.js

WORKDIR /app
RUN npm install 
RUN npx gulp
CMD node app.js