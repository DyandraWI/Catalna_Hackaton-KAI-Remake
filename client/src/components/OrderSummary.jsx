import React from "react";
import { Car } from "lucide-react";

export default function OrderSummary({
  origin,
  destination,
  date,
  passenger,
  className,
  seat,
  pricePerSeat,
  transportAddon, // NEW
  onVoucherChange,
  voucher,
  subtotal,
  discount,
  total,
  paymentMethod,
  setPaymentMethod,
  onPay,
}) {
  const userProfile = JSON.parse(
    localStorage.getItem("user_profile") || 
    '{"name":"Guest User","email":"","phone":""}'
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        Ringkasan & Pembayaran
      </div>

      {/* Passenger Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-gray-600 mb-1">Nama Penumpang</p>
        <p className="text-lg font-bold text-gray-800">{userProfile.name}</p>
        {userProfile.email && (
          <p className="text-sm text-gray-600 mt-1">{userProfile.email}</p>
        )}
      </div>

      {/* Ticket Info */}
      <div className="border rounded-lg p-4 space-y-3">
        <div>
          <div className="text-xs text-gray-500">Rute</div>
          <div className="font-medium">{origin} → {destination}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Tanggal</div>
          <div>{date || "-"}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Penumpang</div>
          <div>{passenger} orang</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Kelas & Kursi</div>
          <div className="capitalize">
            {className} — {Array.isArray(seat) ? seat.map(s => s.label).join(", ") : "-"}
          </div>
        </div>

        {/* Transportation Add-on */}
        {transportAddon && transportAddon.id !== "none" && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Car size={16} className="text-green-600" />
              <div className="text-xs text-gray-500">Transportasi Lanjutan</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-semibold text-gray-800">{transportAddon.name}</p>
              <p className="text-xs text-gray-600">{transportAddon.provider}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">
                + Rp {transportAddon.price.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Voucher */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            value={voucher}
            onChange={(e) => onVoucherChange(e.target.value)}
            placeholder="Kode voucher (mis: KAI20)"
            className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {discount > 0 && (
          <p className="text-sm text-green-600 font-semibold">
            ✓ Voucher berhasil! Hemat Rp {discount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Price Summary */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <div>Tiket Kereta ({passenger}x)</div>
          <div>Rp {(pricePerSeat * passenger).toLocaleString()}</div>
        </div>

        {transportAddon && transportAddon.price > 0 && (
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <div>Transportasi Lanjutan</div>
            <div>Rp {transportAddon.price.toLocaleString()}</div>
          </div>
        )}

        <div className="flex justify-between font-medium mb-2">
          <div>Subtotal</div>
          <div>Rp {subtotal.toLocaleString()}</div>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <div>Diskon</div>
            <div>- Rp {discount.toLocaleString()}</div>
          </div>
        )}

        <div className="flex justify-between font-bold text-xl mt-3 pt-3 border-t">
          <div>Total</div>
          <div className="text-blue-600">Rp {total.toLocaleString()}</div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-3">Pilih Metode Pembayaran</div>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              paymentMethod === "bank"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <input
              className="hidden"
              type="radio"
              name="pay"
              checked={paymentMethod === "bank"}
              onChange={() => setPaymentMethod("bank")}
            />
            <div className="font-medium">Transfer Bank / VA</div>
            <div className="text-xs text-gray-500 mt-1">Transfer / Virtual Account</div>
          </label>

          <label
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              paymentMethod === "ewallet"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <input
              className="hidden"
              type="radio"
              name="pay"
              checked={paymentMethod === "ewallet"}
              onChange={() => setPaymentMethod("ewallet")}
            />
            <div className="font-medium">E-Wallet</div>
            <div className="text-xs text-gray-500 mt-1">OVO / GoPay / Dana</div>
          </label>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={onPay}
        className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg hover:bg-orange-600 transition font-bold text-lg"
      >
        Bayar Sekarang - Rp {total.toLocaleString()}
      </button>
    </div>
  );
}
