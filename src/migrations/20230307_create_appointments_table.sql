CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    doctorId INT NOT NULL,
    date DATETIME NOT NULL,
    type ENUM('video', 'audio', 'physical') NOT NULL,
    status ENUM('completed', 'pending') NOT NULL,
    bill DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (patientId) REFERENCES users(id),
    FOREIGN KEY (doctorId) REFERENCES users(id)
);
