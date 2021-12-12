FROM php:7.4-apache
RUN apt-get update && apt-get install -y \
    git
RUN rm -d -r /var/www/html
RUN git clone https://github.com/aunefyren/plex-wrapped --branch v2.1.0 /var/www/html
RUN chmod -R 0777 /var/www/html/config