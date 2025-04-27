# Utiliser une image officielle PHP
FROM php:8.2-cli

# Créer le dossier de travail
WORKDIR /var/www/html

# Copier tous les fichiers de ton projet dans le conteneur
COPY . /var/www/html

# Exposer le port 8080 (standard pour Railway ou autres)
EXPOSE 8080

# Commande pour démarrer le serveur PHP
CMD ["php", "-S", "0.0.0.0:8080"]
