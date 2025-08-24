USE privy;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(255) UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    salt VARBINARY(255) NOT NULL,
    hashed_password VARBINARY(255) NOT NULL,
    active SMALLINT NOT NULL DEFAULT 1,
    hide SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (public_key(255))
);

CREATE TABLE Conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT,
    participant_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES Users(user_id),
    FOREIGN KEY (participant_id) REFERENCES Users(user_id),
    UNIQUE (creator_id, participant_id)
);

CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    sender_id INT,
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
);

CREATE TABLE Files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    uploader_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id),
    FOREIGN KEY (uploader_id) REFERENCES Users(user_id)
);

CREATE TABLE FileChunks (
    chunk_id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT,
    chunk_data VARBINARY(255) NOT NULL,
    chunk_index INT NOT NULL,
    chunk_size INT NOT NULL,
    FOREIGN KEY (file_id) REFERENCES Files(file_id)
);

CREATE TABLE Invitations (
    invitation_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT,
    participant_id INT,
    status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    payload VARBINARY(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES Users(user_id),
    FOREIGN KEY (participant_id) REFERENCES Users(user_id),
    UNIQUE (creator_id, participant_id)
);