CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctorId INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    status ENUM('pending', 'read') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctorId) REFERENCES doctors(id)
);
