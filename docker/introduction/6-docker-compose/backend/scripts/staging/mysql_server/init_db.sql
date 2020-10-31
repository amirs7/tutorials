DROP USER 'notesuser'@'%';
CREATE USER 'notesuser'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'notesuser'@'%' IDENTIFIED BY '1234';
DROP DATABASE notes;
CREATE DATABASE notes;
GRANT ALL PRIVILEGES ON notes.* TO 'notesuser'@'localhost';
GRANT ALL PRIVILEGES ON notes.* TO 'notesuser'@'%';
