SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- mannequin table
CREATE TABLE IF NOT EXISTS `mannequin` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mannequin` (`id`, `description`) VALUES (1, 'Mannequin 1'), (2, 'Mannequin 2');

-- users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sensor_types table
CREATE TABLE IF NOT EXISTS `sensor_types` (
  `sensor_type_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sensor_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`sensor_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sensor_types` (`sensor_type_id`, `sensor_type`) VALUES
(1, 'Penciuman'),(2, 'Gerak dan Gyro'),(3, 'Getar'),(4, 'GPS'),
(5, 'Pengelihatan'),(6, 'Suara'),(7, 'Suhu dan Kelembaban'),
(8, 'Berat'),(9, 'Jarak'),(10, 'Multi'),(11, 'Skin');

-- sensors table
CREATE TABLE IF NOT EXISTS `sensors` (
  `sensor_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sensor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensor_type_id` bigint UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`sensor_id`),
  KEY `sensors_sensor_type_id_foreign` (`sensor_type_id`),
  CONSTRAINT `sensors_sensor_type_id_foreign` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_types` (`sensor_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sensors` (`sensor_id`, `sensor_name`, `sensor_type_id`) VALUES
(101, 'MQ2', 1),(102, 'MQ2_2', 1),(103, 'MQ2_3', 1),
(201, 'ADXL_tangan_kanan', 2),(202, 'ADXL_tangan_kiri', 2),
(203, 'ADXL_kaki_kanan', 2),(204, 'ADXL_kaki_kiri', 2),
(301, 'MPU6050_vibrate', 3),
(601, 'KY_kanan', 6),(602, 'KY_kiri', 6),
(701, 'DHT11', 7),(702, 'Thermal Camera', 7),
(801, 'Loadcell_1', 8),(802, 'Loadcell_2', 8),(803, 'Loadcell_3', 8),
(804, 'Loadcell_4', 8),(805, 'Loadcell_5', 8),(806, 'Loadcell_6', 8),
(901, 'Lidar', 9),
(1001, 'BME280', 10),(1002, 'MPU6050', 10),(1010, 'Witsensor', 10),
(1101, 'rp_tangan_kiri', 11),(1102, 'rp_tangan_kanan', 11),
(1103, 'flex_tangan_kiri', 11),(1104, 'flex_tangan_kanan', 11),
(1105, 'rp_kaki_kiri', 11),(1106, 'rp_kaki_kanan', 11),
(1107, 'flex_kaki_kiri', 11),(1108, 'flex_kaki_kanan', 11);

-- status table
CREATE TABLE IF NOT EXISTS `status` (
  `server` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `info` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `status` (`server`, `status`, `info`) VALUES ('vps', 'ok', 'https://api-sm.stas-rg.com/');

-- mq2
CREATE TABLE IF NOT EXISTS `mq2` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,3) NOT NULL DEFAULT 0,
  `co` decimal(10,3) NOT NULL DEFAULT 0,
  `co2` decimal(10,3) NOT NULL DEFAULT 0,
  `nh3` decimal(10,3) NOT NULL DEFAULT 0,
  `no2` decimal(10,3) NOT NULL DEFAULT 0,
  `smoke` decimal(10,3) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- adxl tables
CREATE TABLE IF NOT EXISTS `adxl_tangan_kanan` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `x_axis` decimal(10,2) NOT NULL DEFAULT 0,
  `y_axis` decimal(10,2) NOT NULL DEFAULT 0,
  `z_axis` decimal(10,2) NOT NULL DEFAULT 0,
  `x_kalman` decimal(10,2) NOT NULL DEFAULT 0,
  `y_kalman` decimal(10,2) NOT NULL DEFAULT 0,
  `z_kalman` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `adxl_tangan_kiri` LIKE `adxl_tangan_kanan`;
CREATE TABLE IF NOT EXISTS `adxl_kaki_kanan` LIKE `adxl_tangan_kanan`;
CREATE TABLE IF NOT EXISTS `adxl_kaki_kiri` LIKE `adxl_tangan_kanan`;

-- ky tables
CREATE TABLE IF NOT EXISTS `ky_kanan` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ky_kiri` LIKE `ky_kanan`;

-- dht11
CREATE TABLE IF NOT EXISTS `dht11` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `temperature` decimal(10,3) NOT NULL DEFAULT 0,
  `humidity` decimal(10,3) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- thermal_camera
