import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  userId?: string | number | null;
};

export default function TAndCModal({ userId = null }: Props) {
  const LOCAL_KEY = "secscan_tc_accepted_v1";
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(LOCAL_KEY);
      if (!accepted) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  async function recordConsent() {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem(LOCAL_KEY, new Date().toISOString());
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          acceptedAt: new Date().toISOString(),
          statement:
            "I confirm I will use this website only for ethical, authorized security testing purposes.",
        }),
      });
      setVisible(false);
    } catch (err: any) {
      setError("Unable to save consent to server. Local consent saved.");
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" style={{ backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32 }}
        className="max-w-3xl w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 border border-blue-900 rounded-xl shadow-2xl p-6 text-gray-100"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-inner">
              <svg width="34" height="34" viewBox="0 0 24 24" className="text-white">
                <path fill="currentColor" d="M12 2L2 7v6c0 5 5 9 10 9s10-4 10-9V7l-10-5zM11 11V6h2v5h-2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">Terms & Conditions — Ethical Use Confirmation</h2>
            <p className="text-sm text-gray-300 mb-4">
              By using this platform you confirm you will only perform security scans, crawls, or testing against systems
              that you own or have explicit, written authorization to test. Unauthorized scanning of systems you do not
              control is illegal and will not be tolerated.
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-md p-3 text-sm text-gray-300 mb-4">
              <p className="mb-2"><strong>Declaration:</strong></p>
              <p>
                I confirm I will use this website only for ethical purposes, with prior authorization from the target
                owner, and I accept full responsibility for the actions performed using this service.
              </p>
            </div>
            <label className="flex items-center gap-3 mb-3 select-none">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-5 h-5 rounded-sm bg-gray-800 border border-gray-700 checked:bg-blue-500 checked:border-blue-400"
                aria-label="I agree to the terms and will use SecScan ethically"
              />
              <span className="text-sm text-gray-300">
                I agree — I will only use this platform for ethical, authorized testing.
              </span>
            </label>
            {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                <span>Developed by Shashank Daksh</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {if (confirm("Declining blocks site use. Are you sure?")) {}}}
                  className="px-3 py-2 rounded-md text-sm bg-transparent border border-gray-700 hover:border-red-500 text-red-400"
                >Decline</button>
                <button
                  onClick={recordConsent}
                  disabled={!checked || loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${checked
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                >
                  {loading ? "Saving..." : "I Agree — Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
