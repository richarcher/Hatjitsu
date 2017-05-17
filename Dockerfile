FROM alpine:latest

ENV instDir /Hatjitsu

RUN apk --no-cache add nodejs git && \
    git clone https://github.com/richarcher/Hatjitsu.git ${instDir} && \
    sed	-i 's/\/\/s3.amazonaws.com\/hatchetapp\/socket-0.9.11.io.min.js/\/\/cdnjs.cloudflare.com\/ajax\/libs\/socket.io\/0.9.11\/socket.io.min.js/g' ${instDir}/app/index.ejs && \
    cd ${instDir} && \
    npm install -d

EXPOSE 5000

WORKDIR ${instDir}

CMD node server
