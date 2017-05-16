FROM alpine:latest

RUN apk --no-cache add nodejs git && \
    git clone https://github.com/richarcher/Hatjitsu.git && \
    sed	-i 's/\/\/s3.amazonaws.com\/hatchetapp\/socket-0.9.11.io.min.js/\/\/cdnjs.cloudflare.com\/ajax\/libs\/socket.io\/0.9.11\/socket.io.min.js/g' /Hatjitsu/app/index.ejs && \
    cd /Hatjitsu && \
    npm install -d

EXPOSE 5000

CMD cd Hatjitsu;node server