CREATE TABLE IF NOT EXISTS `thermal_camera` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `low_temp` decimal(10,2) NOT NULL DEFAULT 0,
  `center_temp` decimal(10,2) NOT NULL DEFAULT 0,
  `high_temp` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- loadcell tables
CREATE TABLE IF NOT EXISTS `loadcell_1` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `kalmanvalue` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  `lateral_value` decimal(10,2) NOT NULL DEFAULT 0,
  `extension_value` decimal(10,2) NOT NULL DEFAULT 0,
  `flexion_value` decimal(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `loadcell_2` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `kalmanvalue` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `loadcell_3` LIKE `loadcell_2`;
CREATE TABLE IF NOT EXISTS `loadcell_4` LIKE `loadcell_2`;
CREATE TABLE IF NOT EXISTS `loadcell_5` LIKE `loadcell_2`;
CREATE TABLE IF NOT EXISTS `loadcell_6` LIKE `loadcell_2`;

-- lidar
CREATE TABLE IF NOT EXISTS `lidar` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `kalmanvalue` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bme280
CREATE TABLE IF NOT EXISTS `bme280` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `temperature` decimal(10,2) NOT NULL DEFAULT 0,
  `pressure` decimal(10,2) NOT NULL DEFAULT 0,
  `approximate_altitude` decimal(10,2) NOT NULL DEFAULT 0,
  `humidity` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- mpu6050
CREATE TABLE IF NOT EXISTS `mpu6050` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `temperature` decimal(10,2) NOT NULL DEFAULT 0,
  `x_acceleration` decimal(10,2) NOT NULL DEFAULT 0,
  `y_acceleration` decimal(10,2) NOT NULL DEFAULT 0,
  `z_acceleration` decimal(10,2) NOT NULL DEFAULT 0,
  `x_rotation` decimal(10,2) NOT NULL DEFAULT 0,
  `y_rotation` decimal(10,2) NOT NULL DEFAULT 0,
  `z_rotation` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- mpu6050_vibrate
CREATE TABLE IF NOT EXISTS `mpu6050_vibrate` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- witsensor
CREATE TABLE IF NOT EXISTS `witsensor` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `x_acceleration` decimal(10,3) NOT NULL DEFAULT 0,
  `y_acceleration` decimal(10,3) NOT NULL DEFAULT 0,
  `z_acceleration` decimal(10,3) NOT NULL DEFAULT 0,
  `a_acceleration` decimal(10,3) NOT NULL DEFAULT 0,
  `x_velocity` decimal(10,3) NOT NULL DEFAULT 0,
  `y_velocity` decimal(10,3) NOT NULL DEFAULT 0,
  `z_velocity` decimal(10,3) NOT NULL DEFAULT 0,
  `w_velocity` decimal(10,3) NOT NULL DEFAULT 0,
  `x_angle` decimal(10,3) NOT NULL DEFAULT 0,
  `y_angle` decimal(10,3) NOT NULL DEFAULT 0,
  `z_angle` decimal(10,3) NOT NULL DEFAULT 0,
  `x_magnetic` decimal(10,4) NOT NULL DEFAULT 0,
  `y_magnetic` decimal(10,4) NOT NULL DEFAULT 0,
  `z_magnetic` decimal(10,4) NOT NULL DEFAULT 0,
  `h_magnetic` decimal(10,4) NOT NULL DEFAULT 0,
  `pressure` bigint NOT NULL DEFAULT 0,
  `height` decimal(10,2) NOT NULL DEFAULT 0,
  `q0_quaternion` decimal(10,5) NOT NULL DEFAULT 0,
  `q1_quaternion` decimal(10,5) NOT NULL DEFAULT 0,
  `q2_quaternion` decimal(10,5) NOT NULL DEFAULT 0,
  `q3_quaternion` decimal(10,5) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- skin tables
CREATE TABLE IF NOT EXISTS `rp_tangan_kiri` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,2) NOT NULL DEFAULT 0,
  `pressure_value` decimal(10,2) NOT NULL DEFAULT 0,
  `force_value` decimal(10,2) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rp_tangan_kanan` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `flex_tangan_kiri` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `flex_tangan_kanan` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `rp_kaki_kiri` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `rp_kaki_kanan` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `flex_kaki_kiri` LIKE `rp_tangan_kiri`;
CREATE TABLE IF NOT EXISTS `flex_kaki_kanan` LIKE `rp_tangan_kiri`;

-- inmp tables
CREATE TABLE IF NOT EXISTS `inmp_kanan` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `value` decimal(10,3) NOT NULL DEFAULT 0,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `mannequin_id` bigint UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inmp_kiri` LIKE `inmp_kanan`;

