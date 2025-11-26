export default function InventoryCard({ title, value, color }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-xl`}
    >
      <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>

      <p
        className={`text-3xl font-bold bg-gradient-to-r ${color} text-transparent bg-clip-text mt-1`}
      >
        {value}
      </p>
    </div>
  );
}