'use client';

interface NotesInputProps {
  value: string;
  onChange: (notes: string) => void;
  placeholder?: string;
}

export function NotesInput({ value, onChange, placeholder = 'Add a note (optional)' }: NotesInputProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
      />
    </div>
  );
}
