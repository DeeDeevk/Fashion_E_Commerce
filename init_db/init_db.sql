-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               9.5.0 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



-- Dumping database structure for hkt_shop
CREATE DATABASE IF NOT EXISTS `hkt_shop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_vietnamese_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hkt_shop`;

-- Dumping structure for table hkt_shop.customer
CREATE TABLE IF NOT EXISTS `customer` (
                                          `customer_id` int NOT NULL AUTO_INCREMENT,
                                          `create_at` date DEFAULT NULL,
                                          `date_of_birth` datetime(6) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `full_name` varchar(255) DEFAULT NULL,
    `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
    `phone_number` varchar(255) DEFAULT NULL,
    `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
    `update_at` date DEFAULT NULL,
    PRIMARY KEY (`customer_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.customer: ~10 rows (approximately)
INSERT INTO `customer` (`customer_id`, `create_at`, `date_of_birth`, `email`, `full_name`, `gender`, `phone_number`, `status`, `update_at`) VALUES
                                                                                                                                                (1, '2024-10-01', '1998-03-14 00:00:00.000000', 'leesin@example.com', 'Leesin', 'MALE', '0911111111', 'ACTIVE', '2024-10-01'),
                                                                                                                                                (2, '2024-10-02', '2000-07-21 00:00:00.000000', 'halland@example.com', 'Erling Halland', 'MALE', '0903333444', 'ACTIVE', '2024-10-02'),
                                                                                                                                                (3, '2024-10-03', '1995-10-12 00:00:00.000000', 'doku@example.com', 'Jeremy Doku', 'MALE', '0905555666', 'ACTIVE', '2024-10-03'),
                                                                                                                                                (4, '2024-10-04', '1999-01-01 00:00:00.000000', 'vinicious@example.com', 'Vinicius Junior', 'FEMALE', '0907777888', 'ACTIVE', '2024-10-04'),
                                                                                                                                                (5, '2024-10-05', '1997-08-09 00:00:00.000000', 'donnarumma@example.com', 'Donnarumma', 'MALE', '0911111333', 'ACTIVE', '2024-10-05'),
                                                                                                                                                (6, '2024-10-06', '2001-05-05 00:00:00.000000', 'cr7@example.com', 'Cristiano Ronaldo', 'FEMALE', '0912222444', 'ACTIVE', '2024-10-06'),
                                                                                                                                                (7, '2024-10-07', '1996-11-25 00:00:00.000000', 'foden@example.com', 'Phil Foden', 'MALE', '0913333555', 'ACTIVE', '2024-10-07'),
                                                                                                                                                (8, '2024-10-08', '1988-02-07 00:00:00.000000', 'aguero@example.com', 'Sergio Aguero', 'MALE', '0914444666', 'INACTIVE', '2024-10-08'),
                                                                                                                                                (9, '2024-10-09', '1994-02-02 00:00:00.000000', 'messi@example.com', 'Messi', 'MALE', '0915555777', 'ACTIVE', '2024-10-09'),
                                                                                                                                                (10, '2026-05-06', '2004-10-20 07:00:00.000000', 'khoa01022020@gmail.com', 'Khoa', 'MALE', '0812777991', 'ACTIVE', '2026-05-06');

-- Dumping structure for table hkt_shop.account
CREATE TABLE IF NOT EXISTS `account` (
                                         `login_id` int NOT NULL AUTO_INCREMENT,
                                         `create_at` datetime(6) DEFAULT NULL,
    `password` varchar(255) DEFAULT NULL,
    `role` enum('ADMIN','STAFF','USER') DEFAULT NULL,
    `status_login` enum('ACTIVE','LOCKED','PENDING') DEFAULT NULL,
    `update_at` datetime(6) DEFAULT NULL,
    `username` varchar(255) DEFAULT NULL,
    `customer_id` int DEFAULT NULL,
    PRIMARY KEY (`login_id`),
    KEY `FKnnwpo0lfq4xai1rs6887sx02k` (`customer_id`),
    CONSTRAINT `FKnnwpo0lfq4xai1rs6887sx02k` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.account: ~11 rows (approximately)
INSERT INTO `account` (`login_id`, `create_at`, `password`, `role`, `status_login`, `update_at`, `username`, `customer_id`) VALUES
                                                                                                                                (1, '2024-10-01 00:00:00.000000', '$2a$10$pdErrGmqR6k4c2cHmTVrCOoKtQmoR.frS.lAFbvU6e7/Cjbnt98Xi', 'USER', 'ACTIVE', '2024-10-01 00:00:00.000000', 'Leesin', 1),
                                                                                                                                (2, '2024-10-02 00:00:00.000000', '$2a$10$UwU6c/qJC6Tg9/ySe5RYLOCtH3pTHzakrVAV0hjRfWzNVCe2kyJni', 'USER', 'ACTIVE', '2024-10-02 00:00:00.000000', 'Halland', 2),
                                                                                                                                (3, '2024-10-03 00:00:00.000000', '$2a$10$ezcfId8HGRycvLNNEQZdG.hLaSJ4xLvNoi0KRUkBU6tgu6vlKN2n2', 'USER', 'ACTIVE', '2024-10-03 00:00:00.000000', 'Doku', 3),
                                                                                                                                (4, '2024-10-04 00:00:00.000000', '$2a$10$p1gJ9SJINENQKTZDp02jFOJVy3p3Aci2CNf1AOjR7.PylbyBtGzVm', 'USER', 'ACTIVE', '2024-10-04 00:00:00.000000', 'Vinicious', 4),
                                                                                                                                (5, '2024-10-05 00:00:00.000000', '$2a$10$.7Rcw1esqB3LUK.bgVxmo.7jbWjsuckn4rPd4lGniJJdzyHOCh05i', 'USER', 'ACTIVE', '2024-10-05 00:00:00.000000', 'Donnarumma', 5),
                                                                                                                                (6, '2024-10-06 00:00:00.000000', '$2a$10$asqFiSnfasSX4/g2fPID4ec9hxDWHbXDDTlN7FEwRpUjGz4itBlPm', 'USER', 'ACTIVE', '2024-10-06 00:00:00.000000', 'CR7', 6),
                                                                                                                                (7, '2024-10-07 00:00:00.000000', '$2a$10$lzBHVSAD78l.eR/xM3IrEe2.iMhRwmuEXgSDrHSpJ0DoaojEMu3b2', 'USER', 'ACTIVE', '2024-10-07 00:00:00.000000', 'Foden', 7),
                                                                                                                                (8, '2024-10-08 00:00:00.000000', '$2a$10$It2D4MaWB4Hq5PI9JyaUDu9.bscYWA7er6L3ZVv3B3FJl47ndvgH2', 'USER', 'LOCKED', '2024-10-08 00:00:00.000000', 'Aguero', 8),
                                                                                                                                (9, '2024-10-09 00:00:00.000000', '$2a$10$rL7cPLbyOKSb7x/ebJM3CuXvv5wC3Ksa6i6L9D.BCLwq0fg9gxRb.', 'STAFF', 'PENDING', '2024-10-09 00:00:00.000000', 'Lionel Messi', 9),
                                                                                                                                (10, NULL, '$2a$10$MMjyqkEVjFAHOgqfzF.w9O9XvSpYxuMI.3sHV8HVb0CoT31tiaGpS', 'ADMIN', NULL, NULL, 'admin', NULL),
                                                                                                                                (11, '2026-05-06 00:00:00.000000', '$2a$10$Ptn986KnA2m9XJK8kuHo9OoFlos3yFBuP.uOAsxt8bHRw9xNnuFLi', 'USER', 'ACTIVE', '2026-05-06 00:00:00.000000', 'deedeevk', 10);

-- Dumping structure for table hkt_shop.address
CREATE TABLE IF NOT EXISTS `address` (
                                         `id` bigint NOT NULL AUTO_INCREMENT,
                                         `delivery_address` varchar(255) DEFAULT NULL,
    `delivery_note` varchar(255) DEFAULT NULL,
    `province` varchar(255) DEFAULT NULL,
    `account_id` int DEFAULT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.address: ~21 rows (approximately)
INSERT INTO `address` (`id`, `delivery_address`, `delivery_note`, `province`, `account_id`) VALUES
                                                                                                (1, '123 Đường Giải Phóng, Quận Hai Bà Trưng', 'Giao giờ hành chính', 'Hà Nội', 1),
                                                                                                (2, '45 Trần Duy Hưng, Cầu Giấy', 'Gọi trước khi giao', 'Hà Nội', 1),
                                                                                                (3, '25 Nguyễn Huệ, Quận 1', 'Giao buổi sáng', 'TP. Hồ Chí Minh', 2),
                                                                                                (4, '120 Lê Văn Sỹ, Quận 3', 'Không giao sau 20h', 'TP. Hồ Chí Minh', 2),
                                                                                                (5, '89 Nguyễn Văn Linh, Hải Châu', 'Liên hệ bảo vệ tòa nhà', 'Đà Nẵng', 3),
                                                                                                (6, '56 Nguyễn Trãi, Ninh Kiều', 'Giao nhanh trong ngày', 'Cần Thơ', 3),
                                                                                                (7, '12 Lạch Tray, Ngô Quyền', 'Để hàng trước cửa', 'Hải Phòng', 4),
                                                                                                (8, '77 Hùng Vương, Phường Phú Nhuận', 'Người nhận: Anh Minh', 'Thừa Thiên Huế', 4),
                                                                                                (9, '09 Nguyễn Gia Thiều, TP. Bắc Ninh', 'Không giao cuối tuần', 'Bắc Ninh', 5),
                                                                                                (10, '50 Trần Phú, TP. Nha Trang', 'Liên hệ trước 30 phút', 'Khánh Hòa', 5),
                                                                                                (11, '150 Võ Thị Sáu, P. Thống Nhất', 'Có thể giao buổi tối', 'Đồng Nai', 6),
                                                                                                (12, '98 Lê Duẩn, TP. Buôn Ma Thuột', 'Giao cho lễ tân', 'Đắk Lắk', 6),
                                                                                                (13, '12 Hạ Long, Phường 2', 'Cần gọi trước khi đến', 'Bà Rịa - Vũng Tàu', 7),
                                                                                                (14, '67 Nguyễn Huệ, Tân An', 'Giao buổi chiều', 'Long An', 7),
                                                                                                (15, '33 Phan Đình Phùng, TP. Hà Tĩnh', 'Nhà gần trường học', 'Hà Tĩnh', 8),
                                                                                                (16, '88 Trần Quốc Nghiễn, Hạ Long', 'Không gọi cửa', 'Quảng Ninh', 8),
                                                                                                (17, '120 Cách Mạng Tháng 8, TP. Thái Nguyên', 'Người nhận là bố tôi', 'Thái Nguyên', 9),
                                                                                                (18, '75 Hùng Vương, TP. Nam Định', 'Có chó dữ, gọi trước', 'Nam Định', 9),
                                                                                                (19, '5 Trần Hưng Đạo, TP. Hòa Bình', 'Nhà cuối ngõ nhỏ', 'Hòa Bình', 10),
                                                                                                (20, '230 Đại lộ Bình Dương, TP. Thủ Dầu Một', 'Công ty ABC, tầng 3', 'Bình Dương', 10),
                                                                                                (21, '256, ấp An Khoa, xã Vĩnh Mỹ B', 'Gần nhà thờ', 'Bạc Liêu', 4);



-- Dumping structure for table hkt_shop.category
CREATE TABLE IF NOT EXISTS `category` (
                                          `category_id` int NOT NULL AUTO_INCREMENT,
                                          `created_at` datetime(6) DEFAULT NULL,
    `description` varchar(255) DEFAULT NULL,
    `display_order` int DEFAULT NULL,
    `image_url` varchar(255) DEFAULT NULL,
    `is_active` bit(1) DEFAULT NULL,
    `category_name` varchar(255) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`category_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.category: ~3 rows (approximately)
INSERT INTO `category` (`category_id`, `created_at`, `description`, `display_order`, `image_url`, `is_active`, `category_name`, `updated_at`) VALUES
                                                                                                                                                  (1, '2025-11-10 00:00:00.000000', 'Các loại áo như áo thun, sơ mi, hoodie...', 1, 'https://i.postimg.cc/LXQSc1jQ/Tops-Size-Chart.png', b'1', 'Top', '2025-11-10 00:00:00.000000'),
                                                                                                                                                  (2, '2025-11-10 00:00:00.000000', 'Các loại quần như jeans, trousers, shorts...', 2, 'https://i.postimg.cc/HsDMRc35/Bottoms-Size-Chart.png', b'1', 'Bottom', '2025-11-10 00:00:00.000000'),
                                                                                                                                                  (3, '2025-11-10 00:00:00.000000', 'Các loại phụ kiện như ví, mũ, thắt lưng...', 3, 'https://i.postimg.cc/T3QWKkx7/accessires-Sizechart.png', b'1', 'Accessories', '2025-11-10 00:00:00.000000');



-- Dumping structure for table hkt_shop.product
CREATE TABLE IF NOT EXISTS `product` (
                                         `product_id` int NOT NULL AUTO_INCREMENT,
                                         `brand` varchar(255) DEFAULT NULL,
    `cost_price` double DEFAULT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    `description` varchar(255) DEFAULT NULL,
    `discount_amount` double DEFAULT NULL,
    `form` varchar(255) DEFAULT NULL,
    `image_url_back` varchar(255) DEFAULT NULL,
    `image_url_front` varchar(255) DEFAULT NULL,
    `material` varchar(255) DEFAULT NULL,
    `product_name` varchar(255) DEFAULT NULL,
    `price` double DEFAULT NULL,
    `quantity` int DEFAULT NULL,
    `rating` double DEFAULT NULL,
    `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
    `unit` varchar(255) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `category` int DEFAULT NULL,
    PRIMARY KEY (`product_id`),
    KEY `FKqx9wikktsev17ctu0kcpkrafc` (`category`),
    CONSTRAINT `FKqx9wikktsev17ctu0kcpkrafc` FOREIGN KEY (`category`) REFERENCES `category` (`category_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.product: ~61 rows (approximately)
INSERT INTO `product` (`product_id`, `brand`, `cost_price`, `created_at`, `description`, `discount_amount`, `form`, `image_url_back`, `image_url_front`, `material`, `product_name`, `price`, `quantity`, `rating`, `status`, `unit`, `updated_at`, `category`) VALUES
                                                                                                                                                                                                                                                                    (1, 'KH3T', 297500, '2025-11-01 00:00:00.000000', 'Compact leather wallet featuring the signature Triple Star logo, perfect for everyday essentials with multiple card slots and a sleek design.', 15, NULL, 'https://content.pancake.vn/1/s2360x2950/06/9c/80/1c/fbbe27ea27340bd2cb3467e91d49a6e0e37f33b6651c1a1422ecf38a-w:2400-h:3000-l:703943-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/35/d5/16/04/8a7e15b89251d0132ab9ba5025dbd2f35afaf47ccc47a1bd14541f02-w:2400-h:3000-l:871502-t:image/jpeg.jpeg', 'Leather', 'Triple Star Small Wallet', 350000, 0, 4.5, 'ACTIVE', 'piece', '2025-11-01 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (2, 'KH3T', 850000, '2025-11-02 00:00:00.000000', 'Baggy-fit jeans crafted from premium raw denim with bold contrast stitching along the seams, offering a rugged streetwear vibe and lasting durability.', 0, 'Baggy Fit', 'https://content.pancake.vn/1/s2360x2950/21/08/9e/78/4ead1df425b3f0caa19594fc6fd40a9418d15d6aefbf95f7f5e85633-w:2400-h:3000-l:906251-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/88/d3/98/05/f32daa82a82f8cf47c9256f5303cc907852f6f2ad97b0d84cc1e7464-w:2400-h:3000-l:875966-t:image/jpeg.jpeg', 'Denim Fabric', 'Raw Denim Stitch Baggy Jeans', 850000, 150, 4.2, 'ACTIVE', 'piece', '2025-11-02 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (3, 'KH3T', 580000, '2025-11-08 00:00:00.000000', 'Relaxed wide-leg denim shorts with a stonewashed finish, delivering a worn-in feel and laid-back style for summer adventures.', 0, 'Wide Leg', 'https://content.pancake.vn/1/s2360x2950/68/db/26/51/ffaeccd1e4548ea3f0f1f830d0f213d0e3c86bcd18aac3cc9cc347b4-w:2400-h:3000-l:949630-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/7d/cb/77/12/3658a18f95a81bbeae63064b0a133ec1055bc1ad173e84f5e9c984a1-w:2400-h:3000-l:942162-t:image/jpeg.jpeg', 'Washed Denim Fabric', 'Washed Jorts', 580000, 130, 4.2, 'ACTIVE', 'piece', '2025-11-08 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (4, 'KH3T', 623000, '2025-11-09 00:00:00.000000', 'Playful baggy jeans featuring laser-etched Hello Kitty monogram patterns on blue denim, blending cute nostalgia with modern street fashion.', 30, 'Baggy Fit', 'https://content.pancake.vn/1/s2360x2950/96/a7/4f/07/f07f02a110fb8870cf5fda26b57eacb2be37f28895c25ba31ec28ebc-w:2400-h:3000-l:871816-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/2d/0d/4f/5b/b7f983e37623a32d63d7fe5cbd507f6d829dc81600d6915d71e80215-w:2400-h:3000-l:866495-t:image/jpeg.jpeg', 'Denim Fabric', 'Hello Kitty | Monogram Laser Baggy Jeans/ Blue', 890000, 160, 4.6, 'ACTIVE', 'piece', '2025-11-09 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (5, 'KH3T', 640000, '2025-11-09 00:00:00.000000', 'Raw denim shorts with prominent contrast stitching, offering a bold street-style edge and authentic indigo tones that age beautifully.', 0, 'Relaxed Fit', 'https://content.pancake.vn/1/s2360x2950/02/c2/d1/77/9c3c25b59550067ac938d6f54d9eaa4ba32a2945d2bbc1d3e07f74c5-w:2400-h:3000-l:699977-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/8e/98/0e/8f/d7ee022ef29029292c42392a46119e9d9237a16442183eeb5eb5a337-w:2400-h:3000-l:758044-t:image/jpeg.jpeg', 'Raw Denim Fabric', 'Raw Denim Stitch Jorts', 640000, 120, 4.3, 'ACTIVE', 'piece', '2025-11-09 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (6, 'KH3T', 350000, '2025-11-10 00:00:00.000000', 'Iconic baseball cap with embroidered Triple Star logo, crafted from durable cotton twill for adjustable fit and all-season wear.', 0, NULL, 'https://content.pancake.vn/1/s2360x2950/c8/95/bd/af/6aa65e15b346e85b3e163c75fe3eb934fb1988f2f4a5b761308666a6-w:3000-h:3750-l:772418-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/eb/9d/05/86/c71db778c9fc68b01cfb5567e3aca8afa8cc2f33061aa3320cdfd068-w:3000-h:3750-l:906440-t:image/jpeg.jpeg', 'Cotton Twill', 'Triple Star Classic Cap', 350000, 180, 4.5, 'ACTIVE', 'piece', '2025-11-10 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (7, 'KH3T', 920000, '2025-11-10 00:00:00.000000', 'Functional cargo pants in camo-printed denim with adjustable drawstring waist and multiple pockets for urban utility and style.', 0, 'Cargo Fit', 'https://bizweb.dktcdn.net/100/467/832/products/2-b470db82-e71a-4cf9-8e28-62c1c975f57b.jpg?v=1759739709173', 'https://bizweb.dktcdn.net/100/369/010/products/1-78923368-337f-44b9-ac48-be320f783c1e.jpg?v=1759738837640', 'Denim Fabric', 'Drawstring Camo Denim Cargo Pants', 920000, 0, 4.4, 'ACTIVE', 'piece', '2025-11-10 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (8, 'KH3T', 774400, '2025-11-11 00:00:00.000000', 'Relaxed-fit jeans adorned with intricate embroidery details, blending artisanal craftsmanship with comfortable wide-leg silhouette.', 12, 'Relaxed Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-f30db60a-39e0-44b3-be80-57747ec52a70.jpg?v=1741776104327', 'https://bizweb.dktcdn.net/100/369/010/products/1-ff052270-6218-448d-9e38-dcfbf32e70c5.jpg?v=1741776100473', 'Denim Fabric', 'Embroidery Relaxed Denim Pants', 880000, 110, 4.2, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (9, 'KH3T', 940000, '2025-11-11 00:00:00.000000', 'Black denim pants with flame-washed patterns and relaxed fit, delivering a fiery graphic edge on premium soft fabric.', 0, 'Relaxed Fit', 'https://bizweb.dktcdn.net/100/467/832/products/2-6bf4c748-941f-4ead-a7fb-c8da38116b46.jpg?v=1742283113913', 'https://bizweb.dktcdn.net/100/369/010/products/1-b659b5cb-f76c-41d1-8dce-997a01600581.jpg?v=1741777532280', 'Washed Denim Fabric', 'Flame Wash Relaxed Denim Pants Black', 940000, 140, 4.5, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (10, 'KH3T', 508400, '2025-11-11 00:00:00.000000', 'Light blue baggy denim shorts featuring embroidered brand logo, perfect for casual summer looks with roomy comfort.', 18, 'Baggy Fit', 'https://bizweb.dktcdn.net/100/467/832/products/2-d999950b-7978-48d5-9840-3f9080110902.jpg?v=1725536248633', 'https://bizweb.dktcdn.net/100/369/010/products/1-61e699dd-5311-4a93-bf89-6977dae6d0bd.jpg?v=1725529114293', 'Denim Fabric', 'Embroidery Logo Baggy Denim Shorts - Light Blue', 620000, 160, 4.4, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (11, 'KH3T', 820000, '2025-11-11 00:00:00.000000', 'Essential black wash jeans designed for maximum comfort with stretch denim and a relaxed cut for everyday versatility.', 0, 'Relaxed Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-0fba7023-d6c5-4857-8c90-7467f41b8c37.jpg?v=1732678939560', 'https://bizweb.dktcdn.net/100/369/010/products/1-63b26a60-2caf-4f8c-965a-302f4dab30f9.jpg?v=1732678937617', 'Washed Denim Fabric', 'Comfy Essential Jeans - Black Wash', 820000, 150, 4.3, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (12, 'KH3T', 694200, '2025-11-11 00:00:00.000000', 'Black wash baggy cargo pants with multiple utility pockets and relaxed fit, ideal for functional yet stylish streetwear outfits.', 22, 'Baggy Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-eeb798d2-f14e-4433-8fb4-4c9aa6d6a112.jpg?v=1736327341583', 'https://bizweb.dktcdn.net/100/369/010/products/1-e5f30f90-2b28-4625-9f96-70d9fbb35806.jpg?v=1736327338300', 'Washed Denim Fabric', 'Casual Baggy Cargo Pants Black Wash', 890000, 120, 4.5, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (13, 'KH3T', 680000, '2025-11-12 00:00:00.000000', 'Relaxed-fit blue wash denim shorts featuring distressed frayed hem and subtle logo embroidery, perfect for casual summer streetwear.', 0, 'Relaxed Fit', 'https://bizweb.dktcdn.net/100/467/832/products/2-79ada7b5-89bb-4296-af47-423fb1352857.jpg?v=1720699479787', 'https://bizweb.dktcdn.net/100/467/832/products/1-8103bcdf-a521-4b19-a75c-b18c99f11998.jpg?v=1720699476997', 'Washed Denim Fabric', 'Denim Shorts Frayed Logo - Blue Wash', 680000, 120, 4.4, 'ACTIVE', 'piece', '2025-11-12 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (14, 'KH3T', 729800, '2025-11-12 00:00:00.000000', 'Sophisticated wide-leg trousers with premium metal label detail at waistband, crafted from smooth cotton blend for elevated everyday style.', 18, 'Wide Leg', 'https://bizweb.dktcdn.net/100/369/010/products/2-5995df67-88ef-4636-a30f-265330c86307.jpg?v=1726398302483', 'https://bizweb.dktcdn.net/100/369/010/products/1-7a91d995-223d-4591-a04b-8523157413be.jpg?v=1726398299700', 'Cotton Blend', 'Metal Label Wide Trouser Pants – Black', 890000, 95, 4.6, 'ACTIVE', 'piece', '2025-11-12 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (15, 'KH3T', 890000, '2025-11-13 00:00:00.000000', 'Rich brown wide-leg trousers featuring signature metal label hardware, offering a refined silhouette with premium drape and comfort.', 0, 'Wide Leg', 'https://bizweb.dktcdn.net/100/369/010/products/2-1379b03d-4fd4-4d5e-a30b-4cd641c9b631.jpg?v=1726397682967', 'https://bizweb.dktcdn.net/100/369/010/products/1-1ff98863-3e2e-45f6-9177-692e17f002e3.jpg?v=1726397680083', 'Cotton Blend', 'Metal Label Wide Trouser Pants - Brown', 890000, 10, 4.5, 'ACTIVE', 'piece', '2025-11-13 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (16, 'KH3T', 694200, '2025-11-13 00:00:00.000000', 'Cream wide-leg trousers with minimalist metal label accent, delivering clean lines and luxurious fabric feel for versatile styling.', 22, 'Wide Leg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9jLiIJIHii2xenDaBg78NAxrpNhikLpB1Kh14oE2C40EUrUgG2WkIKdNMvVe9xJlm0Pc&usqp=CAU', 'https://bizweb.dktcdn.net/100/369/010/products/1-2ed36f1c-2507-4a3a-8acb-6ce2bfd771aa.jpg?v=1726398721743', 'Cotton Blend', 'Metal Label Wide Trouser Pants - Cream', 890000, 0, 4.7, 'ACTIVE', 'piece', '2025-11-13 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (17, 'KH3T', 950000, '2025-11-14 00:00:00.000000', 'Heavy-duty brown denim pants with reinforced double-knee panels and heavy distressing, built for durability and rugged aesthetic.', 0, 'Relaxed Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE9nCGdkk14Hb4iiRe7dlAB6LINbgvrSbT0w&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_KFncXizxH15A3rEN3Z7VHmzjgfwzRO6nTw&s', 'Heavy Denim Fabric', 'Distressed Double Knee Denim Pants Brown', 950000, 80, 4.3, 'ACTIVE', 'piece', '2025-11-14 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (18, 'KH3T', 833000, '2025-11-14 00:00:00.000000', 'Functional black cargo pants with oversized flap pockets and adjustable drawstring hems, combining utility with modern street style.', 15, 'Cargo Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDVIOs1hKOM42HjRqfT1HxOPDDfsA_MUWc1Q&s', 'https://bizweb.dktcdn.net/100/369/010/products/1-c4255c5d-cd9c-4edc-8df2-17f047355d56.jpg?v=1736418044923', 'Cotton Canvas', 'Big Pounch Cargo Pants - Black', 980000, 105, 4.6, 'ACTIVE', 'piece', '2025-11-14 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (19, 'KH3T', 784000, '2025-11-15 00:00:00.000000', 'Earth-tone brown cargo pants featuring massive pouch pockets and reinforced stitching, perfect for urban explorers.', 20, 'Cargo Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-94d0cee4-3780-442d-bdc0-66f35726b62d.jpg?v=1736490285537', 'https://bizweb.dktcdn.net/100/369/010/products/quan-baggy.jpg?v=1736490285537', 'Cotton Canvas', 'Big Pounch Cargo Pants - Brown', 980000, 0, 4.5, 'ACTIVE', 'piece', '2025-11-15 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (20, 'KH3T', 540000, '2025-11-15 00:00:00.000000', 'Playful blue denim shorts adorned with Hello Kitty bow embroidery and pearl details, blending cute aesthetics with streetwear edge.', 25, 'Relaxed Fit', 'https://content.pancake.vn/1/s2360x2950/01/62/4b/81/bda4573fd2fff64c4e260cca1fe1cf987b47b025237de4635cd2097b-w:2400-h:3000-l:967700-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/23/77/e2/f4/5fa6d0958119c7d9a0e7243849ae0c54876ee93d5339d1d6ed0b491d-w:2400-h:3000-l:897588-t:image/jpeg.jpeg', 'Denim Fabric', 'Hello Kitty | Bow Jorts/ Blue', 720000, 130, 4.8, 'ACTIVE', 'piece', '2025-11-15 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (21, 'KH3T', 690000, '2025-11-16 00:00:00.000000', 'Ultra-comfortable fleece-lined sweatpants with embroidered Triple Star logo, featuring tapered fit and ribbed cuffs for all-day lounge.', 0, 'Tapered Fit', 'https://content.pancake.vn/1/s2360x2950/e7/e2/6e/51/45a422a26ade71454c176e31e57d6984e38d840b11490b4f1b1d4f45-w:2400-h:3000-l:621510-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/c6/3f/04/20/7a30518ecbc3b781e3db726af59cd1dfbac6e9a11de1f20fecfe876e-w:2400-h:3000-l:1119144-t:image/jpeg.jpeg', 'French Terry', 'Triple Star Classic Sweatpants', 690000, 160, 4.7, 'ACTIVE', 'piece', '2025-11-16 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (22, 'KH3T', 850000, '2025-11-16 00:00:00.000000', 'Everyday essential jeans in unique moss blue wash with added stretch for superior comfort and modern relaxed fit.', 0, 'Relaxed Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyTDSDX6Y2deWIdL9umM7FzN1q5VdqZb6Rcg&s', 'https://bizweb.dktcdn.net/100/369/010/products/177.jpg?v=1720499117420', 'Stretch Denim', 'Comfy Essential Jeans - Moss Blue', 850000, 140, 4.4, 'ACTIVE', 'piece', '2025-11-16 00:00:00.000000', 2),
                                                                                                                                                                                                                                                                    (23, 'KH3T', 580000, '2025-11-17 00:00:00.000000', 'Premium cotton pique polo with embroidered cross motif and subtle two-tone collar, perfect for smart-casual looks.', 0, 'Relaxed Fit', 'https://product.hstatic.net/200000306799/product/apf7001_3_a4ae9ae0605a4e2dbfe846f619007434_master.jpg', 'https://product.hstatic.net/200000306799/product/apf7001_2_e1a1dc9984db4ff9a0c3fad5ee225e40_master.jpg', 'Cotton Pique', 'Polo Cross / Light Grey Green', 580000, 180, 4.6, 'ACTIVE', 'piece', '2025-11-17 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (24, 'KH3T', 434000, '2025-11-17 00:00:00.000000', 'Edgy black polo featuring playful devil cat embroidery and contrast piping, blending cute and rebellious style.', 30, 'Relaxed Fit', 'https://product.hstatic.net/200000306799/product/4e74cb99-f35f-492a-b30f-5ff001f46393_75830af0db9a4e6db074a87955faa1ef_master.jpeg', 'https://product.hstatic.net/200000306799/product/46935144-ca96-4bc5-80a4-22a81568f011_3cc99d970d434917a974609a45a85cb1_master.jpeg', 'Cotton Pique', 'Polo Devil Meow / Black', 620000, 0, 4.8, 'ACTIVE', 'piece', '2025-11-17 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (25, 'KH3T', 572000, '2025-11-18 00:00:00.000000', 'Boxy-fit long-sleeve polo with bold horizontal stripes and dropped shoulders for contemporary oversized aesthetic.', 12, 'Boxy Fit', 'https://content.pancake.vn/1/s2360x2950/11/35/52/a9/2d2c1ae91216a975a2534cb3c5c0ddea042f47476d6ae141e052ab41-w:3000-h:3750-l:931232-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/b3/af/03/96/b8461d2219e55c4aaaa43b0f2d6d216133b4c96fffe015151eff03ca-w:3000-h:3750-l:971270-t:image/jpeg.jpeg', 'Cotton Blend', 'Striped Long Sleeve Boxy Polo Shirt', 650000, 155, 4.5, 'ACTIVE', 'piece', '2025-11-18 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (26, 'KH3T', 550000, '2025-11-18 00:00:00.000000', 'Seasonal oversized long-sleeve tee with premium heavy cotton and relaxed boxy silhouette for ultimate comfort.', 0, 'Oversized', 'https://content.pancake.vn/1/s2360x2950/37/4b/a7/b8/24696108471b7b6be6fdc4d73c64db26d661fc7f8d1cc33a81d3d0fd-w:3000-h:3750-l:860739-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/ac/7e/2d/d2/11a51615a03a8918bda28100852b0ec9783634c7c43beaa4cf2103f7-w:3000-h:3750-l:908357-t:image/jpeg.jpeg', 'Heavy Cotton', 'Seasonal Long Sleeve Boxy Tee', 550000, 200, 4.6, 'ACTIVE', 'piece', '2025-11-18 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (27, 'KH3T', 507000, '2025-11-19 00:00:00.000000', 'Limited collab oversized jersey featuring Hello Kitty as champion with vintage sportswear aesthetic and mesh fabric.', 35, 'Oversized', 'https://content.pancake.vn/1/s2360x2950/82/6c/35/d7/d895af27de2b34d68c2ab62836ba01c74c4d5523409753bdddd5fd43-w:3000-h:3750-l:718306-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/72/73/3b/4b/df679a1a9c944c3c52997502b841560340b41bc31608676c9a813004-w:3000-h:3750-l:796197-t:image/jpeg.jpeg', 'Mesh Polyester', 'Hello Kitty | Champion Oversized Jersey/ White', 780000, 90, 4.9, 'ACTIVE', 'piece', '2025-11-19 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (28, 'KH3T', 680000, '2025-11-17 00:00:00.000000', 'Minimalist black crossbody bag with adjustable strap and multiple compartments, crafted from premium vegan leather.', 0, NULL, 'https://bizweb.dktcdn.net/100/369/010/products/1-a520ece2-fb41-40f8-859d-38af590ce278.jpg?v=1737541346127', 'https://bizweb.dktcdn.net/100/369/010/products/176-2.jpg?v=1752240418253', 'Vegan Leather', 'Crossbody Bag - Black', 680000, 140, 4.7, 'ACTIVE', 'piece', '2025-11-17 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (29, 'KH3T', 782000, '2025-11-17 00:00:00.000000', 'Statement silver crossbody bag covered in tonal logo patches, featuring chain strap and magnetic closure.', 15, NULL, 'https://bizweb.dktcdn.net/100/369/010/products/2-8b83d771-31ca-487d-9575-c7c62733242f.jpg?v=1737541396687', 'https://bizweb.dktcdn.net/100/369/010/products/1-dadae622-ed5f-4a26-b279-a67f28bad643.jpg?v=1737541393880', 'Metallic PU', 'Logo Patches Crossbody Bag Silver', 920000, 75, 4.8, 'ACTIVE', 'piece', '2025-11-17 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (30, 'KH3T', 285000, '2025-11-17 00:00:00.000000', 'Classic trucker hat with bold striped pattern and embroidered logo patch, featuring breathable mesh back.', 25, NULL, 'https://content.pancake.vn/1/s2360x2950/5e/02/46/9c/136f676cc6f2e3846ec72b9cea8ff5126e33d9735466403358d500cb-w:3000-h:3750-l:695373-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/a1/ac/ef/13/9eb5e58568dd3f8a9170e178045d0c48ded465c6da5bd9abada1571b-w:3000-h:3750-l:941366-t:image/jpeg.jpeg', 'Cotton Twill & Mesh', 'Striped Trucker Hat', 380000, 0, 4.5, 'ACTIVE', 'piece', '2025-11-17 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (31, 'KH3T', 720000, '2025-11-22 00:00:00.000000', 'Lightweight tan button-up shirt featuring subtle all-over floral silhouette print, crafted from breathable rayon for effortless summer layering.', 0, 'Regular Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSARC_wvFag-dm61YSY3mXqhvsmHXDbZbA_aQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAQgE18Mu4hxOVW4YlVjBw2EmtIN5y_Gdpjg&s', 'Rayon Blend', 'Floral Silhouette Shirt Tan', 720000, 135, 4.6, 'ACTIVE', 'piece', '2025-11-22 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (32, 'KH3T', 489600, '2025-11-22 00:00:00.000000', 'Vibrant red-green soccer jersey with bold "Dico Seven" graphic and retro numbering, made from moisture-wicking mesh for on-and-off field wear.', 28, 'Athletic Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo_Ckp4uN5WLNS03HpalrhG1ecv9HFl12hDw&s', 'https://bizweb.dktcdn.net/100/369/010/products/1-9a732fc5-1729-4cc8-9bfc-f2d40e062eef.jpg?v=1751626104677', 'Polyester Mesh', 'Soccer Jersey Dico Seven Red Green', 680000, 0, 4.7, 'ACTIVE', 'piece', '2025-11-22 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (33, 'KH3T', 552500, '2025-11-22 00:00:00.000000', 'Clean baby blue and white striped soccer jersey with minimal branding, featuring lightweight fabric and classic athletic cut.', 15, 'Athletic Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-e3bdbffe-3995-46cd-ad91-34c7c87e38b2.jpg?v=1743234418537', 'https://bizweb.dktcdn.net/100/369/010/products/1-a9b76695-2d0b-439c-9764-9b37cbecf804.jpg?v=1743234415570', 'Polyester Mesh', 'Striped Soccer Jersey Baby Blue White', 650000, 160, 4.5, 'ACTIVE', 'piece', '2025-11-22 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (34, 'KH3T', 520000, '2025-11-22 00:00:00.000000', 'Bold forest green tee with oversized western-inspired logo graphic across chest, crafted from premium heavy-weight cotton.', 0, 'Regular Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPIRp4y2hMwCur6um5giAioeXqwyKqMkIhSA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpg5EZssL56aXhYc8K_BSLu5sO3wX7kigTFA&s', 'Heavy Cotton', 'Western Logo Print T-Shirt Green', 520000, 190, 4.6, 'ACTIVE', 'piece', '2025-11-22 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (35, 'KH3T', 624000, '2025-11-14 00:00:00.000000', 'Classic varsity-style baseball jersey with contrasting raglan sleeves and bold horizontal stripes, perfect for streetwear layering.', 20, 'Relaxed Fit', 'https://content.pancake.vn/1/s2360x2950/b5/97/aa/b7/5e4fea4c171ea9c104dad6896e77ce4500ce75e51c675fdb4c04f4f0-w:3000-h:3750-l:1002130-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/3d/86/7c/ae/4d423b313e606e351314df249b8ba865157bf42ede249ea1b9a5807a-w:3000-h:3750-l:971406-t:image/jpeg.jpeg', 'Cotton-Poly Blend', 'Striped Baseball Jersey', 780000, 110, 4.8, 'ACTIVE', 'piece', '2025-11-14 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (36, 'KH3T', 333200, '2025-11-13 00:00:00.000000', 'Playful navy tee featuring cute cat walking graphic with premium soft-touch cotton and relaxed silhouette.', 32, 'Regular Fit', 'https://product.hstatic.net/200000306799/product/atf1003_3_dcbb689891ab4e35ad4f68dc40bb77fd_master.jpg', 'https://product.hstatic.net/200000306799/product/atf1003_2_9b0a2a85fe2948ae9bc11e0ce551bc69_master.jpg', 'Premium Cotton', 'Meow Walking Tee / Navy Peony', 490000, 0, 4.7, 'ACTIVE', 'piece', '2025-11-13 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (37, 'KH3T', 550000, '2025-11-12 00:00:00.000000', 'Statement black oversized tee with adorable teddy bear front print, made from ultra-soft heavyweight fabric.', 0, 'Oversized', 'https://product.hstatic.net/200000306799/product/3_288f58c38ed14058adfde4b8e127bd49_master.jpg', 'https://product.hstatic.net/200000306799/product/2_143b60605c0f4e8ca7b36ecd7867d3c9_master.jpg', 'Heavy Cotton', 'Teddy Bear Tee / Black Color', 550000, 145, 4.9, 'ACTIVE', 'piece', '2025-11-12 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (38, 'KH3T', 475600, '2025-11-11 00:00:00.000000', 'Clean white semi-oversized tee featuring delicate butterfly catalog artwork on back, perfect minimalist statement piece.', 18, 'Semi-Oversized', 'https://content.pancake.vn/1/s2360x2950/bd/20/65/80/20541c54038ca239c93367117b50e36ee96a4adea3e913a4760bfae0-w:3000-h:3750-l:575562-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/ff/9f/5f/c3/9b6838d40d92da9f19f392372d95e060d26065662fbf30849e3497be-w:3000-h:3750-l:808040-t:image/jpeg.jpeg', 'Premium Cotton', 'Butterfly Catalog Semi-Oversized Tee/ White', 580000, 98, 4.8, 'ACTIVE', 'piece', '2025-11-11 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (39, 'KH3T', 620000, '2025-12-10 00:00:00.000000', 'Official Dragon Ball Z collab cream tee featuring the iconic Dragon Team lineup print, crafted from soft premium cotton for ultimate comfort.', 0, 'Regular Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-82cae8ec-c80e-4521-acb1-b8969b6b8578.jpg?v=1728381393247', 'https://bizweb.dktcdn.net/100/369/010/products/1-f8b81647-8262-45ea-8fe1-157a58b14b52.jpg?v=1728381392290', 'Premium Cotton', 'DC | DBZ Dragon Team T-Shirt – Cream', 620000, 180, 4.9, 'ACTIVE', 'piece', '2025-12-10 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (40, 'KH3T', 435000, '2025-12-10 00:00:00.000000', 'One Piece limited black tee with Tony Tony Chopper in flight graphic, made from heavyweight cotton for a bold streetwear statement.', 25, 'Regular Fit', 'https://bizweb.dktcdn.net/100/369/010/products/dm-20230726160901-001-copy.jpg?v=1690373784267', 'https://bizweb.dktcdn.net/100/369/010/products/dm-20230726160855-001-copy.jpg?v=1690373784267', 'Heavy Cotton', 'OP Chopper Fly T-shirt - Black', 580000, 0, 4.8, 'ACTIVE', 'piece', '2025-12-10 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (41, 'KH3T', 467500, '2025-12-11 00:00:00.000000', 'Motivational red boxy tee with oversized “Hustling” script across chest, cut from ultra-soft cotton for relaxed everyday wear.', 15, 'Boxy Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-80286a2b-1904-480d-883a-02050c458480.jpg?v=1750677477823', 'https://bizweb.dktcdn.net/100/369/010/products/1-fd43c297-72f0-4023-bc4b-8e3276374c2a.jpg?v=1750677473007', 'Soft Cotton', 'Hustling Boxy T-Shirt Red', 550000, 165, 4.7, 'ACTIVE', 'piece', '2025-12-11 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (42, 'KH3T', 520000, '2025-12-11 00:00:00.000000', 'Clean white tee featuring minimalist “Cobruhh” embroidery on chest, crafted from premium ring-spun cotton for a luxury feel.', 0, 'Regular Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-9601a5a4-d84a-4a8c-9616-73270f3c2421.jpg?v=1733833128130', 'https://bizweb.dktcdn.net/100/369/010/products/1-3fa58a7c-2267-4d53-b438-fe74be07868a.jpg?v=1733833124683', 'Ring-Spun Cotton', 'Cobruhh T-Shirt White', 520000, 200, 4.6, 'ACTIVE', 'piece', '2025-12-11 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (43, 'KH3T', 574000, '2025-12-12 00:00:00.000000', 'Cute-yet-bold red striped baseball jersey from Hello Kitty collab, featuring varsity lettering and breathable mesh panels.', 30, 'Relaxed Fit', 'https://content.pancake.vn/1/s2360x2950/d1/b9/1a/33/8cc1a96183f1237a9a5f28438fd90485335b084134bc1b0b9951c61a-w:3000-h:3750-l:911340-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/27/b8/ea/c4/5589ed46b68cd62e58853bc3825302bcbd22d5406b360b0ec7c0086e-w:3000-h:3750-l:956728-t:image/jpeg.jpeg', 'Cotton Mesh', 'Hello Kitty | Striped Baseball Jersey/ Red', 820000, 95, 4.9, 'ACTIVE', 'piece', '2025-12-12 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (44, 'KH3T', 472000, '2025-12-12 00:00:00.000000', 'Timeless raglan tee in black & gray contrast sleeves with small Fearow embroidery, made from soft tri-blend fabric.', 20, 'Regular Fit', 'https://product.hstatic.net/200000306799/product/apf7006_2_4328c2b3a6e64fb9b1a0e6f0002e09cd_master.jpg', 'https://product.hstatic.net/200000306799/product/apf7006_1_6f0d8f73042a405ea12b01f965560d30_master.jpg', 'Tri-Blend', 'Raglan Fearow Basic 2023 / Black & Gray', 590000, 0, 4.7, 'ACTIVE', 'piece', '2025-12-12 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (45, 'KH3T', 610000, '2025-12-13 00:00:00.000000', 'Dark brown tee showcasing experimental multi-font typography artwork on front and back, cut from heavyweight cotton.', 0, 'Regular Fit', 'https://product.hstatic.net/200000306799/product/3__1__0e4f3840e6b14ed9b681e9c4fdb9596d_master.jpg', 'https://product.hstatic.net/200000306799/product/2__1__470bc0def4ca468c81abf6613a6b461d_master.jpg', 'Heavy Cotton', 'MULTIFONT TEE / DARK BROWN COLOR', 610000, 140, 4.6, 'ACTIVE', 'piece', '2025-12-13 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (46, 'KH3T', 524800, '2025-12-13 00:00:00.000000', 'Playful black semi-oversized tee covered in tonal polkadot pattern with subtle chest logo, perfect for effortless cool.', 18, 'Semi-Oversized', 'https://content.pancake.vn/1/s2360x2950/1e/61/3e/32/eab65a3797d1633c2dd1f5f36e764af674a5b737cc8f7264daecda5b-w:3000-h:3750-l:814402-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/a8/80/96/05/83a5b0a1862b5b25a07ef46ddb1d9a55e3ec6a70d8ad86a7e2ae8c77-w:3000-h:3750-l:957249-t:image/jpeg.jpeg', 'Premium Cotton', 'Seasonal Polkadot Semi-Oversized Tee/ Black', 640000, 155, 4.8, 'ACTIVE', 'piece', '2025-12-13 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (47, 'KH3T', 680000, '2025-12-14 00:00:00.000000', 'Inspirational oversized raglan tee with “Dream Maker” script and contrast sleeves, crafted from ultra-soft French terry.', 0, 'Oversized', 'https://content.pancake.vn/1/s2360x2950/55/83/17/41/87f4cdeed9be63e1e3d546eb18a0fa608af8fa57873da45b2dd9c216-w:3000-h:3750-l:748780-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/e2/b2/8e/c9/27a013ef89495266cf942e540f71db4c836b0bb6c942f596abbeaf01-w:3000-h:3750-l:713840-t:image/jpeg.jpeg', 'French Terry', 'Dream Maker Raglan Oversized Tee', 680000, 120, 4.7, 'ACTIVE', 'piece', '2025-12-14 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (48, 'KH3T', 561600, '2025-12-14 00:00:00.000000', 'Fiery green soccer jersey with flame-inspired graphics and lightweight performance mesh, built for style and movement.', 22, 'Athletic Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjFcaxFsEW6mQcMPWQGN92lHgkKlHUU01S_g&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn71GdGaExEnM8osHx8DqaZVeFgwlUMPhd3Q&s', 'Performance Mesh', 'Soccer Jersey Wild Fire Green', 720000, 110, 4.8, 'ACTIVE', 'piece', '2025-12-14 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (49, 'KH3T', 705600, '2025-12-15 00:00:00.000000', 'Premium black denim shirt with tonal “Y” chain-stitch embroidery on chest pocket, featuring raw-edge details and relaxed fit.', 28, 'Relaxed Fit', 'https://cdn.shopify.com/s/files/1/0066/0360/4086/files/53fb65eab3254388bb9eef3b88e38e93.jpg?v=1750317810', 'https://bizweb.dktcdn.net/100/369/010/products/1-a642d2e3-92bf-4a0e-9233-306da7157187.jpg?v=1750141568607', 'Denim Fabric', '"Y" Embroidered Denim Shirt Black', 980000, 85, 4.9, 'ACTIVE', 'piece', '2025-12-15 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (50, 'KH3T', 448500, '2025-12-15 00:00:00.000000', 'Signature black polo with delicate “Bình Tân” embroidery on chest, crafted from breathable cotton pique for elevated casual wear.', 35, 'Relaxed Fit', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy8Ij4FRD4SmUCtlFxq4dte3kDq2X5TuhX3w&s', 'https://bizweb.dktcdn.net/100/369/010/products/1-3d8fd54a-355a-4ead-8877-957986552312.jpg?v=1743575741267', 'Cotton Pique', 'Bình Tân Embroidered Polo Black', 690000, 0, 4.7, 'ACTIVE', 'piece', '2025-12-15 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (51, 'KH3T', 580000, '2025-12-16 00:00:00.000000', 'Bold forest-green tee featuring striking “Final Things” graphic on chest and back, crafted from soft heavyweight cotton for a premium streetwear feel.', 0, 'Regular Fit', 'https://content.pancake.vn/1/s2360x2950/2c/85/a4/6c/c765a69d4cb26539f26396dc05a38e5b5b2c7d7c44c82474b2bfc13d-w:3000-h:3750-l:828099-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/6a/7c/8f/d4/64ad8aa2b9a66506a77083c346dc7027b3ac182e715a48069388e42c-w:3000-h:3750-l:973701-t:image/jpeg.jpeg', 'Heavyweight Cotton', 'Final Things Tee / Green', 580000, 175, 4.8, 'ACTIVE', 'piece', '2025-12-16 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (52, 'KH3T', 446400, '2025-12-16 00:00:00.000000', 'Clean raglan-sleeve tee with subtle “Global” chest embroidery and contrast sleeves, made from ultra-soft tri-blend fabric for all-day comfort.', 28, 'Regular Fit', 'https://content.pancake.vn/1/s2360x2950/8c/9e/a0/fe/2e4902a9de89817a6c449aba3ad897c8b8f8c235556fc41bf87bddba-w:3000-h:3750-l:895685-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/9e/34/db/a1/4222458a0fa0c6a1c4af86ed8448e791a9a25108e5db74f47dde04de-w:3000-h:3750-l:914644-t:image/jpeg.jpeg', 'Tri-Blend', 'Global Raglan Tee', 620000, 0, 4.7, 'ACTIVE', 'piece', '2025-12-16 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (53, 'KH3T', 756500, '2025-12-17 00:00:00.000000', 'Luxurious knitted polo with semi-oversized silhouette, featuring ribbed collar and subtle tonal stitching for elevated casual style.', 15, 'Semi-Oversized', 'https://content.pancake.vn/1/s2360x2950/ea/fd/81/61/9e70c74121eff09cb59179814749c920329ed6d02e49aca8b73a84d3-w:3000-h:3750-l:877497-t:image/jpeg.jpeg', 'https://content.pancake.vn/1/s2360x2950/34/8d/ae/68/807e2f9d7582017814cf60bb0ee6f0dc8017640238b65ae4e0a69952-w:3000-h:3750-l:893680-t:image/jpeg.jpeg', 'Knitted Cotton', 'Authentic Knitted Semi-Oversized Polo', 890000, 110, 4.9, 'ACTIVE', 'piece', '2025-12-17 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (54, 'KH3T', 550000, '2025-12-17 00:00:00.000000', 'Fresh mint tee with clean “WorldWide” front print and minimal back hit, crafted from soft-touch premium cotton for everyday wear.', 0, 'Regular Fit', 'https://product.hstatic.net/200000306799/product/z3122227538949_335494c173f8aadf8384885e59ca1a24_854291a9f92448669d3162f190e79ac1_master.jpg', 'https://product.hstatic.net/200000306799/product/z3122227538922_3b2263800ea95cf6808ae5a4d91c527f_c92a5a812acd4eb88909fdd1788a04e3_master.jpg', 'Premium Cotton', 'WorldWide Tee / Mint Color', 550000, 190, 4.6, 'ACTIVE', 'piece', '2025-12-17 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (55, 'KH3T', 416000, '2025-12-18 00:00:00.000000', 'Playful sky-blue tee featuring colorful rainbow arch graphic and positive message on back, made from lightweight cotton for summer vibes.', 20, 'Regular Fit', 'https://product.hstatic.net/200000306799/product/32_de3198ed2cb94e3798d04731b447277b_master.jpg', 'https://product.hstatic.net/200000306799/product/1_ao_32ccedd5cf6c4eb8ae394a817879bfb9_master.jpg', 'Lightweight Cotton', 'Sweet Rainbow Tee - Sky Blue', 520000, 210, 4.8, 'ACTIVE', 'piece', '2025-12-18 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (56, 'KH3T', 507000, '2025-12-18 00:00:00.000000', 'Nostalgic pink Y2K-inspired football jersey with shiny satin finish, bold numbering, and retro piping details.', 35, 'Athletic Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-a8162f84-9450-423b-befd-b12553881baa.jpg?v=1734344873620', 'https://bizweb.dktcdn.net/100/369/010/products/1-d98b608f-6728-43e0-a169-b630c56e564e.jpg?v=1734344869630', 'Satin Polyester', 'Y2K Jersey Football Pink', 780000, 95, 4.9, 'ACTIVE', 'piece', '2025-12-18 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (57, 'KH3T', 413000, '2025-12-19 00:00:00.000000', 'Motivational white tee with powerful “If I Play I Play To Win” statement print, cut from premium heavyweight cotton for a strong presence.', 30, 'Regular Fit', 'https://bizweb.dktcdn.net/100/369/010/products/2-8aa8f14a-2fd4-4db5-8632-5a5de66e4dfc.jpg?v=1728447204977', 'https://bizweb.dktcdn.net/100/369/010/products/1-23f0ec1c-ae0e-4d9c-ac1f-571ea9cc7847.jpg?v=1728447201350', 'Heavyweight Cotton', 'If I Play I Play To Win T-Shirt - White', 590000, 0, 4.8, 'ACTIVE', 'piece', '2025-12-19 00:00:00.000000', 1),
                                                                                                                                                                                                                                                                    (58, 'KH3T', 510000, '2025-12-20 00:00:00.000000', 'Statement silver-tone chain necklace featuring smashed and distorted “Y” logo pendant, hand-finished for an industrial streetwear edge.', 25, NULL, 'https://bizweb.dktcdn.net/100/369/010/products/artboard-1-6abaf110-56bb-48e4-a7e3-4072afc86720.jpg?v=1761550804777', 'https://bizweb.dktcdn.net/100/369/010/products/1-ebd6f2a2-46d5-46a8-820a-fec706e3e6b0.jpg?v=1745649684140', 'Stainless Steel', '"Y" Logo Smashed Necklace Grey', 680000, 95, 4.8, 'ACTIVE', 'piece', '2025-12-20 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (59, 'KH3T', 504000, '2025-12-20 00:00:00.000000', 'Luxurious cream slides with debossed letter monogram pattern across the strap, crafted from premium cushioned EVA for all-day comfort.', 30, NULL, 'https://cdn.shopify.com/s/files/1/0066/0360/4086/files/79af9c949bb944d89f3b5f2d5c5374cd.jpg?v=1744688621', 'https://bizweb.dktcdn.net/100/369/010/products/1-f3564183-3cdd-4dda-be4a-24e8781d7c27.jpg?v=1744104148063', 'Premium EVA', 'Letter Monogram Arizona Slides Cream', 720000, 0, 4.7, 'ACTIVE', 'piece', '2025-12-20 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (60, 'KH3T', 850000, '2025-12-21 00:00:00.000000', 'Cozy oversized black wool scarf with tonal embroidered KH3T logo at both ends, perfect layering piece for winter street style.', 0, NULL, 'https://bizweb.dktcdn.net/100/369/010/products/2-06166429-e7a6-42e8-b07b-fbb7050c3e47.jpg?v=1753088434947', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD2-I6HYWWZHKn3sumj67kvIjXDci5LiOXkg&s', 'Merino Wool Blend', 'Logo Black Wool Knit Scarf', 850000, 110, 4.9, 'ACTIVE', 'piece', '2025-12-21 00:00:00.000000', 3),
                                                                                                                                                                                                                                                                    (61, 'KH3T', 501500, '2025-12-21 00:00:00.000000', 'Minimalist sand-colored slides featuring subtle embossed KH3T logo on wide strap, ultra-lightweight and waterproof for daily wear.', 15, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNvxcf7bFNEEpXbL-rQ-YKVWD_4B7luBuORQ&s', 'https://bizweb.dktcdn.net/100/369/010/products/1-6-compressed.jpg?v=1749629457473', 'EVA Foam', 'Embossed Slides - Sand', 590000, 180, 4.6, 'ACTIVE', 'piece', '2025-12-21 00:00:00.000000', 3);

-- Dumping structure for table hkt_shop.size
CREATE TABLE IF NOT EXISTS `size` (
                                      `id` int NOT NULL AUTO_INCREMENT,
                                      `name_size` enum('L','M','S','XL') NOT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.size: ~4 rows (approximately)
INSERT INTO `size` (`id`, `name_size`) VALUES
                                           (1, 'S'),
                                           (2, 'M'),
                                           (3, 'L'),
                                           (4, 'XL');

-- Dumping structure for table hkt_shop.size_detail
CREATE TABLE IF NOT EXISTS `size_detail` (
                                             `id` int NOT NULL AUTO_INCREMENT,
                                             `quantity` int DEFAULT NULL,
                                             `product_id` int DEFAULT NULL,
                                             `size_id` int DEFAULT NULL,
                                             PRIMARY KEY (`id`),
    KEY `FKj4wr4v97ritnl9y7jpnuipbbc` (`product_id`),
    KEY `FKgkloidvove2wgwb8d87wlsn9m` (`size_id`),
    CONSTRAINT `FKgkloidvove2wgwb8d87wlsn9m` FOREIGN KEY (`size_id`) REFERENCES `size` (`id`),
    CONSTRAINT `FKj4wr4v97ritnl9y7jpnuipbbc` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.size_detail: ~244 rows (approximately)
INSERT INTO `size_detail` (`id`, `quantity`, `product_id`, `size_id`) VALUES
                                                                          (1, 0, 1, 1),
                                                                          (2, 0, 1, 2),
                                                                          (3, 0, 1, 3),
                                                                          (4, 0, 1, 4),
                                                                          (5, 37, 2, 1),
                                                                          (6, 37, 2, 2),
                                                                          (7, 38, 2, 3),
                                                                          (8, 38, 2, 4),
                                                                          (9, 40, 3, 1),
                                                                          (10, 40, 3, 2),
                                                                          (11, 40, 3, 3),
                                                                          (12, 10, 3, 4),
                                                                          (13, 40, 4, 1),
                                                                          (14, 40, 4, 2),
                                                                          (15, 40, 4, 3),
                                                                          (16, 40, 4, 4),
                                                                          (17, 30, 5, 1),
                                                                          (18, 30, 5, 2),
                                                                          (19, 30, 5, 3),
                                                                          (20, 30, 5, 4),
                                                                          (21, 180, 6, 1),
                                                                          (22, 0, 6, 2),
                                                                          (23, 0, 6, 3),
                                                                          (24, 0, 6, 4),
                                                                          (25, 0, 7, 1),
                                                                          (26, 0, 7, 2),
                                                                          (27, 0, 7, 3),
                                                                          (28, 0, 7, 4),
                                                                          (29, 25, 8, 1),
                                                                          (30, 25, 8, 2),
                                                                          (31, 25, 8, 3),
                                                                          (32, 35, 8, 4),
                                                                          (33, 35, 9, 1),
                                                                          (34, 35, 9, 2),
                                                                          (35, 35, 9, 3),
                                                                          (36, 35, 9, 4),
                                                                          (37, 40, 10, 1),
                                                                          (38, 40, 10, 2),
                                                                          (39, 40, 10, 3),
                                                                          (40, 40, 10, 4),
                                                                          (41, 37, 11, 1),
                                                                          (42, 38, 11, 2),
                                                                          (43, 37, 11, 3),
                                                                          (44, 38, 11, 4),
                                                                          (45, 32, 12, 1),
                                                                          (46, 32, 12, 2),
                                                                          (47, 33, 12, 3),
                                                                          (48, 23, 12, 4),
                                                                          (49, 30, 13, 1),
                                                                          (50, 30, 13, 2),
                                                                          (51, 30, 13, 3),
                                                                          (52, 30, 13, 4),
                                                                          (53, 20, 14, 1),
                                                                          (54, 20, 14, 2),
                                                                          (55, 20, 14, 3),
                                                                          (56, 35, 14, 4),
                                                                          (57, 3, 15, 1),
                                                                          (58, 2, 15, 2),
                                                                          (59, 3, 15, 3),
                                                                          (60, 2, 15, 4),
                                                                          (61, 0, 16, 1),
                                                                          (62, 0, 16, 2),
                                                                          (63, 0, 16, 3),
                                                                          (64, 0, 16, 4),
                                                                          (65, 20, 17, 1),
                                                                          (66, 20, 17, 2),
                                                                          (67, 20, 17, 3),
                                                                          (68, 20, 17, 4),
                                                                          (69, 30, 18, 1),
                                                                          (70, 30, 18, 2),
                                                                          (71, 30, 18, 3),
                                                                          (72, 15, 18, 4),
                                                                          (73, 0, 19, 1),
                                                                          (74, 0, 19, 2),
                                                                          (75, 0, 19, 3),
                                                                          (76, 0, 19, 4),
                                                                          (77, 20, 20, 1),
                                                                          (78, 35, 20, 2),
                                                                          (79, 40, 20, 3),
                                                                          (80, 35, 20, 4),
                                                                          (81, 25, 21, 1),
                                                                          (82, 45, 21, 2),
                                                                          (83, 50, 21, 3),
                                                                          (84, 40, 21, 4),
                                                                          (85, 20, 22, 1),
                                                                          (86, 40, 22, 2),
                                                                          (87, 45, 22, 3),
                                                                          (88, 35, 22, 4),
                                                                          (89, 30, 23, 1),
                                                                          (90, 50, 23, 2),
                                                                          (91, 60, 23, 3),
                                                                          (92, 40, 23, 4),
                                                                          (93, 0, 24, 1),
                                                                          (94, 0, 24, 2),
                                                                          (95, 0, 24, 3),
                                                                          (96, 0, 24, 4),
                                                                          (97, 30, 25, 1),
                                                                          (98, 30, 25, 2),
                                                                          (99, 30, 25, 3),
                                                                          (100, 65, 25, 4),
                                                                          (101, 30, 26, 1),
                                                                          (102, 60, 26, 2),
                                                                          (103, 70, 26, 3),
                                                                          (104, 40, 26, 4),
                                                                          (105, 15, 27, 1),
                                                                          (106, 25, 27, 2),
                                                                          (107, 35, 27, 3),
                                                                          (108, 15, 27, 4),
                                                                          (109, 140, 28, 1),
                                                                          (110, 0, 28, 2),
                                                                          (111, 0, 28, 3),
                                                                          (112, 0, 28, 4),
                                                                          (113, 75, 29, 1),
                                                                          (114, 0, 29, 2),
                                                                          (115, 0, 29, 3),
                                                                          (116, 0, 29, 4),
                                                                          (117, 0, 30, 1),
                                                                          (118, 0, 30, 2),
                                                                          (119, 0, 30, 3),
                                                                          (120, 0, 30, 4),
                                                                          (121, 20, 31, 1),
                                                                          (122, 35, 31, 2),
                                                                          (123, 50, 31, 3),
                                                                          (124, 30, 31, 4),
                                                                          (125, 0, 32, 1),
                                                                          (126, 0, 32, 2),
                                                                          (127, 0, 32, 3),
                                                                          (128, 0, 32, 4),
                                                                          (129, 25, 33, 1),
                                                                          (130, 45, 33, 2),
                                                                          (131, 55, 33, 3),
                                                                          (132, 35, 33, 4),
                                                                          (133, 30, 34, 1),
                                                                          (134, 55, 34, 2),
                                                                          (135, 65, 34, 3),
                                                                          (136, 40, 34, 4),
                                                                          (137, 15, 35, 1),
                                                                          (138, 30, 35, 2),
                                                                          (139, 40, 35, 3),
                                                                          (140, 25, 35, 4),
                                                                          (141, 0, 36, 1),
                                                                          (142, 0, 36, 2),
                                                                          (143, 0, 36, 3),
                                                                          (144, 0, 36, 4),
                                                                          (145, 20, 37, 1),
                                                                          (146, 40, 37, 2),
                                                                          (147, 50, 37, 3),
                                                                          (148, 35, 37, 4),
                                                                          (149, 15, 38, 1),
                                                                          (150, 25, 38, 2),
                                                                          (151, 35, 38, 3),
                                                                          (152, 23, 38, 4),
                                                                          (153, 30, 39, 1),
                                                                          (154, 50, 39, 2),
                                                                          (155, 60, 39, 3),
                                                                          (156, 40, 39, 4),
                                                                          (157, 0, 40, 1),
                                                                          (158, 0, 40, 2),
                                                                          (159, 0, 40, 3),
                                                                          (160, 0, 40, 4),
                                                                          (161, 25, 41, 1),
                                                                          (162, 45, 41, 2),
                                                                          (163, 55, 41, 3),
                                                                          (164, 40, 41, 4),
                                                                          (165, 30, 42, 1),
                                                                          (166, 60, 42, 2),
                                                                          (167, 70, 42, 3),
                                                                          (168, 40, 42, 4),
                                                                          (169, 15, 43, 1),
                                                                          (170, 25, 43, 2),
                                                                          (171, 35, 43, 3),
                                                                          (172, 20, 43, 4),
                                                                          (173, 0, 44, 1),
                                                                          (174, 0, 44, 2),
                                                                          (175, 0, 44, 3),
                                                                          (176, 0, 44, 4),
                                                                          (177, 20, 45, 1),
                                                                          (178, 40, 45, 2),
                                                                          (179, 50, 45, 3),
                                                                          (180, 30, 45, 4),
                                                                          (181, 25, 46, 1),
                                                                          (182, 45, 46, 2),
                                                                          (183, 55, 46, 3),
                                                                          (184, 30, 46, 4),
                                                                          (185, 20, 47, 1),
                                                                          (186, 35, 47, 2),
                                                                          (187, 40, 47, 3),
                                                                          (188, 25, 47, 4),
                                                                          (189, 15, 48, 1),
                                                                          (190, 30, 48, 2),
                                                                          (191, 40, 48, 3),
                                                                          (192, 25, 48, 4),
                                                                          (193, 10, 49, 1),
                                                                          (194, 25, 49, 2),
                                                                          (195, 35, 49, 3),
                                                                          (196, 15, 49, 4),
                                                                          (197, 0, 50, 1),
                                                                          (198, 0, 50, 2),
                                                                          (199, 0, 50, 3),
                                                                          (200, 0, 50, 4),
                                                                          (201, 25, 51, 1),
                                                                          (202, 50, 51, 2),
                                                                          (203, 65, 51, 3),
                                                                          (204, 35, 51, 4),
                                                                          (205, 0, 52, 1),
                                                                          (206, 0, 52, 2),
                                                                          (207, 0, 52, 3),
                                                                          (208, 0, 52, 4),
                                                                          (209, 15, 53, 1),
                                                                          (210, 30, 53, 2),
                                                                          (211, 40, 53, 3),
                                                                          (212, 25, 53, 4),
                                                                          (213, 30, 54, 1),
                                                                          (214, 55, 54, 2),
                                                                          (215, 65, 54, 3),
                                                                          (216, 40, 54, 4),
                                                                          (217, 35, 55, 1),
                                                                          (218, 60, 55, 2),
                                                                          (219, 75, 55, 3),
                                                                          (220, 40, 55, 4),
                                                                          (221, 15, 56, 1),
                                                                          (222, 25, 56, 2),
                                                                          (223, 35, 56, 3),
                                                                          (224, 20, 56, 4),
                                                                          (225, 0, 57, 1),
                                                                          (226, 0, 57, 2),
                                                                          (227, 0, 57, 3),
                                                                          (228, 0, 57, 4),
                                                                          (229, 95, 58, 1),
                                                                          (230, 0, 58, 2),
                                                                          (231, 0, 58, 3),
                                                                          (232, 0, 58, 4),
                                                                          (233, 0, 59, 1),
                                                                          (234, 0, 59, 2),
                                                                          (235, 0, 59, 3),
                                                                          (236, 0, 59, 4),
                                                                          (237, 110, 60, 1),
                                                                          (238, 0, 60, 2),
                                                                          (239, 0, 60, 3),
                                                                          (240, 0, 60, 4),
                                                                          (241, 180, 61, 1),
                                                                          (242, 0, 61, 2),
                                                                          (243, 0, 61, 3),
                                                                          (244, 0, 61, 4);

-- Dumping structure for table hkt_shop.cart
CREATE TABLE IF NOT EXISTS `cart` (
                                      `cart_id` int NOT NULL AUTO_INCREMENT,
                                      `created_at` datetime(6) DEFAULT NULL,
    `total_amount` double DEFAULT NULL,
    `total_quantity` int DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `customer_login` int DEFAULT NULL,
    PRIMARY KEY (`cart_id`),
    KEY `FKojcfr8xxi1ow2rel59kx4akol` (`customer_login`),
    CONSTRAINT `FKojcfr8xxi1ow2rel59kx4akol` FOREIGN KEY (`customer_login`) REFERENCES `account` (`login_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.cart: ~9 rows (approximately)
INSERT INTO `cart` (`cart_id`, `created_at`, `total_amount`, `total_quantity`, `updated_at`, `customer_login`) VALUES
                                                                                                                   (1, '2025-06-05 10:15:22.000000', 2295000, 4, '2025-11-10 09:12:41.000000', 1),
                                                                                                                   (2, '2025-06-18 11:22:05.000000', 2289000, 3, '2025-11-10 10:05:33.000000', 2),
                                                                                                                   (3, '2025-07-03 09:11:47.000000', 3134800, 3, '2025-11-10 11:20:15.000000', 3),
                                                                                                                   (4, '2025-07-15 17:33:21.000000', 3088400, 4, '2025-11-10 12:44:02.000000', 4),
                                                                                                                   (5, '2025-08-01 15:27:13.000000', 2153800, 3, '2025-11-10 14:01:27.000000', 5),
                                                                                                                   (6, '2025-08-18 08:19:33.000000', 4246000, 5, '2025-11-10 15:33:19.000000', 6),
                                                                                                                   (7, '2025-09-10 14:22:45.000000', 1898800, 3, '2025-11-10 16:18:50.000000', 7),
                                                                                                                   (8, '2025-10-05 18:41:03.000000', 1614200, 2, '2025-11-10 17:55:12.000000', 8),
                                                                                                                   (9, '2026-05-06 00:00:00.000000', 0, 0, '2026-05-06 00:00:00.000000', 9);

-- Dumping structure for table hkt_shop.cart_detail
CREATE TABLE IF NOT EXISTS `cart_detail` (
                                             `cart_detail_id` int NOT NULL AUTO_INCREMENT,
                                             `create_at` date DEFAULT NULL,
                                             `is_selected` bit(1) DEFAULT NULL,
    `price_at_time` double DEFAULT NULL,
    `quantity` int DEFAULT NULL,
    `subtotal` double DEFAULT NULL,
    `update_at` date DEFAULT NULL,
    `cart_id` int DEFAULT NULL,
    `product_id` int DEFAULT NULL,
    `size_detail_id` int DEFAULT NULL,
    PRIMARY KEY (`cart_detail_id`),
    KEY `FKrg4yopd2252nwj8bfcgq5f4jp` (`cart_id`),
    KEY `FK37hai783jhfcqo6h0pkiqmc9s` (`product_id`),
    KEY `FKe8i59v8ch3log7u8vjcxyqr88` (`size_detail_id`),
    CONSTRAINT `FK37hai783jhfcqo6h0pkiqmc9s` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
    CONSTRAINT `FKe8i59v8ch3log7u8vjcxyqr88` FOREIGN KEY (`size_detail_id`) REFERENCES `size_detail` (`id`),
    CONSTRAINT `FKrg4yopd2252nwj8bfcgq5f4jp` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.cart_detail: ~17 rows (approximately)
INSERT INTO `cart_detail` (`cart_detail_id`, `create_at`, `is_selected`, `price_at_time`, `quantity`, `subtotal`, `update_at`, `cart_id`, `product_id`, `size_detail_id`) VALUES
                                                                                                                                                                              (1, '2025-06-05', b'1', 297500, 2, 595000, '2025-11-10', 1, 1, 1),
                                                                                                                                                                              (2, '2025-06-12', b'1', 850000, 2, 1700000, '2025-11-10', 1, 2, 6),
                                                                                                                                                                              (3, '2025-06-18', b'1', 623000, 1, 623000, '2025-11-10', 2, 4, 15),
                                                                                                                                                                              (4, '2025-06-20', b'1', 833000, 2, 1666000, '2025-11-10', 2, 18, 70),
                                                                                                                                                                              (5, '2025-07-03', b'1', 729800, 1, 729800, '2025-11-10', 3, 14, 55),
                                                                                                                                                                              (6, '2025-07-08', b'1', 508400, 2, 1016800, '2025-11-10', 3, 10, 37),
                                                                                                                                                                              (7, '2025-07-15', b'1', 694200, 2, 1388400, '2025-11-10', 4, 12, 45),
                                                                                                                                                                              (8, '2025-07-22', b'1', 850000, 2, 1700000, '2025-11-10', 4, 2, 7),
                                                                                                                                                                              (9, '2025-08-01', b'1', 694200, 1, 694200, '2025-11-10', 5, 12, 46),
                                                                                                                                                                              (10, '2025-08-05', b'1', 729800, 2, 1459600, '2025-11-10', 5, 14, 54),
                                                                                                                                                                              (11, '2025-08-18', b'1', 950000, 2, 1900000, '2025-11-10', 6, 17, 67),
                                                                                                                                                                              (12, '2025-08-25', b'1', 833000, 2, 1666000, '2025-11-10', 6, 18, 69),
                                                                                                                                                                              (13, '2025-09-02', b'1', 680000, 1, 680000, '2025-11-10', 6, 13, 50),
                                                                                                                                                                              (14, '2025-09-10', b'1', 350000, 1, 350000, '2025-11-10', 7, 6, 21),
                                                                                                                                                                              (15, '2025-09-20', b'1', 774400, 2, 1548800, '2025-11-10', 7, 8, 30),
                                                                                                                                                                              (16, '2025-10-05', b'1', 694200, 1, 694200, '2025-11-10', 8, 12, 47),
                                                                                                                                                                              (17, '2025-10-15', b'1', 920000, 1, 920000, '2025-11-10', 8, 7, 25);

-- Dumping structure for table hkt_shop.customer_trading
CREATE TABLE IF NOT EXISTS `customer_trading` (
                                                  `trading_id` int NOT NULL AUTO_INCREMENT,
                                                  `created_at` datetime(6) DEFAULT NULL,
    `receiver_address` varchar(255) NOT NULL,
    `receiver_email` varchar(255) DEFAULT NULL,
    `receiver_name` varchar(255) NOT NULL,
    `receiver_phone` varchar(255) NOT NULL,
    `total_amount` double DEFAULT NULL,
    `trading_date` datetime(6) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`trading_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.customer_trading: ~13 rows (approximately)
INSERT INTO `customer_trading` (`trading_id`, `created_at`, `receiver_address`, `receiver_email`, `receiver_name`, `receiver_phone`, `total_amount`, `trading_date`, `updated_at`) VALUES
                                                                                                                                                                                       (1, '2025-11-10 08:50:00.000000', '123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội', 'leesin@example.com', 'Leesin', '0911111111', 2295000, '2025-11-10 09:00:00.000000', '2025-11-10 08:50:00.000000'),
                                                                                                                                                                                       (2, '2025-11-10 09:50:00.000000', '45 Trần Duy Hưng, Cầu Giấy, Hà Nội', 'halland@example.com', 'Erling Halland', '0903333444', 2289000, '2025-11-10 10:00:00.000000', '2025-11-10 09:50:00.000000'),
                                                                                                                                                                                       (3, '2025-11-10 10:50:00.000000', '25 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', 'doku@example.com', 'Jeremy Doku', '0905555666', 3134800, '2025-11-10 11:00:00.000000', '2025-11-10 10:50:00.000000'),
                                                                                                                                                                                       (4, '2025-11-10 11:50:00.000000', '120 Lê Văn Sỹ, Quận 3, TP. Hồ Chí Minh', 'vinicious@example.com', 'Vinicius Junior', '0907777888', 3088400, '2025-11-10 12:00:00.000000', '2025-11-10 11:50:00.000000'),
                                                                                                                                                                                       (5, '2025-11-10 12:50:00.000000', '89 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 'donnarumma@example.com', 'Donnarumma', '0911111333', 2153800, '2025-11-10 13:00:00.000000', '2025-11-10 12:50:00.000000'),
                                                                                                                                                                                       (6, '2025-11-10 13:50:00.000000', '56 Nguyễn Trãi, Ninh Kiều, Cần Thơ', 'cr7@example.com', 'Cristiano Ronaldo', '0912222444', 4246000, '2025-11-10 14:00:00.000000', '2025-11-10 13:50:00.000000'),
                                                                                                                                                                                       (7, '2025-11-10 14:50:00.000000', '12 Lạch Tray, Ngô Quyền, Hải Phòng', 'foden@example.com', 'Phil Foden', '0913333555', 1898800, '2025-11-10 15:00:00.000000', '2025-11-10 14:50:00.000000'),
                                                                                                                                                                                       (8, '2025-11-10 15:50:00.000000', '77 Hùng Vương, Phường Phú Nhuận, Huế', 'aguero@example.com', 'Sergio Aguero', '0914444666', 1614200, '2025-11-10 16:00:00.000000', '2025-11-10 15:50:00.000000'),
                                                                                                                                                                                       (9, '2026-05-06 15:57:42.953000', '77 Hùng Vương, Phường Phú Nhuận, Thừa Thiên Huế', 'doku@example.com', 'Jeremy Doku', '0905555666', 430000, '2026-05-06 15:57:42.953000', NULL),
                                                                                                                                                                                       (10, '2026-05-06 16:02:31.084000', '77 Hùng Vương, Phường Phú Nhuận, Thừa Thiên Huế', 'doku@example.com', 'Jeremy Doku', '0905555666', 430000, '2026-05-06 16:02:31.084000', NULL),
                                                                                                                                                                                       (11, '2026-05-06 18:42:57.956000', '12 Lạch Tray, Ngô Quyền, Hải Phòng', 'doku@example.com', 'Jeremy Doku', '0905555666', 670000, '2026-05-06 18:42:57.956000', NULL),
                                                                                                                                                                                       (12, '2026-05-06 18:45:04.311000', '12 Lạch Tray, Ngô Quyền, Hải Phòng', 'doku@example.com', 'Jeremy Doku', '0905555666', 430000, '2026-05-06 18:45:04.311000', NULL),
                                                                                                                                                                                       (13, '2026-05-06 19:47:52.325000', '256, ấp An Khoa, xã Vĩnh Mỹ B, Bạc Liêu', 'doku@example.com', 'Jeremy Doku', '0905555666', 610000, '2026-05-06 19:47:52.325000', NULL);
-- Dumping structure for table hkt_shop.orders
CREATE TABLE IF NOT EXISTS `orders` (
                                        `order_id` int NOT NULL AUTO_INCREMENT,
                                        `note` varchar(255) DEFAULT NULL,
    `order_code` varchar(255) NOT NULL,
    `order_date` datetime(6) DEFAULT NULL,
    `payment_method` enum('BANK_TRANSFER','CASH') DEFAULT NULL,
    `status_ordering` enum('CANCELLED','CONFIRMED','PENDING') DEFAULT NULL,
    `account_id` int DEFAULT NULL,
    `customer_trading_id` int DEFAULT NULL,
    PRIMARY KEY (`order_id`),
    KEY `FKmr0lpo0xh7oxly5daj6hoswk0` (`customer_trading_id`),
    CONSTRAINT `FKmr0lpo0xh7oxly5daj6hoswk0` FOREIGN KEY (`customer_trading_id`) REFERENCES `customer_trading` (`trading_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.orders: ~13 rows (approximately)
INSERT INTO `orders` (`order_id`, `note`, `order_code`, `order_date`, `payment_method`, `status_ordering`, `account_id`, `customer_trading_id`) VALUES
                                                                                                                                                    (1, 'Giao giờ hành chính', 'ORD20251110001', '2025-11-10 09:00:00.000000', NULL, 'PENDING', 1, 1),
                                                                                                                                                    (2, 'Gọi trước khi giao', 'ORD20251110002', '2025-11-10 10:00:00.000000', NULL, 'PENDING', 2, 2),
                                                                                                                                                    (3, 'Giao buổi sáng', 'ORD20251110003', '2025-11-10 11:00:00.000000', NULL, 'PENDING', 3, 3),
                                                                                                                                                    (4, 'Không giao sau 20h', 'ORD20251110004', '2025-11-10 12:00:00.000000', NULL, 'PENDING', 4, 4),
                                                                                                                                                    (5, 'Liên hệ bảo vệ tòa nhà', 'ORD20251110005', '2025-11-10 13:00:00.000000', NULL, 'PENDING', 5, 5),
                                                                                                                                                    (6, 'Giao nhanh trong ngày', 'ORD20251110006', '2025-11-10 14:00:00.000000', NULL, 'PENDING', 6, 6),
                                                                                                                                                    (7, 'Để hàng trước cửa', 'ORD20251110007', '2025-11-10 15:00:00.000000', NULL, 'PENDING', 7, 7),
                                                                                                                                                    (8, 'Người nhận: Anh Long', 'ORD20251110008', '2025-11-10 16:00:00.000000', NULL, 'PENDING', 8, 8),
                                                                                                                                                    (9, 'Người nhận: Anh Minh', 'ORD20260506001', '2026-05-06 15:57:43.026000', 'BANK_TRANSFER', 'PENDING', 4, 9),
                                                                                                                                                    (10, 'Người nhận: Anh Minh', 'ORD20260506002', '2026-05-06 16:02:31.120000', 'BANK_TRANSFER', 'CONFIRMED', 4, 10),
                                                                                                                                                    (11, 'Để hàng trước cửa', 'ORD20260506003', '2026-05-06 18:42:58.038000', 'BANK_TRANSFER', 'PENDING', 4, 11),
                                                                                                                                                    (12, 'Để hàng trước cửa', 'ORD20260506004', '2026-05-06 18:45:04.341000', 'BANK_TRANSFER', 'CONFIRMED', 4, 12),
                                                                                                                                                    (13, 'Gần nhà thờ', 'ORD20260506005', '2026-05-06 19:47:52.353000', 'BANK_TRANSFER', 'CONFIRMED', 4, 13);

-- Dumping structure for table hkt_shop.order_detail
CREATE TABLE IF NOT EXISTS `order_detail` (
                                              `order_detail_id` int NOT NULL AUTO_INCREMENT,
                                              `created_at` datetime(6) DEFAULT NULL,
    `product_name` varchar(255) DEFAULT NULL,
    `quantity` int DEFAULT NULL,
    `total_price` double DEFAULT NULL,
    `unit_price` double DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `order_id` int DEFAULT NULL,
    `product_id` int DEFAULT NULL,
    PRIMARY KEY (`order_detail_id`),
    KEY `FKrws2q0si6oyd6il8gqe2aennc` (`order_id`),
    KEY `FKb8bg2bkty0oksa3wiq5mp5qnc` (`product_id`),
    CONSTRAINT `FKb8bg2bkty0oksa3wiq5mp5qnc` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
    CONSTRAINT `FKrws2q0si6oyd6il8gqe2aennc` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

ALTER TABLE order_detail ADD COLUMN size_detail_id INT;
ALTER TABLE order_detail ADD CONSTRAINT fk_order_detail_size_detail
    FOREIGN KEY (size_detail_id) REFERENCES size_detail(id);

-- Dumping data for table hkt_shop.order_detail: ~23 rows (approximately)
INSERT INTO `order_detail` (`order_detail_id`, `created_at`, `product_name`, `quantity`, `total_price`, `unit_price`, `updated_at`, `order_id`, `product_id` , `size_detail_id`) VALUES
                                                                                                                                                                  (1, '2025-06-10 09:15:33.000000', 'Triple Star Small Wallet', 2, 595000, 297500, '2025-06-10 09:15:33.000000', 1, 1, 1),
                                                                                                                                                                  (2, '2025-06-10 09:16:10.000000', 'Raw Denim Stitch Baggy Jeans', 2, 1700000, 850000, '2025-06-10 09:16:10.000000', 1, 2, 6),
                                                                                                                                                                  (3, '2025-06-22 10:08:44.000000', 'Hello Kitty | Monogram Laser Baggy Jeans/ Blue', 1, 623000, 623000, '2025-06-22 10:08:44.000000', 2, 4, 15),
                                                                                                                                                                  (4, '2025-06-22 10:09:12.000000', 'Big Pounch Cargo Pants - Black', 2, 1666000, 833000, '2025-06-22 10:09:12.000000', 2, 18, 70),
                                                                                                                                                                  (5, '2025-07-08 11:22:05.000000', 'Metal Label Wide Trouser Pants – Black', 1, 729800, 729800, '2025-07-08 11:22:05.000000', 3, 14, 55),
                                                                                                                                                                  (6, '2025-07-08 11:22:41.000000', 'Embroidery Logo Baggy Denim Shorts - Light Blue', 2, 1016800, 508400, '2025-07-08 11:22:41.000000', 3, 10, 37),
                                                                                                                                                                  (7, '2025-07-08 11:23:19.000000', 'Casual Baggy Cargo Pants Black Wash', 2, 1388400, 694200, '2025-07-08 11:23:19.000000', 3, 12, 48),
                                                                                                                                                                  (8, '2025-07-20 12:41:27.000000', 'Raw Denim Stitch Baggy Jeans', 2, 1700000, 850000, '2025-07-20 12:41:27.000000', 4, 2, 7),
                                                                                                                                                                  (9, '2025-07-20 12:42:03.000000', 'Casual Baggy Cargo Pants Black Wash', 2, 1388400, 694200, '2025-07-20 12:42:03.000000', 4, 12,45),
                                                                                                                                                                  (10, '2025-08-07 14:18:55.000000', 'Casual Baggy Cargo Pants Black Wash', 1, 694200, 694200, '2025-08-07 14:18:55.000000', 5, 12,46),
                                                                                                                                                                  (11, '2025-08-07 14:19:31.000000', 'Metal Label Wide Trouser Pants – Black', 2, 1459600, 729800, '2025-08-07 14:19:31.000000', 5, 14,54),
                                                                                                                                                                  (12, '2025-08-25 15:35:42.000000', 'Distressed Double Knee Denim Pants Brown', 2, 1900000, 950000, '2025-08-25 15:35:42.000000', 6, 17,67),
                                                                                                                                                                  (13, '2025-08-25 15:36:18.000000', 'Big Pounch Cargo Pants - Black', 2, 1666000, 833000, '2025-08-25 15:36:18.000000', 6, 18,69),
                                                                                                                                                                  (14, '2025-08-25 15:36:50.000000', 'Denim Shorts Frayed Logo - Blue Wash', 1, 680000, 680000, '2025-08-25 15:36:50.000000', 6, 13,50),
                                                                                                                                                                  (15, '2025-09-15 16:25:11.000000', 'Triple Star Classic Cap', 1, 350000, 350000, '2025-09-15 16:25:11.000000', 7, 6,21),
                                                                                                                                                                  (16, '2025-09-15 16:25:47.000000', 'Embroidery Relaxed Denim Pants', 2, 1548800, 774400, '2025-09-15 16:25:47.000000', 7, 8,30),
                                                                                                                                                                  (17, '2025-11-20 17:58:33.000000', 'Casual Baggy Cargo Pants Black Wash', 1, 694200, 694200, '2025-11-20 17:58:33.000000', 8, 12,47),
                                                                                                                                                                  (18, '2025-11-20 17:59:05.000000', 'Drawstring Camo Denim Cargo Pants', 1, 920000, 920000, '2025-11-20 17:59:05.000000', 8, 7,25),
                                                                                                                                                                  (19, '2026-05-06 15:57:43.110000', 'Triple Star Classic Cap', 1, 350000, 350000, '2026-05-06 15:57:43.110000', 9, 6,21),
                                                                                                                                                                  (20, '2026-05-06 16:02:31.169000', 'Triple Star Classic Cap', 1, 350000, 350000, '2026-05-06 16:02:31.169000', 10, 6,21),
                                                                                                                                                                  (21, '2026-05-06 18:42:58.081000', 'Raw Denim Stitch Jorts', 1, 640000, 640000, '2026-05-06 18:42:58.081000', 11, 5,18),
                                                                                                                                                                  (22, '2026-05-06 18:45:04.371000', 'Triple Star Classic Cap', 1, 350000, 350000, '2026-05-06 18:45:04.371000', 12, 6,21),
                                                                                                                                                                  (23, '2026-05-06 19:47:52.379000', 'Polo Cross / Light Grey Green', 1, 580000, 580000, '2026-05-06 19:47:52.379000', 13, 23,90);

-- Dumping structure for table hkt_shop.invoice
CREATE TABLE IF NOT EXISTS `invoice` (
                                         `invoice_id` int NOT NULL AUTO_INCREMENT,
                                         `created_at` datetime(6) DEFAULT NULL,
    `invoice_code` varchar(255) NOT NULL,
    `payment_method` enum('BANK_TRANSFER','CASH') DEFAULT NULL,
    `payment_status` enum('PAID','PARTIAL','REFUND','UNPAID') DEFAULT NULL,
    `subtotal_amount` double DEFAULT NULL,
    `tax_amount` double DEFAULT NULL,
    `total_amount` double DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `order_id` int DEFAULT NULL,
    PRIMARY KEY (`invoice_id`),
    KEY `FKthf5w8xuexpjinfl7xheakhqn` (`order_id`),
    CONSTRAINT `FKthf5w8xuexpjinfl7xheakhqn` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.invoice: ~5 rows (approximately)
INSERT INTO `invoice` (`invoice_id`, `created_at`, `invoice_code`, `payment_method`, `payment_status`, `subtotal_amount`, `tax_amount`, `total_amount`, `updated_at`, `order_id`) VALUES
                                                                                                                                                                                      (2, '2026-05-06 15:57:43.176159', 'INV-20260506-001', 'BANK_TRANSFER', 'UNPAID', 430000, 0, 430000, '2026-05-06 15:57:43.176159', 9),
                                                                                                                                                                                      (3, '2026-05-06 16:02:31.193924', 'INV-20260506-002', 'BANK_TRANSFER', 'PAID', 430000, 0, 430000, '2026-05-06 16:02:31.193924', 10),
                                                                                                                                                                                      (4, '2026-05-06 18:42:58.146199', 'INV-20260506-003', 'BANK_TRANSFER', 'UNPAID', 670000, 0, 670000, '2026-05-06 18:42:58.146199', 11),
                                                                                                                                                                                      (5, '2026-05-06 18:45:04.394704', 'INV-20260506-004', 'BANK_TRANSFER', 'PAID', 430000, 0, 430000, '2026-05-06 18:45:04.394704', 12),
                                                                                                                                                                                      (6, '2026-05-06 19:47:52.402823', 'INV-20260506-005', 'BANK_TRANSFER', 'PAID', 610000, 0, 610000, '2026-05-06 19:47:52.402823', 13);
-- Dumping structure for table hkt_shop.wishlist
CREATE TABLE IF NOT EXISTS `wishlist` (
                                          `wishlist_id` int NOT NULL AUTO_INCREMENT,
                                          `created_at` datetime(6) DEFAULT NULL,
    `description` varchar(255) DEFAULT NULL,
    `name` varchar(255) DEFAULT NULL,
    `updated_at` datetime(6) DEFAULT NULL,
    `customer_login` int DEFAULT NULL,
    PRIMARY KEY (`wishlist_id`),
    KEY `FKb68dvqk0wvbmqw9whs8rxlnp7` (`customer_login`),
    CONSTRAINT `FKb68dvqk0wvbmqw9whs8rxlnp7` FOREIGN KEY (`customer_login`) REFERENCES `account` (`login_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.wishlist: ~0 rows (approximately)

-- Dumping structure for table hkt_shop.wishlist_detail
CREATE TABLE IF NOT EXISTS `wishlist_detail` (
                                                 `wishlist_detail_id` int NOT NULL AUTO_INCREMENT,
                                                 `created_at` datetime(6) DEFAULT NULL,
    `note` varchar(255) DEFAULT NULL,
    `product_id` int DEFAULT NULL,
    `wishlist_id` int DEFAULT NULL,
    PRIMARY KEY (`wishlist_detail_id`),
    KEY `FKdj8isveqc5asjv4a3apoaf595` (`product_id`),
    KEY `FKsmp667kun4ko3q0jb68jlhupx` (`wishlist_id`),
    CONSTRAINT `FKdj8isveqc5asjv4a3apoaf595` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
    CONSTRAINT `FKsmp667kun4ko3q0jb68jlhupx` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist` (`wishlist_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_vietnamese_ci;

-- Dumping data for table hkt_shop.wishlist_detail: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
