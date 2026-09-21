-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 19, 2024 at 01:39 PM
-- Server version: 8.0.35-0ubuntu0.22.04.1
-- PHP Version: 8.1.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbsensor`
--
CREATE DATABASE IF NOT EXISTS `dbsensor` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `dbsensor`;

-- --------------------------------------------------------

--
-- Table structure for table `adxl_kaki_kanan`
--

CREATE TABLE IF NOT EXISTS `adxl_kaki_kanan` (
  `event_id` bigint UNSIGNED NOT NULL,
  `x_axis` decimal(10,2) NOT NULL,
  `y_axis` decimal(10,2) NOT NULL,
  `z_axis` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adxl_kaki_kanan`
--

INSERT INTO `adxl_kaki_kanan` (`event_id`, `x_axis`, `y_axis`, `z_axis`, `inputed_at`, `sensor_id`) VALUES
(1, '40.00', '50.00', '10.00', '2023-11-08 23:40:25', 203),
(2, '10.00', '20.00', '40.00', '2023-11-08 23:40:43', 203);

-- --------------------------------------------------------

--
-- Table structure for table `adxl_kaki_kiri`
--

CREATE TABLE IF NOT EXISTS `adxl_kaki_kiri` (
  `event_id` bigint UNSIGNED NOT NULL,
  `x_axis` decimal(10,2) NOT NULL,
  `y_axis` decimal(10,2) NOT NULL,
  `z_axis` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adxl_kaki_kiri`
--

INSERT INTO `adxl_kaki_kiri` (`event_id`, `x_axis`, `y_axis`, `z_axis`, `inputed_at`, `sensor_id`) VALUES
(1, '90.00', '70.00', '50.00', '2023-11-08 23:40:52', 204),
(2, '20.00', '10.00', '70.00', '2023-11-08 23:41:01', 204);

-- --------------------------------------------------------

--
-- Table structure for table `adxl_tangan_kanan`
--

CREATE TABLE IF NOT EXISTS `adxl_tangan_kanan` (
  `event_id` bigint UNSIGNED NOT NULL,
  `x_axis` decimal(10,2) NOT NULL,
  `y_axis` decimal(10,2) NOT NULL,
  `z_axis` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adxl_tangan_kanan`
--

INSERT INTO `adxl_tangan_kanan` (`event_id`, `x_axis`, `y_axis`, `z_axis`, `inputed_at`, `sensor_id`) VALUES
(1, '10.00', '40.00', '30.00', '2023-11-08 23:39:05', 201),
(2, '30.00', '20.00', '10.00', '2023-11-08 23:39:16', 201),
(3, '8.79', '-2.04', '-4.24', '2023-11-09 17:28:29', 201),
(4, '8.83', '-1.96', '-4.24', '2023-11-09 17:28:29', 201),
(5, '8.83', '-1.96', '-4.28', '2023-11-09 17:28:29', 201),
(6, '8.79', '-2.00', '-4.24', '2023-11-09 17:28:30', 201),
(7, '8.87', '-2.04', '-4.24', '2023-11-09 17:28:30', 201),
(8, '8.87', '-1.96', '-4.24', '2023-11-09 17:28:30', 201),
(9, '8.87', '-2.00', '-4.24', '2023-11-09 17:28:30', 201),
(10, '8.87', '-2.00', '-4.28', '2023-11-09 17:28:30', 201),
(11, '8.79', '-2.00', '-4.20', '2023-11-09 17:28:30', 201),
(12, '8.83', '-1.96', '-4.24', '2023-11-09 17:28:31', 201),
(13, '8.87', '-2.00', '-4.24', '2023-11-09 17:28:31', 201),
(14, '8.87', '-1.96', '-4.20', '2023-11-09 17:28:31', 201),
(15, '8.83', '-1.96', '-4.31', '2023-11-09 17:28:36', 201),
(16, '8.79', '-2.04', '-4.24', '2023-11-09 17:28:36', 201),
(17, '8.79', '-2.00', '-4.16', '2023-11-09 17:28:37', 201),
(18, '8.87', '-2.00', '-4.24', '2023-11-09 17:28:37', 201),
(19, '8.87', '-1.96', '-4.24', '2023-11-09 17:28:38', 201),
(20, '9.22', '-1.37', '-4.55', '2023-11-09 17:28:40', 201),
(21, '8.83', '-2.08', '-4.16', '2023-11-09 17:28:41', 201),
(22, '6.67', '-2.94', '-5.88', '2023-11-09 18:46:41', 201),
(23, '6.71', '-2.86', '-5.88', '2023-11-09 18:46:41', 201),
(24, '6.79', '-2.90', '-5.84', '2023-11-09 18:46:41', 201),
(25, '6.63', '-2.94', '-5.92', '2023-11-09 18:46:42', 201),
(26, '6.67', '-2.94', '-5.96', '2023-11-09 18:46:42', 201),
(27, '6.71', '-2.90', '-5.92', '2023-11-09 18:46:42', 201),
(28, '6.67', '-2.90', '-5.84', '2023-11-09 18:46:42', 201),
(29, '6.67', '-2.94', '-5.92', '2023-11-09 18:46:42', 201),
(30, '6.71', '-2.90', '-5.88', '2023-11-09 18:46:47', 201),
(31, '6.75', '-2.90', '-5.88', '2023-11-09 18:46:47', 201),
(32, '6.75', '-2.90', '-5.84', '2023-11-09 18:46:48', 201),
(33, '6.67', '-2.86', '-5.88', '2023-11-09 18:46:48', 201),
(34, '6.75', '-2.94', '-5.88', '2023-11-09 18:46:48', 201),
(35, '6.79', '-2.98', '-5.88', '2023-11-09 18:46:48', 201),
(36, '6.71', '-2.90', '-5.88', '2023-11-09 18:46:48', 201),
(37, '6.75', '-2.94', '-5.92', '2023-11-09 18:46:48', 201),
(38, '1.00', '2.00', '3.00', '2023-11-14 02:57:48', 201),
(39, '1.00', '2.00', '3.00', '2023-11-14 02:58:12', 201),
(40, '1.00', '2.00', '3.00', '2023-11-14 02:58:42', 201),
(41, '1.00', '2.00', '3.00', '2023-11-14 03:10:38', 201),
(42, '1.00', '2.00', '3.00', '2023-11-14 03:10:42', 201),
(43, '3.00', '2.00', '3.00', '2023-11-16 12:25:24', 201),
(44, '1.00', '2.00', '3.00', '2023-11-18 11:00:15', 201),
(45, '1.56', '-2.26', '8.74', '2023-11-18 11:12:51', 201),
(46, '0.00', '0.00', '0.00', '2023-11-18 15:46:06', 201),
(47, '1.00', '2.00', '3.00', '2023-11-18 15:51:19', 201);

-- --------------------------------------------------------

--
-- Table structure for table `adxl_tangan_kiri`
--

CREATE TABLE IF NOT EXISTS `adxl_tangan_kiri` (
  `event_id` bigint UNSIGNED NOT NULL,
  `x_axis` decimal(10,2) NOT NULL,
  `y_axis` decimal(10,2) NOT NULL,
  `z_axis` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adxl_tangan_kiri`
--

INSERT INTO `adxl_tangan_kiri` (`event_id`, `x_axis`, `y_axis`, `z_axis`, `inputed_at`, `sensor_id`) VALUES
(1, '60.00', '10.00', '30.00', '2023-11-08 23:39:50', 202),
(2, '10.00', '30.00', '40.00', '2023-11-08 23:39:57', 202);

-- --------------------------------------------------------

--
-- Table structure for table `bme280`
--

CREATE TABLE IF NOT EXISTS `bme280` (
  `event_id` bigint UNSIGNED NOT NULL,
  `temperature` decimal(10,2) NOT NULL,
  `pressure` decimal(10,2) NOT NULL,
  `approximate_altitude` decimal(10,2) NOT NULL,
  `humidity` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bme280`
--

INSERT INTO `bme280` (`event_id`, `temperature`, `pressure`, `approximate_altitude`, `humidity`, `inputed_at`, `sensor_id`) VALUES
(1, '31.52', '1.56', '-2.26', '8.74', '2023-11-08 22:46:06', 1001),
(2, '34.22', '2.56', '-4.26', '32.74', '2023-11-08 22:46:23', 1001);

-- --------------------------------------------------------

--
-- Table structure for table `dht11`
--

CREATE TABLE IF NOT EXISTS `dht11` (
  `event_id` bigint UNSIGNED NOT NULL,
  `temperature` decimal(10,3) NOT NULL,
  `humidity` decimal(10,3) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inmp_kanan`
--

CREATE TABLE IF NOT EXISTS `inmp_kanan` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,3) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inmp_kiri`
--

CREATE TABLE IF NOT EXISTS `inmp_kiri` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,3) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ky_kanan`
--

CREATE TABLE IF NOT EXISTS `ky_kanan` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ky_kanan`
--

INSERT INTO `ky_kanan` (`event_id`, `value`, `inputed_at`, `sensor_id`) VALUES
(1548, '89.00', '2023-12-08 06:50:41', 601),
(1549, '84.00', '2023-12-08 06:50:46', 601),
(1612, '55.00', '2024-01-05 04:55:48', 601);

-- --------------------------------------------------------

--
-- Table structure for table `ky_kiri`
--

CREATE TABLE IF NOT EXISTS `ky_kiri` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ky_kiri`
--

INSERT INTO `ky_kiri` (`event_id`, `value`, `inputed_at`, `sensor_id`) VALUES
(778, '89.00', '2023-12-08 06:58:48', 602),
(779, '90.00', '2023-12-08 06:58:52', 602),
(841, '120.00', '2023-12-08 07:35:36', 602);

-- --------------------------------------------------------

--
-- Table structure for table `lengan_atas_kanan`
--

CREATE TABLE IF NOT EXISTS `lengan_atas_kanan` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lengan_atas_kiri`
--

CREATE TABLE IF NOT EXISTS `lengan_atas_kiri` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lengan_bawah_kiri`
--

CREATE TABLE IF NOT EXISTS`lengan_bawah_kiri` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lengan_bawah_kanan`
--

CREATE TABLE IF NOT EXISTS`lengan_bawah_kanan` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `siku_kanan`
--

CREATE TABLE IF NOT EXISTS`siku_kanan` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `siku_kiri`
--

CREATE TABLE IF NOT EXISTS `siku_kiri` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lidar`
--

CREATE TABLE IF NOT EXISTS `lidar` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lidar`
--

INSERT INTO `lidar` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '334.00', '0.00', '2023-11-08 20:59:21', 901),
(2, '334.00', '0.00', '2023-11-08 20:59:21', 901),
(906, '7.00', '7.00', '2023-12-08 06:34:06', 901);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_1`
--

CREATE TABLE IF NOT EXISTS `loadcell_1` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loadcell_1`
--

INSERT INTO `loadcell_1` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(166, '-0.16', '0.00', '2023-11-09 06:47:55', 801),
(167, '-0.07', '0.00', '2023-11-09 06:47:56', 801),
(264, '3.18', '3.21', '2023-12-04 17:16:34', 801);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_2`
--

CREATE TABLE IF NOT EXISTS `loadcell_2` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loadcell_2`
--

INSERT INTO `loadcell_2` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '0.06', '0.00', '2023-11-09 07:00:50', 802),
(2, '-0.13', '0.00', '2023-11-09 07:00:50', 802),
(121, '326.39', '326.38', '2023-12-04 17:49:35', 802);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_3`
--

CREATE TABLE IF NOT EXISTS `loadcell_3` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loadcell_3`
--

