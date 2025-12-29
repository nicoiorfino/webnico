FROM nginx:alpine

# Copiamos la web estática al directorio default de nginx
COPY . /usr/share/nginx/html

# (Opcional) para evitar servir archivos que no son parte de la web
# Podés borrar/ignorar .exe con .dockerignore (ver abajo)