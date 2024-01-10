# server.py

import socket
import json

def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', 5000))
    server.listen(1)

    print('Server listening on port 5000...')

    while True:
        connection, address = server.accept()
        handle_connection(connection)

def handle_connection(connection):
    print('Connected by', connection.getpeername())

    try:
        while True:
            data = connection.recv(1024)
            if not data:
                break

            result = process_data(data)

            connection.sendall(result.encode('utf-8'))
    finally:
        connection.close()

def process_data(data):
    decoded_data = data.decode('utf-8')

    # Validate the document and return the result
    validation_result = validate_document(decoded_data)
    return validation_result

def validate_document(document_content):
    try:
        # Replace this with your actual validation logic
        # For now, just check if the document content is valid JSON
        json.loads(document_content)
        return "Document is valid."
    except json.JSONDecodeError as e:
        return f"Invalid JSON: {str(e)}"

if __name__ == '__main__':
    start_server()
