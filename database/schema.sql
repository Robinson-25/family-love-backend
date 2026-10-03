-- ============================================================
-- Family Love — Estructura de la base de datos (UTF-8)
-- Solo tablas, SIN datos de usuarios (no subas contraseñas a GitHub).
-- Seguro de ejecutar varias veces: usa CREATE TABLE IF NOT EXISTS.
-- ============================================================
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('customer','admin','colaborator') NOT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_username_key` (`username`),
  UNIQUE KEY `user_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `image` (
  `id` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `hotelCenterId` varchar(191) DEFAULT NULL,
  `roomId` varchar(191) DEFAULT NULL,
  `public_id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `image_url_key` (`url`),
  UNIQUE KEY `image_userId_key` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `voluntario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(191) NOT NULL,
  `edad` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `telefono` varchar(191) NOT NULL,
  `motivacion` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Esta tabla la usaba el código pero NO estaba en family_love.sql
CREATE TABLE IF NOT EXISTS `newsletterEmail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletterEmail_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `proyecto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `anio` int(11) NOT NULL,
  `resumen` text NOT NULL,
  `descripcion` text NOT NULL,
  `imagen` varchar(500) NOT NULL,
  `fotos` longtext DEFAULT NULL,
  `video` varchar(500) DEFAULT NULL,
  `etiqueta` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL DEFAULT 'from-[#1a3a6b] to-[#2251a3]',
  `emoji` varchar(10) NOT NULL DEFAULT '💙',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `noticia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `resumen` text NOT NULL,
  `contenido` text NOT NULL,
  `imagen` varchar(500) NOT NULL,
  `video` varchar(500) DEFAULT NULL,
  `fecha` varchar(50) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Equipo directivo (Quiénes Somos). El backend crea esta tabla solo la primera
-- vez y carga las personas iniciales; aquí queda como referencia.
CREATE TABLE IF NOT EXISTS `equipo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(120) NOT NULL,
  `cargo` VARCHAR(160) NOT NULL,
  `imagen` VARCHAR(500) NOT NULL,
  `bio` TEXT NOT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
