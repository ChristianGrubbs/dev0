import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Plus } from "lucide-react"

// Placeholder function for AI processing and TeamDynamix API submission
const processWithAI = async (text: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  // Simulating AI processing and TeamDynamix API call
  const ticketId = "TDX-" + Math.floor(1000 + Math.random() * 9000)
  const aiProcessedText = `Task: ${text.split(' ').slice(0, 5).join(' ')}...\nLocation: Office\nPriority: Medium`
  return { success: true, ticketId, processedText: aiProcessedText }
}

interface Ticket {
  id: string;
  user: string;
  title: string;
  description: string;
  time: string;
}

// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Define the SpeechRecognitionEvent interface
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

// Define the SpeechRecognitionResultList interface
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

// Define the SpeechRecognitionResult interface
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

// Define the SpeechRecognitionAlternative interface
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Define the SpeechRecognitionErrorEvent interface
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export default function TeamDynamixTicketWidget() {
  const [isListening, setIsListening] = useState(false)
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([
    { id: 'TDX-1234', user: 'You', title: 'Replaced toner in printer', description: 'Task: Replaced toner in printer\nLocation: 2nd Floor\nPriority: Low', time: '1:40 PM' },
    { id: 'TDX-5678', user: 'You', title: 'Updated software on workstations', description: 'Task: Updated software on workstations\nLocation: IT Lab\nPriority: Medium', time: '11:25 AM' },
    { id: 'TDX-9012', user: 'You', title: 'Resolved network connectivity issue', description: 'Task: Resolved network connectivity issue\nLocation: Marketing Dept\nPriority: High', time: '9:15 AM' },
  ])

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition as new () => SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map(result => result.transcript)
          .join('')
        setText(transcript)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.start()
      }
      setIsListening(!isListening)
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    try {
      const result = await processWithAI(text)
      if (result.success) {
        setRecentTickets(prev => [{
          id: result.ticketId,
          user: 'You',
          title: text.slice(0, 30) + '...',
          description: result.processedText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev.slice(0, 2)])
        setText("")
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col space-y-4 p-6 bg-white bg-opacity-40 backdrop-blur-xl rounded-3xl shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">TeamDynamix Ticket Widget</h2>
        <button className="text-blue-500 flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          <span>New Ticket</span>
        </button>
      </div>
      
      <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Most Recent Tickets</h3>
        <div className="space-y-4">
          {recentTickets.map(ticket => (
            <div key={ticket.id} className="border-b border-gray-200 pb-2">
              <div className="flex justify-between items-center">
                <span className="text-blue-500 font-medium">{ticket.user}</span>
                <span className="text-gray-500 text-sm">{ticket.time}</span>
              </div>
              <h4 className="font-medium text-gray-800">{ticket.title}</h4>
              <p className="text-gray-600 text-sm whitespace-pre-line">{ticket.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Create TeamDynamix Ticket</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your completed task (or use voice input)..."
          className="w-full h-32 p-3 border border-gray-200 rounded-xl mb-4 resize-none bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between">
          <button
            onClick={toggleListening}
            className={`rounded-full p-3 ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            <Mic className="h-6 w-6" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || text.trim() === ""}
            className="rounded-full p-3 bg-green-500 text-white transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit ticket"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}