-- skin FSR (64 sensor)
CREATE TABLE IF NOT EXISTS `skin` (
  `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL,
  `fsr1` decimal(10,2) DEFAULT 0, `fsr2` decimal(10,2) DEFAULT 0, `fsr3` decimal(10,2) DEFAULT 0, `fsr4` decimal(10,2) DEFAULT 0,
  `fsr5` decimal(10,2) DEFAULT 0, `fsr6` decimal(10,2) DEFAULT 0, `fsr7` decimal(10,2) DEFAULT 0, `fsr8` decimal(10,2) DEFAULT 0,
  `fsr9` decimal(10,2) DEFAULT 0, `fsr10` decimal(10,2) DEFAULT 0, `fsr11` decimal(10,2) DEFAULT 0, `fsr12` decimal(10,2) DEFAULT 0,
  `fsr13` decimal(10,2) DEFAULT 0, `fsr14` decimal(10,2) DEFAULT 0, `fsr15` decimal(10,2) DEFAULT 0, `fsr16` decimal(10,2) DEFAULT 0,
  `fsr17` decimal(10,2) DEFAULT 0, `fsr18` decimal(10,2) DEFAULT 0, `fsr19` decimal(10,2) DEFAULT 0, `fsr20` decimal(10,2) DEFAULT 0,
  `fsr21` decimal(10,2) DEFAULT 0, `fsr22` decimal(10,2) DEFAULT 0, `fsr23` decimal(10,2) DEFAULT 0, `fsr24` decimal(10,2) DEFAULT 0,
  `fsr25` decimal(10,2) DEFAULT 0, `fsr26` decimal(10,2) DEFAULT 0, `fsr27` decimal(10,2) DEFAULT 0, `fsr28` decimal(10,2) DEFAULT 0,
  `fsr29` decimal(10,2) DEFAULT 0, `fsr30` decimal(10,2) DEFAULT 0, `fsr31` decimal(10,2) DEFAULT 0, `fsr32` decimal(10,2) DEFAULT 0,
  `fsr33` decimal(10,2) DEFAULT 0, `fsr34` decimal(10,2) DEFAULT 0, `fsr35` decimal(10,2) DEFAULT 0, `fsr36` decimal(10,2) DEFAULT 0,
  `fsr37` decimal(10,2) DEFAULT 0, `fsr38` decimal(10,2) DEFAULT 0, `fsr39` decimal(10,2) DEFAULT 0, `fsr40` decimal(10,2) DEFAULT 0,
  `fsr41` decimal(10,2) DEFAULT 0, `fsr42` decimal(10,2) DEFAULT 0, `fsr43` decimal(10,2) DEFAULT 0, `fsr44` decimal(10,2) DEFAULT 0,
  `fsr45` decimal(10,2) DEFAULT 0, `fsr46` decimal(10,2) DEFAULT 0, `fsr47` decimal(10,2) DEFAULT 0, `fsr48` decimal(10,2) DEFAULT 0,
  `fsr49` decimal(10,2) DEFAULT 0, `fsr50` decimal(10,2) DEFAULT 0, `fsr51` decimal(10,2) DEFAULT 0, `fsr52` decimal(10,2) DEFAULT 0,
  `fsr53` decimal(10,2) DEFAULT 0, `fsr54` decimal(10,2) DEFAULT 0, `fsr55` decimal(10,2) DEFAULT 0, `fsr56` decimal(10,2) DEFAULT 0,
  `fsr57` decimal(10,2) DEFAULT 0, `fsr58` decimal(10,2) DEFAULT 0, `fsr59` decimal(10,2) DEFAULT 0, `fsr60` decimal(10,2) DEFAULT 0,
  `fsr61` decimal(10,2) DEFAULT 0, `fsr62` decimal(10,2) DEFAULT 0, `fsr63` decimal(10,2) DEFAULT 0, `fsr64` decimal(10,2) DEFAULT 0,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
