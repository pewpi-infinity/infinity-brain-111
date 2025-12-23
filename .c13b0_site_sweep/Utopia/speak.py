from listen import VoiceAssistant
from think import Think

assistant = VoiceAssistant()
thinker = Think()

while True:
    command = assistant.listen()
    if command:
        response = thinker.process_command(command)
        assistant.speak(response)
    if command and command.lower() == 'bye':
        break