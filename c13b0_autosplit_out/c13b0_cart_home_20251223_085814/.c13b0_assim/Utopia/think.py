class Think:
    def process_command(self, command):
        responses = {
            'hello': 'Hi! How can I help you today?',
            'bye': 'Goodbye! Have a great day!'
        }
        return responses.get(command.lower(), 'I am not sure how to respond to that.')