# Image de base légère avec Node 20
FROM node:20-alpine

# Dossier de travail dans le container
WORKDIR /var/www/frontend

# Copie des fichiers de configuration pour installer les dépendances
COPY package*.json ./
RUN npm install

# Copie du reste du code source
COPY . .

# On expose le port par défaut de Vite
EXPOSE 5173

# Commande pour lancer le serveur de dev avec accès externe (--host)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
