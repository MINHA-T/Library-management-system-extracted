-- =====================================================
-- Library Management System - Database Schema
-- =====================================================

-- ---------------------------------------------------
-- Table: users
-- Stores login accounts and library members
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100)  NOT NULL,
    username    VARCHAR(50)   NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- hashed with password_hash()
    email       VARCHAR(100)  DEFAULT NULL,
    role        ENUM('admin', 'librarian', 'member') NOT NULL DEFAULT 'member',
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Table: books
-- Stores the library's book catalog
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
    book_id         INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    author          VARCHAR(100) NOT NULL,
    isbn            VARCHAR(20)  NOT NULL UNIQUE,
    category        VARCHAR(50)  DEFAULT 'General',
    total_copies    INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Table: transactions
-- Tracks borrow / return activity
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id  INT AUTO_INCREMENT PRIMARY KEY,
    book_id         INT NOT NULL,
    user_id         INT NOT NULL,
    borrow_date     DATE NOT NULL,
    due_date        DATE DEFAULT NULL,
    return_date     DATE DEFAULT NULL,
    status          ENUM('borrowed', 'returned') NOT NULL DEFAULT 'borrowed',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_book
        FOREIGN KEY (book_id) REFERENCES books(book_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- Sample Data
-- =====================================================

-- Default login: username = admin, password = admin123
-- (hash below corresponds to "admin123")
-- All three sample accounts use the password: admin123
INSERT INTO users (full_name, username, password, email, role) VALUES
('Admin', 'Admin', 'admin123', 'admin@library.com', 'admin'),
('Muaadh', 'Muaadh', 'muaadh123', 'muaadh@library.com', 'librarian'),
('Mifra', 'Mifra', 'mifra123', 'mifra@library.com', 'member'),
('Minha', 'Minha', 'minha123', 'minha@library.com', 'member');

INSERT INTO books (title, author, isbn, category, total_copies, available_copies) VALUES
('The Alchemist', 'Paulo Coelho', '9780061122415', 'Fiction', 5, 3),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 4, 2),
('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 3, 3),
('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Technology', 6, 4),
('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 5, 5),
('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Technology', 3, 1),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 4, 4),
('Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'Technology', 4, 3);

INSERT INTO transactions (book_id, user_id, borrow_date, due_date, return_date, status) VALUES
(1, 3, '2026-06-10', '2026-06-24', NULL, 'borrowed'),
(2, 3, '2026-06-05', '2026-06-19', '2026-06-15', 'returned'),
(6, 2, '2026-06-20', '2026-07-04', NULL, 'borrowed'),
(1, 2, '2026-06-01', '2026-06-15', '2026-06-14', 'returned'),
(4, 3, '2026-06-25', '2026-07-09', NULL, 'borrowed');
