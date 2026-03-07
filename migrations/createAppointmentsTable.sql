CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(255) NOT NULL,
  appointment_date DATETIME NOT NULL,
  appointment_type ENUM('video', 'audio', 'physical') NOT NULL,
  status ENUM('upcoming', 'completed', 'canceled') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
