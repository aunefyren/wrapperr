FROM php:7.4-apache
LABEL maintainer="Wrapperr https://github.com/aunefyren/wrapperr"
RUN apt-get update && apt-get install -y \
    git
RUN rm -d -r /var/www/html
RUN git clone https://github.com/aunefyren/wrapper --branch v2.2.0 /var/www/html
RUN chmod -R 0777 /var/www/html/config