# Usa Node 22
FROM node:22-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código al contenedor
COPY . .

# Exponer el puerto que usa Express
EXPOSE 3002

# Comando de inicio (usa nodemon si estás en desarrollo)
CMD ["npm", "run", "dev"]
