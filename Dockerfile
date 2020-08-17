FROM alpine:latest

ENV instDir /Hatjitsu

RUN apk --no-cache add nodejs git && \
    git clone https://github.com/humanmade/Hatjitsu.git ${instDir} && \
    cd ${instDir} && \
    npm install -d

EXPOSE 5000

WORKDIR ${instDir}

CMD node server
