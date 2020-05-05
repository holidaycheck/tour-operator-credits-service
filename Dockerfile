FROM node:13.2
COPY . /app/
WORKDIR /app/
RUN npm ci --only=production
EXPOSE 3000
CMD [ "node", "index.js" ]