INSERT INTO `loadcell_3` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '10.00', '0.00', '2023-11-09 08:32:45', 803),
(2, '40.00', '0.00', '2023-11-09 08:32:55', 803),
(89, '0.00', '0.00', '2023-12-04 18:13:24', 803);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_4`
--

CREATE TABLE IF NOT EXISTS `loadcell_4` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loadcell_4`
--

INSERT INTO `loadcell_4` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '40.00', '0.00', '2023-11-09 08:33:01', 804),
(2, '30.00', '0.00', '2023-11-09 08:33:05', 804),
(238, '0.01', '0.01', '2023-12-08 01:13:38', 804);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_5`
--

CREATE TABLE IF NOT EXISTS `loadcell_5` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loadcell_5`
--

INSERT INTO `loadcell_5` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '40.00', '0.00', '2023-11-09 08:33:51', 805),
(2, '30.00', '0.00', '2023-11-09 08:33:55', 805),
(91, '11.23', '11.23', '2023-12-08 02:43:28', 805);

-- --------------------------------------------------------

--
-- Table structure for table `loadcell_6`
--

CREATE TABLE IF NOT EXISTS `loadcell_6` (
  `event_id` bigint NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `kalmanvalue` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loadcell_6`
--

INSERT INTO `loadcell_6` (`event_id`, `value`, `kalmanvalue`, `inputed_at`, `sensor_id`) VALUES
(1, '99.00', '0.00', '2023-11-15 13:23:45', 806),
(2, '10.00', '0.00', '2023-11-15 13:23:45', 806),
(3, '1.00', '0.00', '2023-11-16 18:37:37', 806);

-- --------------------------------------------------------

--
-- Table structure for table `mpu6050`
--

CREATE TABLE IF NOT EXISTS `mpu6050` (
  `event_id` bigint UNSIGNED NOT NULL,
  `temperature` decimal(10,2) NOT NULL,
  `x_acceleration` decimal(10,2) NOT NULL,
  `y_acceleration` decimal(10,2) NOT NULL,
  `z_acceleration` decimal(10,2) NOT NULL,
  `x_rotation` decimal(10,2) NOT NULL,
  `y_rotation` decimal(10,2) NOT NULL,
  `z_rotation` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mpu6050`
--

INSERT INTO `mpu6050` (`event_id`, `temperature`, `x_acceleration`, `y_acceleration`, `z_acceleration`, `x_rotation`, `y_rotation`, `z_rotation`, `inputed_at`, `sensor_id`) VALUES
(3125, '0.00', '-2.13', '-4.35', '9.52', '-0.03', '-0.06', '-0.01', '2023-12-08 07:44:14', 1002),
(3126, '0.00', '-1.58', '-4.17', '9.12', '-0.07', '-0.03', '-0.04', '2023-12-08 07:45:03', 1002),
(3161, '0.00', '-2.65', '-4.25', '8.71', '-0.02', '-0.03', '0.02', '2023-12-10 00:28:49', 1002);

-- --------------------------------------------------------

--
-- Table structure for table `mpu6050_vibrate`
--

CREATE TABLE IF NOT EXISTS `mpu6050_vibrate` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mpu6050_vibrate`
--

INSERT INTO `mpu6050_vibrate` (`event_id`, `value`, `inputed_at`, `sensor_id`) VALUES
(1, '10.00', '2023-11-09 14:39:20', 301),
(2, '90.00', '2023-11-09 14:39:31', 301);

-- --------------------------------------------------------

--
-- Table structure for table `mq2`
--

CREATE TABLE IF NOT EXISTS `mq2` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,3) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mq2`
--

INSERT INTO `mq2` (`event_id`, `value`, `inputed_at`, `sensor_id`) VALUES
(1, '100.000', '2023-11-08 23:27:19', 101),
(2, '50.000', '2023-11-08 23:34:50', 101),
(772, '32.560', '2023-11-28 07:42:30', 101);

-- --------------------------------------------------------

--
-- Table structure for table `sensors`
--

CREATE TABLE IF NOT EXISTS `sensors` (
  `sensor_id` bigint UNSIGNED NOT NULL,
  `sensor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensor_type_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sensors`
--

INSERT INTO `sensors` (`sensor_id`, `sensor_name`, `sensor_type_id`) VALUES
(101, 'MQ2', 1),
(201, 'ADXL_tangan_kanan', 2),
(202, 'ADXL_tangan_kiri', 2),
(203, 'ADXL_kaki_kanan', 2),
(204, 'ADXL_kaki_kiri', 2),
(301, 'MPU6050_vibrate', 3),
(601, 'KY_kanan', 6),
(602, 'KY_kiri', 6),
(701, 'DHT11', 7),
(702, 'Thermal Camera', 7),
(801, 'Loadcell_1', 8),
(802, 'Loadcell_2', 8),
(803, 'Loadcell_3', 8),
(804, 'Loadcell_4', 8),
(805, 'Loadcell_5', 8),
(806, 'Loadcell_6', 8),
(901, 'Lidar', 9),
(1001, 'BME280', 10),
(1002, 'MPU6050', 10),
(1010, 'Witsensor', 10),
(1101, 'lengan_atas_kanan', 11),
(1102, 'siku_kanan', 11),
(1103, 'lengan_bawah_kanan', 11),
(1104, 'lengan_atas_kiri', 11),
(1105, 'siku_kiri', 11),
(1106, 'lengan_bawah_kiri', 11);

-- --------------------------------------------------------

--
-- Table structure for table `sensor_types`
--

CREATE TABLE IF NOT EXISTS `sensor_types` (
  `sensor_type_id` bigint UNSIGNED NOT NULL,
  `sensor_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sensor_types`
--

INSERT INTO `sensor_types` (`sensor_type_id`, `sensor_type`) VALUES
(1, 'Penciuman'),
(2, 'Gerak dan Gyro'),
(3, 'Getar'),
(4, 'GPS'),
(5, 'Pengelihatan'),
(6, 'Suara'),
(7, 'Suhu dan Kelembaban'),
(8, 'Berat'),
(9, 'Jarak'),
(10, 'Multi'),
(11, 'Skin');

-- --------------------------------------------------------

--
-- Table structure for table `siku_kanan`
--

CREATE TABLE IF NOT EXISTS `siku_kanan` (
  `event_id` bigint NOT NULL,
  `value` bigint NOT NULL,
  `kalmanvalue` bigint NOT NULL,
  `inputed_at` timestamp NOT NULL,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE IF NOT EXISTS `status` (
  `server` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `info` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`server`, `status`, `info`) VALUES
('vps', 'ok', 'https://api-sm.stas-rg.com/');

-- --------------------------------------------------------

--
-- Table structure for table `thermal_camera`
--

CREATE TABLE IF NOT EXISTS `thermal_camera` (
  `event_id` bigint UNSIGNED NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `thermal_camera`
--

INSERT INTO `thermal_camera` (`event_id`, `value`, `inputed_at`, `sensor_id`) VALUES
(1, '10.00', '2023-11-15 08:52:38', 702),
(2, '30.00', '2023-11-15 08:52:38', 702),
(5073, '24.75', '2023-11-28 08:17:05', 702);

-- --------------------------------------------------------

--
-- Table structure for table `witsensor`
--

CREATE TABLE IF NOT EXISTS `witsensor` (
  `event_id` bigint UNSIGNED NOT NULL,
  `x_acceleration` decimal(10,3) NOT NULL,
  `y_acceleration` decimal(10,3) NOT NULL,
  `z_acceleration` decimal(10,3) NOT NULL,
  `a_acceleration` decimal(10,3) NOT NULL,
  `x_velocity` decimal(10,3) NOT NULL,
  `y_velocity` decimal(10,3) NOT NULL,
  `z_velocity` decimal(10,3) NOT NULL,
  `w_velocity` decimal(10,3) NOT NULL,
  `x_angle` decimal(10,3) NOT NULL,
  `y_angle` decimal(10,3) NOT NULL,
  `z_angle` decimal(10,3) NOT NULL,
  `x_magnetic` decimal(10,4) NOT NULL,
  `y_magnetic` decimal(10,4) NOT NULL,
  `z_magnetic` decimal(10,4) NOT NULL,
  `h_magnetic` decimal(10,4) NOT NULL,
  `pressure` bigint NOT NULL,
  `height` decimal(10,2) NOT NULL,
  `q0_quaternion` decimal(10,5) NOT NULL,
  `q1_quaternion` decimal(10,5) NOT NULL,
  `q2_quaternion` decimal(10,5) NOT NULL,
  `q3_quaternion` decimal(10,5) NOT NULL,
  `inputed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensor_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `witsensor`
--

INSERT INTO `witsensor` (`event_id`, `x_acceleration`, `y_acceleration`, `z_acceleration`, `a_acceleration`, `x_velocity`, `y_velocity`, `z_velocity`, `w_velocity`, `x_angle`, `y_angle`, `z_angle`, `x_magnetic`, `y_magnetic`, `z_magnetic`, `h_magnetic`, `pressure`, `height`, `q0_quaternion`, `q1_quaternion`, `q2_quaternion`, `q3_quaternion`, `inputed_at`, `sensor_id`) VALUES
(1, '1.000', '11.000', '1.000', '1.000', '1.000', '1.000', '1.000', '1.000', '1.000', '1.000', '1.000', '1.0000', '1.0000', '1.0000', '1.0000', 1, '1.00', '1.00000', '1.00000', '1.00000', '1.00000', '2023-11-27 07:17:29', 1010),
(2, '10.000', '10.000', '10.000', '10.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.0000', '0.0000', '0.0000', '0.0000', 0, '0.00', '0.00000', '0.00000', '0.00000', '0.00000', '2023-11-27 14:18:10', 1010),
(3, '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '0.0000', '0.0000', '0.0000', '0.0000', 0, '0.00', '0.00000', '0.00000', '0.00000', '0.00000', '2023-11-27 14:30:07', 1010);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `adxl_kaki_kanan`
--
ALTER TABLE `adxl_kaki_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `adxl_kaki_kanan_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `adxl_kaki_kiri`
--
ALTER TABLE `adxl_kaki_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `adxl_kaki_kiri_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `adxl_tangan_kanan`
--
ALTER TABLE `adxl_tangan_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `adxl_tangan_kanan_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `adxl_tangan_kiri`
--
ALTER TABLE `adxl_tangan_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `adxl_tangan_kiri_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `bme280`
--
ALTER TABLE `bme280`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `bme280_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `dht11`
--
ALTER TABLE `dht11`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `dht11_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inmp_kanan`
--
ALTER TABLE `inmp_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `inmp_kanan_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `inmp_kiri`
--
ALTER TABLE `inmp_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `inmp_kiri_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `ky_kanan`
--
ALTER TABLE `ky_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `ky_kanan_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `ky_kiri`
--
ALTER TABLE `ky_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `ky_kiri_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `lengan_atas_kanan`
--
ALTER TABLE `lengan_atas_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_lengan_atas_kanan` (`sensor_id`);

--
-- Indexes for table `lengan_atas_kiri`
--
ALTER TABLE `lengan_atas_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_lengan_atas_kiri` (`sensor_id`);

--
-- Indexes for table `lengan_bawah_kanan`
--
ALTER TABLE `lengan_bawah_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_lengan_bawah_kanan` (`sensor_id`);

--
-- Indexes for table `lengan_bawah_kiri`
--
ALTER TABLE `lengan_bawah_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_lengan_bawah_kiri` (`sensor_id`);

--
-- Indexes for table `siku_kanan`
--
ALTER TABLE `siku_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_siku_kanan` (`sensor_id`);

--
-- Indexes for table `siku_kiri`
--
ALTER TABLE `siku_kiri`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_siku_kiri` (`sensor_id`);

--
-- Indexes for table `lidar`
--
ALTER TABLE `lidar`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `lidar_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_1`
--
ALTER TABLE `loadcell_1`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_1_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_2`
--
ALTER TABLE `loadcell_2`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_2_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_3`
--
ALTER TABLE `loadcell_3`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_3_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_4`
--
ALTER TABLE `loadcell_4`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_4_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_5`
--
ALTER TABLE `loadcell_5`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_5_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `loadcell_6`
--
ALTER TABLE `loadcell_6`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `loadcell_6_sensor_id_foreign` (`sensor_id`) USING BTREE;

--
-- Indexes for table `mpu6050`
--
ALTER TABLE `mpu6050`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `mpu6050_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `mpu6050_vibrate`
--
ALTER TABLE `mpu6050_vibrate`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `mpu6050_vibrate_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `mq2`
--
ALTER TABLE `mq2`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `mq2_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`sensor_id`),
  ADD KEY `sensors_sensor_type_id_foreign` (`sensor_type_id`);

--
-- Indexes for table `sensor_types`
--
ALTER TABLE `sensor_types`
  ADD PRIMARY KEY (`sensor_type_id`);

--
-- Indexes for table `siku_kanan`
--
ALTER TABLE `siku_kanan`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `FK_lengan_atas_kanan` (`sensor_id`);

--
-- Indexes for table `thermal_camera`
--
ALTER TABLE `thermal_camera`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `thermal_camera_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `witsensor`
--
ALTER TABLE `witsensor`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `witsensor_sensor_id_foreign` (`sensor_id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `adxl_kaki_kanan`
--
ALTER TABLE `adxl_kaki_kanan`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `adxl_kaki_kiri`
--
ALTER TABLE `adxl_kaki_kiri`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `adxl_tangan_kanan`
--
ALTER TABLE `adxl_tangan_kanan`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `adxl_tangan_kiri`
--
ALTER TABLE `adxl_tangan_kiri`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bme280`
--
ALTER TABLE `bme280`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2110;

--
-- AUTO_INCREMENT for table `dht11`
--
ALTER TABLE `dht11`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inmp_kanan`
--
ALTER TABLE `inmp_kanan`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inmp_kiri`
--
ALTER TABLE `inmp_kiri`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ky_kanan`
--
ALTER TABLE `ky_kanan`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1613;

--
-- AUTO_INCREMENT for table `ky_kiri`
--
ALTER TABLE `ky_kiri`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=842;

--
-- AUTO_INCREMENT for table `lengan_atas_kanan`
--
ALTER TABLE `lengan_atas_kanan`
  MODIFY `event_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lidar`
--
ALTER TABLE `lidar`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=907;

--
-- AUTO_INCREMENT for table `loadcell_1`
--
ALTER TABLE `loadcell_1`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT for table `loadcell_2`
--
ALTER TABLE `loadcell_2`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `loadcell_3`
--
ALTER TABLE `loadcell_3`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `loadcell_4`
--
ALTER TABLE `loadcell_4`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=239;

--
-- AUTO_INCREMENT for table `loadcell_5`
--
ALTER TABLE `loadcell_5`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `loadcell_6`
--
ALTER TABLE `loadcell_6`
  MODIFY `event_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mpu6050`
--
ALTER TABLE `mpu6050`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3162;

--
-- AUTO_INCREMENT for table `mpu6050_vibrate`
--
ALTER TABLE `mpu6050_vibrate`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `mq2`
--
ALTER TABLE `mq2`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=773;

--
-- AUTO_INCREMENT for table `sensors`
--
ALTER TABLE `sensors`
  MODIFY `sensor_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1108;

--
-- AUTO_INCREMENT for table `sensor_types`
--
ALTER TABLE `sensor_types`
  MODIFY `sensor_type_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `siku_kanan`
--
ALTER TABLE `siku_kanan`
  MODIFY `event_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thermal_camera`
--
ALTER TABLE `thermal_camera`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5074;

--
-- AUTO_INCREMENT for table `witsensor`
--
ALTER TABLE `witsensor`
  MODIFY `event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adxl_kaki_kanan`
--
ALTER TABLE `adxl_kaki_kanan`
  ADD CONSTRAINT `adxl_kaki_kanan_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `adxl_kaki_kiri`
--
ALTER TABLE `adxl_kaki_kiri`
  ADD CONSTRAINT `adxl_kaki_kiri_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `adxl_tangan_kanan`
--
ALTER TABLE `adxl_tangan_kanan`
  ADD CONSTRAINT `adxl_tangan_kanan_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `adxl_tangan_kiri`
--
ALTER TABLE `adxl_tangan_kiri`
  ADD CONSTRAINT `adxl_tangan_kiri_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `bme280`
--
ALTER TABLE `bme280`
  ADD CONSTRAINT `bme280_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `dht11`
--
ALTER TABLE `dht11`
  ADD CONSTRAINT `dht11_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `inmp_kanan`
--
ALTER TABLE `inmp_kanan`
  ADD CONSTRAINT `inmp_kanan_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `inmp_kiri`
--
ALTER TABLE `inmp_kiri`
  ADD CONSTRAINT `inmp_kiri_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `ky_kanan`
--
ALTER TABLE `ky_kanan`
  ADD CONSTRAINT `ky_kanan_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `ky_kiri`
--
ALTER TABLE `ky_kiri`
  ADD CONSTRAINT `ky_kiri_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `lengan_atas_kanan`
--
ALTER TABLE `lengan_atas_kanan`
  ADD CONSTRAINT `FK_lengan_atas_kanan` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `lengan_atas_kiri`
--
ALTER TABLE `lengan_atas_kiri`
  ADD CONSTRAINT `FK_lengan_atas_kiri` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `lengan_bawah_kanan`
--
ALTER TABLE `lengan_bawah_kanan`
  ADD CONSTRAINT `FK_lengan_bawah_kanan` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `lengan_bawah_kiri`
--
ALTER TABLE `lengan_bawah_kiri`
  ADD CONSTRAINT `FK_lengan_bawah_kiri` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `siku_kanan`
--
ALTER TABLE `siku_kanan`
  ADD CONSTRAINT `FK_siku_kanan` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `siku_kiri`
--
ALTER TABLE `siku_kiri`
  ADD CONSTRAINT `FK_siku_kiri` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `lidar`
--
ALTER TABLE `lidar`
  ADD CONSTRAINT `lidar_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_1`
--
ALTER TABLE `loadcell_1`
  ADD CONSTRAINT `loadcell_1_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_2`
--
ALTER TABLE `loadcell_2`
  ADD CONSTRAINT `loadcell_2_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_3`
--
ALTER TABLE `loadcell_3`
  ADD CONSTRAINT `loadcell_3_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_4`
--
ALTER TABLE `loadcell_4`
  ADD CONSTRAINT `loadcell_4_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_5`
--
ALTER TABLE `loadcell_5`
  ADD CONSTRAINT `loadcell_5_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `loadcell_6`
--
ALTER TABLE `loadcell_6`
  ADD CONSTRAINT `loadcell_6_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `mpu6050`
--
ALTER TABLE `mpu6050`
  ADD CONSTRAINT `mpu6050_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `mpu6050_vibrate`
--
ALTER TABLE `mpu6050_vibrate`
  ADD CONSTRAINT `mpu6050_vibrate_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `mq2`
--
ALTER TABLE `mq2`
  ADD CONSTRAINT `mq2_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `sensors`
--
ALTER TABLE `sensors`
  ADD CONSTRAINT `sensors_sensor_type_id_foreign` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_types` (`sensor_type_id`);

--
-- Constraints for table `thermal_camera`
--
ALTER TABLE `thermal_camera`
  ADD CONSTRAINT `thermal_camera_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `witsensor`
--
ALTER TABLE `witsensor`
  ADD CONSTRAINT `witsensor_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
