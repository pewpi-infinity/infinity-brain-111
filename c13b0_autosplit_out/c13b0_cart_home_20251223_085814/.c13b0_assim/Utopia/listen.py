import speech_recognition as sr
import pyttsx3

class VoiceAssistant:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()

    def listen(self):
        with sr.Microphone() as source:
            print('Listening...')
            audio = self.recognizer.listen(source)
            try:
                command = self.recognizer.recognize_google(audio)
                print(f'You said: {command}')
                return command
            except sr.UnknownValueError:
                print('Sorry, I did not understand the audio.')
                return None
            except sr.RequestError as e:
                print(f'Could not request results; {e}')
                return None

    def speak(self, text):
        self.engine.say(text)
        self.engine.runAndWait()