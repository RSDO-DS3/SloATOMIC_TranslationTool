FROM node:16
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --unsafe-perm=true --allow-root --save
COPY . .
EXPOSE 80
ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]