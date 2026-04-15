import React, {useState} from 'react';
import {Bot, HeartPulse, Loader2, Send, Sparkles, UserRound} from 'lucide-react';
import {askOllama, buildHealthAssistantMessages, type OllamaChatMessage} from '../services/ollamaService';

type ChatEntry = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const starters = [
  'What should I monitor for high blood sugar today?',
  'Explain blood pressure in simple words.',
  'How can I improve sleep and reduce stress?',
  'What questions should I ask my doctor during a follow-up?',
];

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatEntry[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'Hello, I am your HealthPulse AI assistant powered by your local Ollama model. Ask me any health, app, monitoring, appointment, or wellness question.',
    },
  ]);

  const submitPrompt = async (messageText: string) => {
    const clean = messageText.trim();
    if (!clean) return;

    const nextUserMessage: ChatEntry = {
      id: crypto.randomUUID(),
      role: 'user',
      content: clean,
    };

    const conversation = [...history, nextUserMessage];
    setHistory(conversation);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const priorMessages: OllamaChatMessage[] = history.map((entry) => ({
        role: entry.role,
        content: entry.content,
      }));

      const reply = await askOllama(buildHealthAssistantMessages(priorMessages, clean));

      setHistory((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (requestError) {
      console.error('Ollama assistant failed:', requestError);
      setError(
        'HealthPulse could not reach Ollama. Please make sure the Ollama app is running in the background and the local model is available.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="future-hero rounded-[2rem] p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="ai-assistant-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] shadow-sm">
              Local AI assistant
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Ask HealthPulse AI anything</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50/78">
              This assistant is connected directly to your local Ollama model, so users can ask general questions,
              health questions, monitoring questions, and app questions without opening Ollama separately.
            </p>
          </div>

          <div className="future-panel-soft rounded-[1.75rem] p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-500">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">Connected model</p>
                <h2 className="mt-1 text-xl font-bold text-white">Ollama `gemma3:1b`</h2>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-cyan-50/75">
              <li>Answers are generated locally from the installed Ollama model.</li>
              <li>The Ollama app stays in the background and does not need to open as a separate window.</li>
              <li>This assistant can help with wellness, symptoms, daily metrics, and follow-up questions.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <div className="future-panel rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="text-cyan-500" size={20} />
              <h2 className="text-3xl font-bold tracking-tight text-cyan-50">Quick prompts</h2>
            </div>
            <div className="mt-5 space-y-3">
              {starters.map((starter) => (
                <button
                  key={starter}
                  onClick={() => submitPrompt(starter)}
                  disabled={loading}
                  className="ai-prompt-card block w-full rounded-[1.4rem] px-5 py-4 text-left text-xl font-semibold leading-8 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          <div className="future-panel-soft rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <HeartPulse className="text-rose-500" size={20} />
              <h2 className="text-xl font-bold text-white">Assistant scope</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-cyan-50/75">
              <li>General health and wellness guidance</li>
              <li>Daily monitoring explanation</li>
              <li>Blood sugar, blood pressure, sleep, hydration, and stress education</li>
              <li>Doctor visit preparation and follow-up questions</li>
              <li>App usage guidance inside HealthPulse</li>
            </ul>
          </div>
        </div>

        <div className="future-panel rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-cyan-300/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-cyan-50">AI conversation</h2>
              <p className="mt-1 text-sm text-cyan-50/65">Chat directly with your local Ollama-powered assistant.</p>
            </div>
            {loading && (
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-700">
                <Loader2 size={16} className="animate-spin" />
                Thinking
              </div>
            )}
          </div>

          <div className="mt-6 flex min-h-[520px] flex-col">
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-sm ${
                      entry.role === 'user'
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                        : 'future-panel-soft text-cyan-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                      {entry.role === 'user' ? <UserRound size={14} /> : <Bot size={14} />}
                      {entry.role === 'user' ? 'You' : 'HealthPulse AI'}
                    </div>
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await submitPrompt(prompt);
              }}
              className="mt-6"
            >
              <div className="future-panel-soft flex items-end gap-3 rounded-[1.75rem] p-3">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask a health question, app question, or anything you want the AI to explain..."
                  rows={3}
                  className="w-full resize-none bg-transparent px-2 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-50/35"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="future-button inline-flex h-12 w-12 items-center justify-center rounded-2xl disabled:opacity-50"
                  aria-label="Send message"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
