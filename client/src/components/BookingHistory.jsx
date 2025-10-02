export default function BookingHistory() {
  const history = [
    { id: 1, route: "Cimahi → Jakarta Gambir", date: "2025-09-20" },
    { id: 2, route: "Bandung → Surabaya", date: "2025-08-15" },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Riwayat Pemesanan</h2>
      <ul className="space-y-2">
        {history.map((item) => (
          <li
            key={item.id}
            className="flex justify-between bg-gray-50 p-3 rounded-md"
          >
            <span>{item.route}</span>
            <span className="text-sm text-gray-500">{item.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
