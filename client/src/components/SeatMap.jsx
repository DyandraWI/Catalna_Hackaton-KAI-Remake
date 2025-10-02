export default function SeatMap({ seats, selectedSeats, onToggle }) {
  const rows = Math.max(...seats.map((s) => s.row)) + 1;
  const grid = Array.from({ length: rows }, (_, r) =>
    seats.filter((s) => s.row === r).sort((a, b) => a.col - b.col)
  );

  return (
    <div className="space-y-2">
      {grid.map((row, idx) => (
        <div key={idx} className="flex gap-2 justify-center">
          {row.map((seat) => {
            const isSelected = selectedSeats.find((s) => s.id === seat.id);
            const base = seat.occupied
              ? "bg-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-blue-500 text-white"
              : "bg-green-500";
            return (
              <button
                key={seat.id}
                disabled={seat.occupied}
                onClick={() => onToggle(seat)}
                className={`w-10 h-10 rounded-md flex items-center justify-center text-xs ${base}`}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
