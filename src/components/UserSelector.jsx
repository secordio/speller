export default function UserSelector({ users, onSelect }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Who&apos;s spelling today?</h1>
      {users.map((u) => (
        <button
          key={u.id}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow"
          onClick={() => onSelect(u.id)}
        >
          {u.name}
        </button>
      ))}
    </div>
  );
} 