# Main application for Rogers/Infinity Voice Module

if __name__ == '__main__':
    from voice_module import VoiceAssistant
    from think import Think
    assistant = VoiceAssistant()
    thinker = Think()
    while True:
        command = assistant.listen()  # Using the listen method
        if command:
            response = thinker.process_command(command)
            assistant.speak(response)
        if command.lower() == 'bye':
            break