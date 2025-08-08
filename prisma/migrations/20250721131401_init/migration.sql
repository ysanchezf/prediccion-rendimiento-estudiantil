-- CreateTable
CREATE TABLE `Evaluacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `puntaje` INTEGER NOT NULL,
    `maxPuntaje` INTEGER NOT NULL,
    `porcentaje` DOUBLE NOT NULL,
    `resultado` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
