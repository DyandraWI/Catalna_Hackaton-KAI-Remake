import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, CreditCard, Save, Camera, Image as ImageIcon } from "lucide-react";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "Andra Kurniawan",
    email: "andra@example.com",
    phone: "08123456789",
    nik: "3273XXXXXXXXXXXX",
    gender: "male",
    profilePhoto: null, // 🔹 foto profil baru
    ktpPhoto: null,
    facePhoto: null,
  });

  const [faceVerified, setFaceVerified] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captureMode, setCaptureMode] = useState(null);

  // Load profile dari localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ubah foto profil lewat upload
  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async (mode) => {
    try {
      setCaptureMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Gagal mengakses kamera 😢 Pastikan kamera diizinkan.");
    }
  };

  // Dummy API Face Recognition
  const verifyFace = async (imageBase64) => {
    try {
      // simulasi response API
      const result = { match: true };

      if (result.match) {
        setFormData((prev) => ({ ...prev, facePhoto: imageBase64 }));
        setFaceVerified(true);
        alert("✅ Wajah berhasil diverifikasi!");
      } else {
        setFaceVerified(false);
        alert("❌ Wajah tidak sesuai dengan data KTP!");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat verifikasi wajah!");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL("image/png");

    if (captureMode === "ktp") {
      setFormData((prev) => ({ ...prev, ktpPhoto: dataUrl }));
    } else if (captureMode === "face") {
      verifyFace(dataUrl);
    }

    // stop kamera
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setCaptureMode(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.ktpPhoto) {
      alert("Silakan ambil foto KTP terlebih dahulu 📸");
      return;
    }
    if (!formData.facePhoto || !faceVerified) {
      alert("Silakan lakukan scan wajah dan verifikasi terlebih dahulu 🤳");
      return;
    }

    localStorage.setItem("user_profile", JSON.stringify(formData));
    alert("Profil berhasil diperbarui 🚀");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Profil Pengguna</h1>
        <p className="text-gray-500 mb-6">Kelola informasi pribadi Anda</p>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Foto Profil */}
            <div className="flex flex-col items-center">
              {formData.profilePhoto ? (
                <img
                  src={formData.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full shadow-lg mb-3"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full mb-3">
                  <User size={48} className="text-gray-500" />
                </div>
              )}
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <ImageIcon size={18} /> Ubah Foto Profil
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Form Identitas */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" /> Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-600" /> NIK
                </label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  maxLength="16"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>
            </div>

            {/* Foto KTP */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto KTP</label>
              {formData.ktpPhoto ? (
                <img src={formData.ktpPhoto} alt="KTP" className="w-64 rounded-lg shadow mb-3" />
              ) : (
                <p className="text-gray-500 text-sm mb-2">Belum ada foto KTP</p>
              )}
              <button
                type="button"
                onClick={() => startCamera("ktp")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Camera size={18} /> Ambil Foto KTP
              </button>
            </div>

            {/* Foto Wajah */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Wajah</label>
              {formData.facePhoto ? (
                <img src={formData.facePhoto} alt="Wajah" className="w-32 h-32 object-cover rounded-full shadow mb-3" />
              ) : (
                <p className="text-gray-500 text-sm mb-2">Belum ada foto wajah</p>
              )}
              <button
                type="button"
                onClick={() => startCamera("face")}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2"
              >
                <Camera size={18} /> Scan Wajah
              </button>
              {faceVerified ? (
                <p className="text-green-600 mt-2 text-sm">✅ Wajah terverifikasi</p>
              ) : (
                <p className="text-red-600 mt-2 text-sm">❌ Belum diverifikasi</p>
              )}
            </div>

            {/* Camera Preview */}
            {captureMode && (
              <div className="mt-6">
                <video ref={videoRef} autoPlay className="w-full rounded-lg shadow" />
                <canvas ref={canvasRef} width="400" height="300" className="hidden" />
                <button
                  type="button"
                  onClick={takePhoto}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Ambil Foto
                </button>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={!formData.ktpPhoto || !formData.facePhoto || !faceVerified}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                  !formData.ktpPhoto || !formData.facePhoto || !faceVerified
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
