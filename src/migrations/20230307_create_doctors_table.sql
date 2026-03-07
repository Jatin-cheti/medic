CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    consultation_rate DECIMAL(10, 2) NOT NULL,
    approved BOOLEAN DEFAULT FALSE
);
