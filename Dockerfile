# docker build -t local-postgres .
#docker run -d \ --name postgres-test \ -p 5432:5432 \ local-postgres


FROM postgres:latest

ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=postgres_test

EXPOSE 5432
