FROM node:slim
WORKDIR /usr/src/app
COPY index.js . 
RUN npm install ip
ENTRYPOINT ["node", "index.js"]
CMD ["Hello World!"]
EXPOSE 8080-8090/tcp
